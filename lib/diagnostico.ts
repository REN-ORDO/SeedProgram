/**
 * Núcleo de dominio del diagnóstico IA para empresas patrocinadoras.
 *
 * Este módulo lo importan TANTO el route handler (servidor) COMO el
 * formulario (cliente). Por eso no puede tocar `process.env` ni el SDK de
 * Vertex: el prompt y el schema viven aparte en `lib/diagnostico-prompt.ts`.
 */

export type OpcionDiagnostico = {
  titulo: string;
  descripcion: string;
  entregable: string;
  duracion_semanas: number;
};

export type Diagnostico = {
  resumen: string;
  opciones: OpcionDiagnostico[];
};

export type FuenteDiagnostico = "ia" | "fallback";

export type DiagnosticoResponse = Diagnostico & { fuente: FuenteDiagnostico };

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

export type DiagnosticoRequest = {
  empresa: string;
  area: Area;
  /** Texto libre cuando area === "otro". Cadena vacía si no aplica. */
  area_otro: string;
  reto: string;
};

export const RETO_MIN = 20;
export const RETO_MAX = 2000;

export function normalizeArea(v: unknown): Area {
  return (AREAS as readonly string[]).includes(String(v))
    ? (v as Area)
    : "otro";
}

/**
 * Valida el body de POST /api/diagnostico. Devuelve un discriminated union
 * en vez de lanzar, para que el handler responda 400 con un mensaje claro.
 */
export function parseDiagnosticoRequest(
  raw: unknown,
): { ok: true; value: DiagnosticoRequest } | { ok: false; error: string } {
  if (typeof raw !== "object" || raw === null) {
    return { ok: false, error: "Body inválido." };
  }
  const o = raw as Record<string, unknown>;

  const empresa = typeof o.empresa === "string" ? o.empresa.trim() : "";
  if (empresa.length < 2 || empresa.length > 150) {
    return { ok: false, error: "El nombre de la empresa es inválido." };
  }

  const reto = typeof o.reto === "string" ? o.reto.trim() : "";
  if (reto.length < RETO_MIN) {
    return { ok: false, error: "Cuéntanos un poco más sobre el reto." };
  }
  if (reto.length > RETO_MAX) {
    return { ok: false, error: "El reto es demasiado largo." };
  }

  const area_otro =
    typeof o.area_otro === "string" ? o.area_otro.trim().slice(0, 120) : "";

  return { ok: true, value: { empresa, area: normalizeArea(o.area), area_otro, reto } };
}

function isOpcion(v: unknown): v is OpcionDiagnostico {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.titulo === "string" &&
    o.titulo.trim().length > 0 &&
    typeof o.descripcion === "string" &&
    o.descripcion.trim().length > 0 &&
    typeof o.entregable === "string" &&
    o.entregable.trim().length > 0 &&
    typeof o.duracion_semanas === "number" &&
    Number.isFinite(o.duracion_semanas) &&
    o.duracion_semanas >= 4 &&
    o.duracion_semanas <= 16
  );
}

/**
 * Guard de la respuesta del modelo. Si esto devuelve false, el handler
 * responde con el fallback: preferimos plantilla honesta a JSON roto.
 */
export function isDiagnostico(v: unknown): v is Diagnostico {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  if (typeof o.resumen !== "string" || o.resumen.trim().length === 0) return false;
  if (!Array.isArray(o.opciones) || o.opciones.length !== 3) return false;
  return o.opciones.every(isOpcion);
}

// ============================================================
// Fallbacks estáticos por área
// ============================================================
// Se usan cuando Vertex falla, no hay credenciales, o la respuesta no
// cumple el schema. Son rutas típicas, deliberadamente genéricas: el copy
// del panel avisa que un mentor Senior leerá el caso personalmente.

const FALLBACK_RESUMEN =
  "Todavía no pudimos procesar tu reto automáticamente, así que un mentor Senior de CooWeb lo va a leer personalmente. Mientras tanto, estas son rutas típicas por las que solemos empezar en casos como el tuyo.";

const FALLBACKS: Record<Area, OpcionDiagnostico[]> = {
  cs: [
    {
      titulo: "Asistente de respuestas frecuentes",
      descripcion:
        "Un semillero recopila tus preguntas repetidas y arma un asistente que responde con la información real de tu negocio, conectado al canal que ya usas.",
      entregable: "Asistente funcional en tu canal de atención, con panel para actualizar respuestas.",
      duracion_semanas: 6,
    },
    {
      titulo: "Tablero de conversaciones",
      descripcion:
        "Centralizamos lo que llega por distintos canales en un solo tablero, con etiquetas y prioridades, para que tu equipo deje de saltar entre apps.",
      entregable: "Tablero web con bandeja unificada y reporte semanal de volumen.",
      duracion_semanas: 8,
    },
    {
      titulo: "Mapa del recorrido de soporte",
      descripcion:
        "Antes de automatizar, medimos: dónde se traba tu atención, qué toma más tiempo y qué se puede resolver solo. Termina en un plan priorizado.",
      entregable: "Diagnóstico documentado con métricas y roadmap de automatización.",
      duracion_semanas: 4,
    },
  ],
  operaciones: [
    {
      titulo: "Automatización de una tarea repetitiva",
      descripcion:
        "Elegimos el proceso manual que más horas te consume y lo automatizamos punta a punta, conectando las herramientas que ya usas.",
      entregable: "Flujo automatizado en producción con documentación de uso.",
      duracion_semanas: 6,
    },
    {
      titulo: "Herramienta interna a medida",
      descripcion:
        "Reemplazamos ese archivo compartido que todos editan por una herramienta web con roles, historial y validaciones.",
      entregable: "Aplicación interna desplegada, con manual y capacitación al equipo.",
      duracion_semanas: 10,
    },
    {
      titulo: "Mapa de procesos y plan de mejora",
      descripcion:
        "Levantamos cómo trabaja hoy tu equipo, detectamos los cuellos de botella y priorizamos qué conviene atacar primero.",
      entregable: "Mapa de procesos documentado y plan priorizado de automatización.",
      duracion_semanas: 4,
    },
  ],
  datos: [
    {
      titulo: "Tablero de indicadores",
      descripcion:
        "Conectamos tus fuentes de datos actuales y armamos un tablero que se actualiza solo, con los indicadores que de verdad usas para decidir.",
      entregable: "Tablero web con datos en vivo y definición escrita de cada indicador.",
      duracion_semanas: 8,
    },
    {
      titulo: "Reportes automáticos",
      descripcion:
        "Ese reporte que alguien arma a mano cada semana pasa a generarse y enviarse solo, siempre con el mismo formato.",
      entregable: "Reporte programado con envío automático y plantilla versionada.",
      duracion_semanas: 6,
    },
    {
      titulo: "Ordenar la casa de los datos",
      descripcion:
        "Revisamos de dónde salen tus datos, limpiamos duplicados e inconsistencias y dejamos una base confiable para construir encima.",
      entregable: "Base de datos consolidada y documentación de fuentes.",
      duracion_semanas: 8,
    },
  ],
  marketing: [
    {
      titulo: "Landing page que convierte",
      descripcion:
        "Diseñamos y construimos una página enfocada en una sola acción, con analítica configurada desde el día uno para saber qué funciona.",
      entregable: "Landing publicada, responsive, con métricas de conversión activas.",
      duracion_semanas: 5,
    },
    {
      titulo: "Automatización del seguimiento comercial",
      descripcion:
        "Conectamos tus formularios con tu CRM y armamos el seguimiento automático, para que ningún prospecto se enfríe por olvido.",
      entregable: "Flujo de captación y seguimiento integrado, con tablero de estados.",
      duracion_semanas: 6,
    },
    {
      titulo: "Auditoría digital y plan",
      descripcion:
        "Revisamos tu presencia actual — sitio, velocidad, analítica, contenidos — y armamos un plan priorizado por impacto.",
      entregable: "Informe de auditoría con plan de acción priorizado.",
      duracion_semanas: 4,
    },
  ],
  otro: [
    {
      titulo: "Prototipo para validar la idea",
      descripcion:
        "Construimos una versión mínima y funcional de lo que tienes en mente, suficiente para ponerla frente a usuarios reales y aprender.",
      entregable: "Prototipo navegable desplegado y documento de aprendizajes.",
      duracion_semanas: 6,
    },
    {
      titulo: "Descubrimiento técnico",
      descripcion:
        "Una dupla junior + mentor Senior levanta tu situación actual, define el alcance real del reto y propone por dónde empezar.",
      entregable: "Documento de alcance con opciones técnicas y esfuerzo estimado.",
      duracion_semanas: 4,
    },
    {
      titulo: "Célula de desarrollo dedicada",
      descripcion:
        "Un joven talento acompañado por un mentor Senior trabaja tu reto en ciclos cortos, con entregas revisables cada semana.",
      entregable: "Entregas semanales funcionales y traspaso documentado al cierre.",
      duracion_semanas: 12,
    },
  ],
};

export function fallbackFor(area: Area): Diagnostico {
  return { resumen: FALLBACK_RESUMEN, opciones: FALLBACKS[area] };
}
