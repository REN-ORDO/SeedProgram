/**
 * Helpers compartidos por las vistas del admin panel.
 */

import type { Timestamp } from "firebase/firestore";

export type AppStatus = "pending" | "reviewed" | "accepted" | "rejected";

export const STATUS_META: Record<
  AppStatus,
  { label: string; bg: string; text: string }
> = {
  pending: {
    label: "Pendiente",
    bg: "var(--color-bg-soft)",
    text: "var(--color-fg-muted)",
  },
  reviewed: {
    label: "Revisado",
    bg: "var(--color-bg-sky)",
    text: "var(--color-ink)",
  },
  accepted: {
    label: "Aceptado",
    bg: "var(--color-accent)",
    text: "#ffffff",
  },
  rejected: {
    label: "Rechazado",
    bg: "#fee2e2",
    text: "#991b1b",
  },
};

export function formatFirestoreDate(
  ts: Timestamp | undefined | null,
): string {
  if (!ts) return "—";
  try {
    return ts.toDate().toLocaleString("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

export function timeAgo(ts: Timestamp | undefined | null): string {
  if (!ts) return "—";
  try {
    const date = ts.toDate();
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return "hace un momento";
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `hace ${mins} min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `hace ${hrs}h`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `hace ${days}d`;
    const months = Math.floor(days / 30);
    if (months < 12) return `hace ${months} mes${months > 1 ? "es" : ""}`;
    const years = Math.floor(months / 12);
    return `hace ${years}a`;
  } catch {
    return "—";
  }
}

/**
 * Convierte un array de objetos a CSV. Maneja escaping de comillas y
 * caracteres especiales. Útil para export.
 */
export function toCSV(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Array.from(new Set(rows.flatMap((r) => Object.keys(r))));
  const lines = [
    headers.map(escapeCsvCell).join(","),
    ...rows.map((r) => headers.map((h) => escapeCsvCell(r[h])).join(",")),
  ];
  return lines.join("\r\n");
}

// ============================================================
// CSV export con formato Excel (columnas definidas + headers ES)
// ============================================================

export type CsvColumn = {
  header: string;
  value: (row: Record<string, unknown>) => string;
};

/** Escapa un valor para una celda CSV (comillas, comas, saltos de línea). */
function escapeCsvCell(v: unknown): string {
  if (v === null || v === undefined) return "";
  let s: string;
  if (typeof v === "object" && v !== null && "toDate" in v) {
    try {
      s = csvDate(v as Timestamp);
    } catch {
      s = String(v);
    }
  } else {
    s = String(v);
  }
  // Excel/CSV: si contiene comillas, comas, ; o saltos, envolver en comillas
  // y duplicar las comillas internas.
  if (/["\n\r,;]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/** Fecha legible para Excel: DD/MM/YYYY HH:mm (Excel es-CO la reconoce). */
export function csvDate(ts: Timestamp | undefined | null): string {
  if (!ts) return "";
  try {
    const d = ts.toDate();
    const p = (n: number) => String(n).padStart(2, "0");
    return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(
      d.getHours(),
    )}:${p(d.getMinutes())}`;
  } catch {
    return "";
  }
}

/**
 * Construye un CSV a partir de columnas definidas (header + value).
 * Usa separador coma y terminación CRLF (estándar Excel).
 */
export function buildCsv(
  rows: Record<string, unknown>[],
  columns: CsvColumn[],
): string {
  const head = columns.map((c) => escapeCsvCell(c.header)).join(",");
  const body = rows.map((r) =>
    columns.map((c) => escapeCsvCell(c.value(r))).join(","),
  );
  return [head, ...body].join("\r\n");
}

export function downloadCSV(filename: string, content: string) {
  // BOM UTF-8 (﻿): hace que Excel interprete acentos/ñ correctamente.
  const blob = new Blob(["﻿" + content], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ============================================================
// Definiciones de columnas por colección (orden + traducción)
// ============================================================

const str = (row: Record<string, unknown>, key: string): string => {
  const v = row[key];
  return v === null || v === undefined ? "" : String(v);
};

const ESTUDIA_MAP: Record<string, string> = {
  tecnico: "Sí, técnico / tecnólogo",
  universitario: "Sí, universitario",
  no: "No estudia actualmente",
  otro: "Otro",
};

const ORIGEN_MAP: Record<string, string> = {
  feria: "Feria de empleo / Evento",
  redes: "Redes sociales",
  web: "Página web",
  referido: "Recomendación",
  otro: "Otro",
};

const AREA_MAP: Record<string, string> = {
  cs: "Servicio al cliente / Soporte",
  operaciones: "Procesos internos / Operaciones",
  datos: "Análisis de datos / Reportes",
  marketing: "Marketing / Ventas",
  otro: "Otro",
};

const MODALIDAD_MAP: Record<string, string> = {
  patrocinio: "Patrocinar semillero",
  mentoria: "Mentoría / charlas técnicas",
  empleo: "Prácticas / vacantes",
  otro: "Otro",
};

const INTERES_LEGACY: Record<string, string> = {
  tecnologia: "Aprender tecnología e IA",
  empresas: "Conectar con empresas",
  innovacion: "Resolver problemas con innovación",
  primera_oportunidad: "Primera oportunidad real en tech",
  autodidacta: "Ya aprende solo, busca mentoría",
  cambio_carrera: "Cambio de carrera a desarrollo",
  impacto: "Crear tecnología con impacto",
  otro: "Otro",
};

/** Mapea un valor con un diccionario; si hay un "_otro", lo concatena. */
function mapWithOther(
  row: Record<string, unknown>,
  key: string,
  map: Record<string, string>,
): string {
  const raw = str(row, key);
  if (!raw) return "";
  const label = map[raw] ?? raw;
  const other = str(row, `${key}_otro`).trim();
  if (raw === "otro" && other) return `Otro: ${other}`;
  return label;
}

export const ASPIRANTE_CSV_COLUMNS: CsvColumn[] = [
  { header: "Fecha de postulación", value: (r) => csvDate(r.createdAt as Timestamp) },
  { header: "Estado", value: (r) => STATUS_META[(r.status as AppStatus) ?? "pending"]?.label ?? "" },
  { header: "Nombre completo", value: (r) => str(r, "nombre") },
  { header: "Email", value: (r) => str(r, "email") },
  { header: "WhatsApp", value: (r) => str(r, "whatsapp") },
  { header: "Ciudad", value: (r) => str(r, "ciudad") },
  { header: "Dirección", value: (r) => str(r, "direccion") },
  { header: "¿Estudia?", value: (r) => mapWithOther(r, "estudia", ESTUDIA_MAP) },
  { header: "Carrera / Programa", value: (r) => str(r, "carrera") },
  {
    header: "Motivación",
    value: (r) => {
      const raw = str(r, "interes");
      if (!raw) return "";
      // Texto libre nuevo vs keyword legacy
      return INTERES_LEGACY[raw] ?? raw;
    },
  },
  { header: "¿Cómo nos conoció?", value: (r) => mapWithOther(r, "origen", ORIGEN_MAP) },
  { header: "Recomendado por", value: (r) => str(r, "origen_referido") },
  { header: "CV (enlace)", value: (r) => str(r, "cvUrl") },
  { header: "CV (archivo)", value: (r) => str(r, "cvFilename") },
];

export const EMPRESA_CSV_COLUMNS: CsvColumn[] = [
  { header: "Fecha de solicitud", value: (r) => csvDate(r.createdAt as Timestamp) },
  { header: "Estado", value: (r) => STATUS_META[(r.status as AppStatus) ?? "pending"]?.label ?? "" },
  { header: "Empresa", value: (r) => str(r, "empresa") },
  { header: "Persona de contacto", value: (r) => str(r, "contacto") },
  { header: "Email corporativo", value: (r) => str(r, "email") },
  { header: "Teléfono", value: (r) => str(r, "telefono") },
  { header: "Área a potenciar", value: (r) => mapWithOther(r, "area", AREA_MAP) },
  { header: "Descripción del reto", value: (r) => str(r, "reto") },
  { header: "Modalidad de apoyo", value: (r) => mapWithOther(r, "modalidad", MODALIDAD_MAP) },
];
