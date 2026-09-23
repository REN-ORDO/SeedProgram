/**
 * POST /api/entrevista
 *
 * Agente entrevistador: recibe el reto que escribió una empresa y devuelve
 * 0 a 3 preguntas de profundización, generadas con Gemini sobre Vertex AI.
 * Es el sub-estado A del paso 3 del wizard de empresas — ver spec en
 * docs/superpowers/specs/2026-09-23-agentes-entrevista-diagnostico-empresas-design.md.
 *
 * Contrato: este endpoint NUNCA devuelve 500. Si Vertex falla, faltan
 * credenciales, vence el timeout o la respuesta no cumple el schema,
 * responde 200 con `preguntas: []` y `fuente: "fallback"`. El cliente
 * interpreta un array vacío (de cualquier fuente) como "saltar la
 * entrevista y pasar directo al diagnóstico" — nunca como error visible.
 */
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { parseDiagnosisRequest, type DiagnosisRequest } from "@/lib/diagnosis";
import { normalizePreguntas } from "@/lib/entrevista";
import {
  RESPONSE_SCHEMA,
  SYSTEM_PROMPT,
  buildUserPrompt,
} from "@/lib/entrevista-prompt";

// El SDK de Vertex necesita APIs de Node (crypto, fs para el auth), no corre
// en el runtime Edge.
export const runtime = "nodejs";
export const maxDuration = 30;

const TIMEOUT_MS = 25_000;
const DEFAULT_MODEL = "gemini-2.5-flash";
const DEFAULT_LOCATION = "us-central1";

// ---- Defensa del endpoint --------------------------------------
// Mismas 4 capas que /api/diagnostico (ver ese route.ts para el detalle de
// cada una). Los mapas de rate limit son propios de este endpoint: la
// entrevista y el diagnóstico son dos llamadas por sesión de formulario y
// no deben compartir cupo entre sí.

const WINDOW_MS = 60 * 60 * 1000;

/** Tope por IP: un humano real no pide 8 entrevistas en una hora. */
const MAX_PER_IP = 8;

/** Tope global de la instancia — acota el gasto aunque el atacante rote IPs. */
const MAX_PER_INSTANCE = 60;

/** El reto tiene un tope de 2000 caracteres; 16 KB deja aire de sobra. */
const MAX_BODY_BYTES = 16 * 1024;

const hitsByIp = new Map<string, number[]>();
let instanceHits: number[] = [];

function prune(times: number[], now: number): number[] {
  return times.filter((t) => now - t < WINDOW_MS);
}

function ipLimited(ip: string, now: number): boolean {
  const recent = prune(hitsByIp.get(ip) ?? [], now);
  recent.push(now);
  hitsByIp.set(ip, recent);
  if (hitsByIp.size > 500) {
    for (const [k, v] of hitsByIp) {
      if (v.every((t) => now - t >= WINDOW_MS)) hitsByIp.delete(k);
    }
  }
  return recent.length > MAX_PER_IP;
}

function instanceLimited(now: number): boolean {
  instanceHits = prune(instanceHits, now);
  instanceHits.push(now);
  return instanceHits.length > MAX_PER_INSTANCE;
}

function bodyTooLarge(req: Request): boolean {
  const len = Number(req.headers.get("content-length"));
  return Number.isFinite(len) && len > MAX_BODY_BYTES;
}

function foreignOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host !== new URL(req.url).host;
  } catch {
    return true;
  }
}

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

// ---- Vertex ----------------------------------------------------

type ServiceAccount = { project_id?: string };

function loadCredentials(): { credentials: ServiceAccount; projectId: string } | null {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;
  try {
    const json = JSON.parse(
      Buffer.from(raw, "base64").toString("utf8"),
    ) as ServiceAccount;
    if (!json.project_id) return null;
    return { credentials: json, projectId: json.project_id };
  } catch {
    return null;
  }
}

async function generateWithVertex(req: DiagnosisRequest): Promise<string[] | null> {
  const creds = loadCredentials();
  if (!creds) {
    console.warn(
      "[entrevista] GOOGLE_SERVICE_ACCOUNT_JSON ausente o inválida — usando fallback.",
    );
    return null;
  }

  const ai = new GoogleGenAI({
    vertexai: true,
    project: creds.projectId,
    location: process.env.VERTEX_LOCATION ?? DEFAULT_LOCATION,
    googleAuthOptions: { credentials: creds.credentials },
  });

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);

  try {
    const res = await ai.models.generateContent({
      model: process.env.VERTEX_MODEL ?? DEFAULT_MODEL,
      contents: [{ role: "user", parts: [{ text: buildUserPrompt(req) }] }],
      config: {
        abortSignal: ctrl.signal,
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        temperature: 0.6,
        maxOutputTokens: 1024,
      },
    });

    const text = res.text;
    if (!text) return null;

    const parsed: unknown = JSON.parse(text);
    if (typeof parsed !== "object" || parsed === null) return null;
    const preguntas = (parsed as Record<string, unknown>).preguntas;
    return normalizePreguntas(preguntas);
  } finally {
    clearTimeout(timer);
  }
}

// ---- Handler ---------------------------------------------------

function fallbackResponse() {
  return NextResponse.json({ preguntas: [], fuente: "fallback" }, { status: 200 });
}

export async function POST(request: Request) {
  if (bodyTooLarge(request)) {
    return NextResponse.json({ error: "Body demasiado grande." }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body inválido." }, { status: 400 });
  }

  const parsed = parseDiagnosisRequest(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  if (foreignOrigin(request)) {
    console.warn(
      "[entrevista] Origin ajeno rechazado:",
      request.headers.get("origin"),
    );
    return fallbackResponse();
  }

  const now = Date.now();
  if (instanceLimited(now)) {
    console.warn("[entrevista] Tope de la instancia alcanzado — usando fallback.");
    return fallbackResponse();
  }
  if (ipLimited(clientIp(request), now)) {
    console.warn("[entrevista] Tope por IP alcanzado — usando fallback.");
    return fallbackResponse();
  }

  try {
    const preguntas = await generateWithVertex(parsed.value);
    if (preguntas !== null) {
      return NextResponse.json({ preguntas, fuente: "ia" }, { status: 200 });
    }
  } catch (err) {
    console.error("[entrevista] Vertex falló:", err);
  }

  return fallbackResponse();
}
