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
  const headers = Array.from(
    new Set(rows.flatMap((r) => Object.keys(r))),
  );
  const esc = (v: unknown): string => {
    if (v === null || v === undefined) return "";
    let s: string;
    if (typeof v === "object" && v !== null && "toDate" in v) {
      // Firestore Timestamp
      try {
        s = (v as Timestamp).toDate().toISOString();
      } catch {
        s = String(v);
      }
    } else {
      s = String(v);
    }
    if (s.includes('"') || s.includes(",") || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  const lines = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => esc(r[h])).join(",")),
  ];
  return lines.join("\n");
}

export function downloadCSV(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
