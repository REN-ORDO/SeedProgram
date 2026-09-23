/**
 * Núcleo de dominio del agente entrevistador (paso 3 del formulario de
 * empresas, sub-estado A — ver spec en docs/superpowers/specs/).
 *
 * Lo importan TANTO el route handler (servidor) COMO application-form.tsx
 * (cliente). Por eso no toca `process.env` ni el SDK de Vertex: eso vive
 * aparte en `lib/entrevista-prompt.ts`, servidor-only.
 *
 * La validación de entrada (empresa/area/reto) la reutiliza directo de
 * `parseDiagnosisRequest` en lib/diagnosis.ts — el shape es idéntico al de
 * /api/diagnostico, así que no hay nada propio que duplicar acá.
 */

export const MAX_PREGUNTAS = 3;
const PREGUNTA_MAX_LEN = 240;

/**
 * Valida y recorta la respuesta del modelo. Nunca lanza: una forma
 * inesperada (no es array, strings vacíos, más de 3 elementos) se trata
 * como "sin preguntas" — el llamador debe interpretarlo como salto directo
 * al diagnóstico, nunca como error visible.
 */
export function normalizePreguntas(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((p): p is string => typeof p === "string" && p.trim().length > 0)
    .map((p) => p.trim().slice(0, PREGUNTA_MAX_LEN))
    .slice(0, MAX_PREGUNTAS);
}
