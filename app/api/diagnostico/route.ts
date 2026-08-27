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

// ---- Defensa del endpoint --------------------------------------
// Este endpoint es publico y cada llamada a Vertex cuesta dinero, asi que
// se defiende en cuatro capas, de la mas barata a la mas cara:
//
//   1. Tamano del body      — corta antes de leer nada.
//   2. Origen               — corta el scripting desde fuera del sitio.
//   3. Tope global de la instancia — acota el gasto aunque el atacante rote IPs.
//   4. Tope por IP          — frena al usuario individual y al bucle accidental.
//
// Ninguna de estas capas es una garantia dura: en serverless el estado en
// memoria vive por instancia, asi que las capas 3 y 4 limitan por instancia,
// no globalmente. Siguen siendo utiles (acotan el gasto de cada instancia y
// frenan lo torpe), pero la barrera real de produccion es la regla de rate
// limit del WAF de Vercel sobre esta ruta. Ver docs/superpowers/specs/.

const WINDOW_MS = 60 * 60 * 1000;

/** Tope por IP: un humano real no pide 8 diagnosticos en una hora. */
const MAX_PER_IP = 8;

/**
 * Tope global de la instancia. Es la capa que de verdad acota el gasto: aunque
 * el atacante rote IPs, cada instancia deja de llamar a Vertex al llegar aca.
 * Dimensionado muy por encima del trafico esperado del formulario.
 */
const MAX_PER_INSTANCE = 60;

/** El reto tiene un tope de 2000 caracteres; 16 KB deja aire de sobra. */
const MAX_BODY_BYTES = 16 * 1024;

const hitsByIp = new Map<string, number[]>();
let instanceHits: number[] = [];

function prune(times: number[], now: number): number[] {
  return times.filter((t) => now - t < WINDOW_MS);
}

/** Capa 4: tope por IP. Registra el intento y dice si se paso. */
function ipLimited(ip: string, now: number): boolean {
  const recent = prune(hitsByIp.get(ip) ?? [], now);
  recent.push(now);
  hitsByIp.set(ip, recent);
  // Poda barata para que el mapa no crezca sin techo en instancias longevas.
  if (hitsByIp.size > 500) {
    for (const [k, v] of hitsByIp) {
      if (v.every((t) => now - t >= WINDOW_MS)) hitsByIp.delete(k);
    }
  }
  return recent.length > MAX_PER_IP;
}

/** Capa 3: tope global de la instancia. */
function instanceLimited(now: number): boolean {
  instanceHits = prune(instanceHits, now);
  instanceHits.push(now);
  return instanceHits.length > MAX_PER_INSTANCE;
}

/** Capa 1: rechaza bodies desproporcionados sin llegar a leerlos. */
function bodyTooLarge(req: Request): boolean {
  const len = Number(req.headers.get("content-length"));
  return Number.isFinite(len) && len > MAX_BODY_BYTES;
}

/**
 * Capa 2: el formulario siempre manda Origin (es una peticion same-origin del
 * navegador). Si viene de otro sitio, no es nuestro formulario.
 *
 * Ausencia de Origin NO se bloquea: curl y algunos clientes legitimos no lo
 * mandan, y este chequeo es para frenar scripting torpe, no para autenticar.
 */
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

/**
 * Respuesta de "no vamos a llamar a Vertex por esta". Sale 200 con el fallback
 * a proposito: el usuario legitimo que choca con un limite igual completa su
 * postulacion, solo que con las rutas de plantilla.
 */
function fallbackResponse(area: Parameters<typeof fallbackFor>[0]) {
  return NextResponse.json(
    { ...fallbackFor(area), fuente: "fallback" },
    { status: 200 },
  );
}

export async function POST(request: Request) {
  // Capa 1: body desproporcionado. Antes de leer nada, y sin area todavia,
  // asi que aca si respondemos 413 en vez de fallback.
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

  // Capa 2: peticion desde otro sitio. No es nuestro formulario.
  if (foreignOrigin(request)) {
    console.warn(
      "[diagnostico] Origin ajeno rechazado:",
      request.headers.get("origin"),
    );
    return fallbackResponse(parsed.value.area);
  }

  // Capas 3 y 4: topes de frecuencia. El global va primero para que un
  // atacante que rota IPs no infle el mapa por IP antes de ser frenado.
  const now = Date.now();
  if (instanceLimited(now)) {
    console.warn("[diagnostico] Tope de la instancia alcanzado — usando fallback.");
    return fallbackResponse(parsed.value.area);
  }
  if (ipLimited(clientIp(request), now)) {
    console.warn("[diagnostico] Tope por IP alcanzado — usando fallback.");
    return fallbackResponse(parsed.value.area);
  }

  try {
    const diagnostico = await generateWithVertex(parsed.value);
    if (diagnostico) {
      return NextResponse.json({ ...diagnostico, fuente: "ia" }, { status: 200 });
    }
  } catch (err) {
    console.error("[diagnostico] Vertex falló:", err);
  }

  return fallbackResponse(parsed.value.area);
}
