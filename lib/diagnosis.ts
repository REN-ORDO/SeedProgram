/**
 * Núcleo de dominio del diagnóstico IA para empresas patrocinadoras.
 *
 * Este módulo lo importan TANTO el route handler (servidor) COMO el
 * formulario (cliente). Por eso no puede tocar `process.env` ni el SDK de
 * Vertex: el prompt y el schema viven aparte en `lib/diagnosis-prompt.ts`.
 */
import { normalizePreguntas } from "@/lib/entrevista";

export type SolutionOption = {
  paquete?: PackageName;
  titulo: string;
  descripcion: string;
  entregable: string;
  /**
   * Frase corta que nombra el dolor operativo concreto que esta ruta
   * ataca ("dejar de cuadrar rutas a mano los lunes"), en vez de forzar la
   * opción a la forma de un paquete de desarrollo. Opcional para poder
   * seguir leyendo diagnósticos generados antes de este campo.
   */
  dolor_resuelto?: string;
  /** @deprecated Accepted only to read historical Firestore records. */
  duracion_semanas?: number;
};

export const PACKAGE_NAMES = ["Chispa", "Impulso", "Celda", "Cantera"] as const;
export type PackageName = (typeof PACKAGE_NAMES)[number];

export type Diagnosis = {
  resumen: string;
  opciones: SolutionOption[];
};

export type DiagnosisSource = "ia" | "fallback";

export const AREAS = ["cs", "operaciones", "datos", "marketing", "otro"] as const;
export type Area = (typeof AREAS)[number];

/** Mismos labels que muestra el paso 2 del formulario. */
export const AREA_LABELS: Record<Area, string> = {
  cs: "Servicio al cliente / Soporte",
  operaciones: "Procesos internos / Operaciones",
  datos: "Análisis de datos / Reportes",
  marketing: "Marketing / Ventas",
  otro: "Otro",
};

export type DiagnosisRequest = {
  empresa: string;
  area: Area;
  /** Texto libre cuando area === "otro". Cadena vacía si no aplica. */
  area_otro: string;
  reto: string;
  /**
   * Respuestas de la empresa a las preguntas del agente entrevistador
   * (sub-estado A del paso 3). Array vacío si la entrevista se saltó.
   */
  respuestas_entrevista: string[];
};

export const CHALLENGE_MIN = 20;
export const CHALLENGE_MAX = 2000;

export function normalizeArea(v: unknown): Area {
  return (AREAS as readonly string[]).includes(String(v))
    ? (v as Area)
    : "otro";
}

/**
 * Valida el body de POST /api/diagnostico. Devuelve un discriminated union
 * en vez de lanzar, para que el handler responda 400 con un mensaje claro.
 */
export function parseDiagnosisRequest(
  raw: unknown,
): { ok: true; value: DiagnosisRequest } | { ok: false; error: string } {
  if (typeof raw !== "object" || raw === null) {
    return { ok: false, error: "Body inválido." };
  }
  const o = raw as Record<string, unknown>;

  const empresa = typeof o.empresa === "string" ? o.empresa.trim() : "";
  if (empresa.length < 2 || empresa.length > 150) {
    return { ok: false, error: "El nombre de la empresa es inválido." };
  }

  const reto = typeof o.reto === "string" ? o.reto.trim() : "";
  if (reto.length < CHALLENGE_MIN) {
    return { ok: false, error: "Cuéntanos un poco más sobre el reto." };
  }
  if (reto.length > CHALLENGE_MAX) {
    return { ok: false, error: "El reto es demasiado largo." };
  }

  const area_otro =
    typeof o.area_otro === "string" ? o.area_otro.trim().slice(0, 120) : "";

  // Reutiliza la misma sanitización que las preguntas del entrevistador:
  // hasta 3 respuestas, no vacías, recortadas a una longitud razonable.
  // Este campo lo llena nuestro propio cliente (nunca es entrada directa
  // del usuario sin pasar por el paso 3), pero igual se sanea por defensa.
  const respuestas_entrevista = normalizePreguntas(o.respuestas_entrevista);

  return {
    ok: true,
    value: {
      empresa,
      area: normalizeArea(o.area),
      area_otro,
      reto,
      respuestas_entrevista,
    },
  };
}

function isSolutionOption(v: unknown): v is SolutionOption {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.titulo === "string" &&
    o.titulo.trim().length > 0 &&
    typeof o.descripcion === "string" &&
    o.descripcion.trim().length > 0 &&
    typeof o.entregable === "string" &&
    o.entregable.trim().length > 0 &&
    // dolor_resuelto es opcional (registros previos a este campo no lo
    // traen), pero si viene debe ser un string no vacío — no basura.
    (o.dolor_resuelto === undefined ||
      (typeof o.dolor_resuelto === "string" &&
        o.dolor_resuelto.trim().length > 0)) &&
    ((typeof o.paquete === "string" &&
      (PACKAGE_NAMES as readonly string[]).includes(o.paquete)) ||
      (typeof o.duracion_semanas === "number" &&
        Number.isFinite(o.duracion_semanas) &&
        Number.isInteger(o.duracion_semanas) &&
        o.duracion_semanas >= 4 &&
        o.duracion_semanas <= 16))
  );
}

export function normalizeDiagnosis(v: unknown): Diagnosis | null {
  if (!isDiagnosis(v)) return null;
  return {
    resumen: v.resumen,
    opciones: v.opciones.map((option) => ({
      ...option,
      paquete: option.paquete ?? "Impulso",
    })),
  };
}

/**
 * Guard de la respuesta del modelo. Si esto devuelve false, el handler
 * responde con el fallback: preferimos plantilla honesta a JSON roto.
 */
export function isDiagnosis(v: unknown): v is Diagnosis {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  if (typeof o.resumen !== "string" || o.resumen.trim().length === 0) return false;
  if (!Array.isArray(o.opciones) || o.opciones.length !== 3) return false;
  return o.opciones.every(isSolutionOption);
}

// ============================================================
// Fallbacks estáticos por área
// ============================================================
// Se usan cuando Vertex falla, no hay credenciales, o la respuesta no
// cumple el schema. Son rutas típicas, deliberadamente genéricas: el copy
// del panel avisa que un mentor Senior leerá el caso personalmente.

const FALLBACK_SUMMARY =
  "Todavía no pudimos procesar tu reto automáticamente, así que un mentor Senior de CooWeb lo va a leer personalmente. Mientras tanto, estas son rutas típicas por las que solemos empezar en casos como el tuyo.";

const FALLBACKS: Record<Area, SolutionOption[]> = {
  cs: [
    {
      titulo: "Asistente de respuestas frecuentes",
      descripcion:
        "Un semillero recopila tus preguntas repetidas y arma un asistente que responde con la información real de tu negocio, conectado al canal que ya usas.",
      entregable: "Asistente funcional en tu canal de atención, con panel para actualizar respuestas.",
      paquete: "Chispa",
      dolor_resuelto: "Responder lo mismo una y otra vez",
    },
    {
      titulo: "Tablero de conversaciones",
      descripcion:
        "Centralizamos lo que llega por distintos canales en un solo tablero, con etiquetas y prioridades, para que tu equipo deje de saltar entre apps.",
      entregable: "Tablero web con bandeja unificada y reporte semanal de volumen.",
      paquete: "Impulso",
      dolor_resuelto: "Saltar entre apps para atender un mismo caso",
    },
    {
      titulo: "Mapa del recorrido de soporte",
      descripcion:
        "Antes de automatizar, medimos: dónde se traba tu atención, qué toma más tiempo y qué se puede resolver solo. Termina en un plan priorizado.",
      entregable: "Diagnóstico documentado con métricas y roadmap de automatización.",
      paquete: "Celda",
      dolor_resuelto: "No saber con certeza dónde se traba tu atención",
    },
  ],
  operaciones: [
    {
      titulo: "Automatización de una tarea repetitiva",
      descripcion:
        "Elegimos el proceso manual que más horas te consume y lo automatizamos punta a punta, conectando las herramientas que ya usas.",
      entregable: "Flujo automatizado en producción con documentación de uso.",
      paquete: "Chispa",
      dolor_resuelto: "La tarea manual que más horas le roba a tu equipo",
    },
    {
      titulo: "Herramienta interna a medida",
      descripcion:
        "Reemplazamos ese archivo compartido que todos editan por una herramienta web con roles, historial y validaciones.",
      entregable: "Aplicación interna desplegada, con manual y capacitación al equipo.",
      paquete: "Impulso",
      dolor_resuelto: "El archivo compartido que todos editan y se daña",
    },
    {
      titulo: "Mapa de procesos y plan de mejora",
      descripcion:
        "Levantamos cómo trabaja hoy tu equipo, detectamos los cuellos de botella y priorizamos qué conviene atacar primero.",
      entregable: "Mapa de procesos documentado y plan priorizado de automatización.",
      paquete: "Celda",
      dolor_resuelto: "No saber por dónde empezar a automatizar",
    },
  ],
  datos: [
    {
      titulo: "Tablero de indicadores",
      descripcion:
        "Conectamos tus fuentes de datos actuales y armamos un tablero que se actualiza solo, con los indicadores que de verdad usas para decidir.",
      entregable: "Tablero web con datos en vivo y definición escrita de cada indicador.",
      paquete: "Chispa",
      dolor_resuelto: "Revisar varias fuentes a mano para decidir algo",
    },
    {
      titulo: "Reportes automáticos",
      descripcion:
        "Ese reporte que alguien arma a mano cada semana pasa a generarse y enviarse solo, siempre con el mismo formato.",
      entregable: "Reporte programado con envío automático y plantilla versionada.",
      paquete: "Impulso",
      dolor_resuelto: "El reporte que alguien arma a mano cada semana",
    },
    {
      titulo: "Ordenar la casa de los datos",
      descripcion:
        "Revisamos de dónde salen tus datos, limpiamos duplicados e inconsistencias y dejamos una base confiable para construir encima.",
      entregable: "Base de datos consolidada y documentación de fuentes.",
      paquete: "Celda",
      dolor_resuelto: "No confiar en tus propios datos duplicados",
    },
  ],
  marketing: [
    {
      titulo: "Landing page que convierte",
      descripcion:
        "Diseñamos y construimos una página enfocada en una sola acción, con analítica configurada desde el día uno para saber qué funciona.",
      entregable: "Landing publicada, responsive, con métricas de conversión activas.",
      paquete: "Chispa",
      dolor_resuelto: "No saber qué tan bien convierte tu página hoy",
    },
    {
      titulo: "Automatización del seguimiento comercial",
      descripcion:
        "Conectamos tus formularios con tu CRM y armamos el seguimiento automático, para que ningún prospecto se enfríe por olvido.",
      entregable: "Flujo de captación y seguimiento integrado, con tablero de estados.",
      paquete: "Impulso",
      dolor_resuelto: "Que un lead se enfríe porque nadie le escribió a tiempo",
    },
    {
      titulo: "Auditoría digital y plan",
      descripcion:
        "Revisamos tu presencia actual — sitio, velocidad, analítica, contenidos — y armamos un plan priorizado por impacto.",
      entregable: "Informe de auditoría con plan de acción priorizado.",
      paquete: "Celda",
      dolor_resuelto: "No saber qué de tu presencia digital vale la pena arreglar primero",
    },
  ],
  otro: [
    {
      titulo: "Prototipo para validar la idea",
      descripcion:
        "Construimos una versión mínima y funcional de lo que tienes en mente, suficiente para ponerla frente a usuarios reales y aprender.",
      entregable: "Prototipo navegable desplegado y documento de aprendizajes.",
      paquete: "Chispa",
      dolor_resuelto: "No tener nada tangible para poner frente a usuarios reales",
    },
    {
      titulo: "Descubrimiento técnico",
      descripcion:
        "Una dupla junior + mentor Senior levanta tu situación actual, define el alcance real del reto y propone por dónde empezar.",
      entregable: "Documento de alcance con opciones técnicas y esfuerzo estimado.",
      paquete: "Impulso",
      dolor_resuelto: "No tener claro por dónde empezar",
    },
    {
      titulo: "Célula de desarrollo dedicada",
      descripcion:
        "Un joven talento acompañado por un mentor Senior trabaja tu reto en ciclos cortos, con entregas revisables cada semana.",
      entregable: "Entregas semanales funcionales y traspaso documentado al cierre.",
      paquete: "Cantera",
      dolor_resuelto: "Necesitar manos dedicadas a un reto de mayor alcance",
    },
  ],
};

export function fallbackFor(area: Area): Diagnosis {
  return { resumen: FALLBACK_SUMMARY, opciones: FALLBACKS[area] };
}
