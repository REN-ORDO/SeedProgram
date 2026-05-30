/**
 * Persistencia de borradores del formulario de postulación en localStorage.
 *
 * Estrategia (decidida con el líder):
 *   - localStorage con TTL de 48h → "empieza hoy, termina mañana".
 *   - Se limpia automáticamente al enviar con éxito.
 *   - Banner "Tienes un borrador guardado" con opción de descartar al volver.
 *
 * Privacidad: guarda datos personales (nombre, email, teléfono...). El TTL
 * + la limpieza al enviar + el banner de descarte mitigan el riesgo en
 * dispositivos compartidos. El CV (File) NO se serializa — solo el nombre,
 * para recordarle al usuario que vuelva a adjuntarlo.
 */

export type DraftRole = "aspirante" | "empresa";

export type FormDraft = {
  savedAt: number;
  role: DraftRole;
  values: Record<string, string>;
  cvFileName: string | null;
};

const KEY = "cooweb-postulacion-draft";
const TTL_MS = 48 * 60 * 60 * 1000; // 48 horas

function hasMeaningfulData(values: Record<string, string>): boolean {
  return Object.values(values).some((v) => typeof v === "string" && v.trim() !== "");
}

export function saveDraft(draft: Omit<FormDraft, "savedAt">): void {
  if (typeof window === "undefined") return;
  // No persistir borradores vacíos (evita banner fantasma).
  if (!hasMeaningfulData(draft.values)) return;
  try {
    const payload: FormDraft = { ...draft, savedAt: Date.now() };
    window.localStorage.setItem(KEY, JSON.stringify(payload));
  } catch {
    // localStorage lleno / bloqueado (modo incógnito estricto) → ignorar.
  }
}

export function loadDraft(): FormDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw) as FormDraft;
    // Expirar borradores viejos.
    if (
      typeof draft.savedAt !== "number" ||
      Date.now() - draft.savedAt > TTL_MS
    ) {
      window.localStorage.removeItem(KEY);
      return null;
    }
    if (!draft.values || !hasMeaningfulData(draft.values)) {
      window.localStorage.removeItem(KEY);
      return null;
    }
    return draft;
  } catch {
    return null;
  }
}

export function clearDraft(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* noop */
  }
}

/** Formatea cuánto hace que se guardó el borrador, en español. */
export function draftAge(savedAt: number): string {
  const mins = Math.floor((Date.now() - savedAt) / 60000);
  if (mins < 1) return "hace un momento";
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs} ${hrs === 1 ? "hora" : "horas"}`;
  const days = Math.floor(hrs / 24);
  return `hace ${days} ${days === 1 ? "día" : "días"}`;
}
