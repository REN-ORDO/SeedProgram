/**
 * POST /api/diagnostico
 *
 * Recibe el reto que escribió una empresa y devuelve un diagnóstico con tres
 * rutas de solución, generado con Gemini sobre Vertex AI.
 *
 * Contrato: este endpoint NUNCA devuelve 500. Si Vertex falla, faltan
 * credenciales, vence el timeout o la respuesta no cumple el schema,
 * responde 200 con las rutas de fallback y `fuente: "fallback"`. El
 * formulario del cliente no se puede quedar bloqueado por la IA.
 */
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import {
  fallbackFor,
  isDiagnosis,
  parseDiagnosisRequest,
  type Diagnosis,
  type DiagnosisRequest,
} from "@/lib/diagnosis";
import {
  RESPONSE_SCHEMA,
  SYSTEM_PROMPT,
  buildUserPrompt,
} from "@/lib/diagnosis-prompt";

// El SDK de Vertex necesita APIs de Node (crypto, fs para el auth), no corre
// en el runtime Edge.
export const runtime = "nodejs";
export const maxDuration = 30;

const TIMEOUT_MS = 25_000;
const DEFAULT_MODEL = "gemini-2.5-flash";
const DEFAULT_LOCATION = "us-central1";

// ---- Rate limit (best-effort) ----------------------------------
// Mapa en memoria por IP. En serverless cada instancia tiene el suyo, así que
// el límite real es más alto que 8/hora. Sirve para frenar un bucle
// accidental del cliente, no un ataque decidido. Si aparece abuso real, el
// siguiente paso es Turnstile o un token de sesión (fuera de alcance).
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 8;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  // Poda barata para que el mapa no crezca sin techo en instancias longevas.
  if (hits.size > 500) {
    for (const [k, v] of hits) {
      if (v.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
    }
  }
  return recent.length > MAX_PER_WINDOW;
}

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

// ---- Vertex ----------------------------------------------------

type ServiceAccount = { project_id?: string };

/**
 * Lee la service account desde GOOGLE_SERVICE_ACCOUNT_JSON (base64 del JSON).
 * Devuelve null si falta o está corrupta, para caer al fallback sin romper.
 */
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

async function generateWithVertex(req: DiagnosisRequest): Promise<Diagnosis | null> {
  const creds = loadCredentials();
  if (!creds) {
    console.warn(
      "[diagnostico] GOOGLE_SERVICE_ACCOUNT_JSON ausente o inválida — usando fallback.",
    );
    return null;
  }

  const ai = new GoogleGenAI({
    vertexai: true,
    project: creds.projectId,
    location: process.env.VERTEX_LOCATION ?? DEFAULT_LOCATION,
    googleAuthOptions: { credentials: creds.credentials },
  });

  // El AbortController corta de verdad la petición a Vertex al vencer el
  // timeout. Sin él, Promise.race solo dejaría de esperar y la llamada
  // seguiría corriendo (y cobrándose) después de que ya respondimos.
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
        temperature: 0.8,
        maxOutputTokens: 2048,
      },
    });

    const text = res.text;
    if (!text) return null;

    const parsed: unknown = JSON.parse(text);
    return isDiagnosis(parsed) ? parsed : null;
  } finally {
    clearTimeout(timer);
  }
}

// ---- Handler ---------------------------------------------------

export async function POST(request: Request) {
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

  if (rateLimited(clientIp(request))) {
    return NextResponse.json(
      { ...fallbackFor(parsed.value.area), fuente: "fallback" },
      { status: 200 },
    );
  }

  try {
    const diagnostico = await generateWithVertex(parsed.value);
    if (diagnostico) {
      return NextResponse.json({ ...diagnostico, fuente: "ia" }, { status: 200 });
    }
  } catch (err) {
    console.error("[diagnostico] Vertex falló:", err);
  }

  return NextResponse.json(
    { ...fallbackFor(parsed.value.area), fuente: "fallback" },
    { status: 200 },
  );
}
