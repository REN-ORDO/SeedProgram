"use client";

/**
 * Lista reusable para Aspirantes y Empresas.
 * Recibe configuración de columnas + filtros.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  type Timestamp,
  type DocumentData,
} from "firebase/firestore";
import {
  Loader2,
  Download,
  Search,
  Filter,
  ArrowRight,
  ChevronDown,
  Check,
} from "lucide-react";
import { db } from "@/lib/firebase";
import { STATUS_META, timeAgo, exportXlsx } from "@/lib/admin-helpers";
import type { AppStatus, CsvColumn } from "@/lib/admin-helpers";
import { cn } from "@/lib/utils";

export type ColumnConfig<T> = {
  key: string;
  label: string;
  render: (row: T) => React.ReactNode;
  className?: string;
};

export type PostulacionRow = {
  id: string;
  status: AppStatus;
  createdAt?: Timestamp;
  [key: string]: unknown;
};

const STATUS_FILTERS: Array<{
  value: "all" | AppStatus;
  label: string;
  dot: string;
}> = [
  { value: "all", label: "Todos", dot: "var(--color-ink)" },
  { value: "pending", label: "Pendientes", dot: "var(--color-fg-subtle)" },
  { value: "reviewed", label: "Revisados", dot: "#38BDF8" },
  { value: "accepted", label: "Aceptados", dot: "var(--color-accent)" },
  { value: "rejected", label: "Rechazados", dot: "#ef4444" },
];

function StatusFilterDropdown({
  value,
  onChange,
}: {
  value: "all" | AppStatus;
  onChange: (v: "all" | AppStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = STATUS_FILTERS.find((f) => f.value === value) ?? STATUS_FILTERS[0];

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex w-full min-w-[180px] items-center gap-2.5 rounded-xl border-2 border-[var(--color-ink)] bg-white py-2.5 pl-3.5 pr-3 font-display text-sm font-semibold text-[var(--color-ink)] shadow-[3px_3px_0_var(--color-ink)] outline-none transition-shadow focus:shadow-[5px_5px_0_var(--color-accent)]"
      >
        <Filter size={15} className="text-[var(--color-fg-subtle)]" />
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full border border-[var(--color-ink)]"
          style={{ background: selected.dot }}
        />
        <span className="flex-1 text-left">{selected.label}</span>
        <ChevronDown
          size={16}
          className={cn(
            "shrink-0 text-[var(--color-ink)] transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 z-30 mt-2 w-full min-w-[200px] overflow-hidden rounded-xl border-2 border-[var(--color-ink)] bg-white shadow-[5px_5px_0_var(--color-ink)]"
        >
          {STATUS_FILTERS.map((f) => {
            const active = f.value === value;
            return (
              <li key={f.value} role="option" aria-selected={active}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(f.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left font-display text-sm font-semibold transition-colors",
                    active
                      ? "bg-[var(--color-bg-teal)] text-[var(--color-ink)]"
                      : "text-[var(--color-fg-muted)] hover:bg-[var(--color-bg-soft)] hover:text-[var(--color-ink)]",
                  )}
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full border border-[var(--color-ink)]"
                    style={{ background: f.dot }}
                  />
                  <span className="flex-1">{f.label}</span>
                  {active && (
                    <Check
                      size={15}
                      strokeWidth={3}
                      className="shrink-0 text-[var(--color-ink)]"
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function PostulacionList({
  collectionName,
  title,
  subtitle,
  columns,
  searchFields,
  csvFilename,
  csvColumns,
  initialStatusFilter = "all",
}: {
  collectionName: "aspirantes" | "empresas";
  title: string;
  subtitle: string;
  columns: ColumnConfig<PostulacionRow>[];
  searchFields: string[];
  csvFilename: string;
  csvColumns: CsvColumn[];
  initialStatusFilter?: "all" | AppStatus;
}) {
  const [rows, setRows] = useState<PostulacionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | AppStatus>(
    initialStatusFilter,
  );
  const [searchText, setSearchText] = useState("");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, collectionName), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const data: PostulacionRow[] = snap.docs.map((d) => {
          const raw = d.data() as DocumentData;
          return {
            id: d.id,
            status: ((raw.status as AppStatus) ?? "pending"),
            createdAt: raw.createdAt as Timestamp | undefined,
            ...raw,
          };
        });
        setRows(data);
        setLoading(false);
      },
      (err) => {
        console.error(`${collectionName} list error:`, err);
        setLoading(false);
      },
    );
    return () => unsub();
  }, [collectionName]);

  const filtered = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!q) return true;
      return searchFields.some((f) => {
        const v = r[f];
        return (
          typeof v === "string" && v.toLowerCase().includes(q)
        );
      });
    });
  }, [rows, statusFilter, searchText, searchFields]);

  const onExport = async () => {
    if (exporting || filtered.length === 0) return;
    setExporting(true);
    try {
      const ts = new Date().toISOString().slice(0, 10);
      await exportXlsx(`${csvFilename}-${ts}.xlsx`, filtered, csvColumns);
    } catch (err) {
      console.error("Error exportando Excel:", err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-[var(--color-heading)] sm:text-4xl">
            {title}
          </h1>
          <p className="mt-2 text-sm text-[var(--color-fg-muted)]">
            {subtitle} <span className="font-semibold text-[var(--color-ink)]">{filtered.length}</span> de {rows.length} total.
          </p>
        </div>
        <button
          onClick={onExport}
          disabled={filtered.length === 0 || exporting}
          className="inline-flex items-center gap-2 rounded-full border-2 border-[var(--color-ink)] bg-white px-4 py-2.5 font-display text-sm font-semibold text-[var(--color-ink)] shadow-[3px_3px_0_var(--color-ink)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_var(--color-ink)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {exporting ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Download size={15} />
          )}
          {exporting ? "Generando..." : "Exportar a Excel"}
        </button>
      </header>

      {/* Filtros */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative w-full flex-1 sm:min-w-[220px]">
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-fg-subtle)]"
          />
          <input
            type="search"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Buscar por nombre, email..."
            className="w-full rounded-xl border-2 border-[var(--color-ink)] bg-white px-4 py-2.5 pl-10 text-sm shadow-[3px_3px_0_var(--color-ink)] outline-none focus:shadow-[5px_5px_0_var(--color-accent)]"
          />
        </div>
        <StatusFilterDropdown
          value={statusFilter}
          onChange={setStatusFilter}
        />
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-2xl border-2 border-[var(--color-ink)] bg-white shadow-[6px_6px_0_var(--color-ink)]">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={22} className="animate-spin text-[var(--color-accent)]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-[var(--color-fg-muted)]">
            No hay postulaciones con estos filtros.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b-2 border-[var(--color-ink)] bg-[var(--color-bg-soft)] font-display text-xs uppercase tracking-wider text-[var(--color-fg-muted)]">
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className={cn("px-4 py-3 font-semibold", col.className)}
                    >
                      {col.label}
                    </th>
                  ))}
                  <th className="px-4 py-3 font-semibold">Estado</th>
                  <th className="px-4 py-3 font-semibold">Fecha</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => {
                  const meta = STATUS_META[row.status];
                  return (
                    <tr
                      key={row.id}
                      className="group border-b border-[var(--color-bg-soft)] transition-colors last:border-0 hover:bg-[var(--color-bg-soft)]"
                    >
                      {columns.map((col) => (
                        <td
                          key={col.key}
                          className={cn(
                            "whitespace-nowrap px-4 py-3 align-middle",
                            col.className,
                          )}
                        >
                          {col.render(row)}
                        </td>
                      ))}
                      <td className="px-4 py-3 align-middle">
                        <span
                          className="inline-block rounded-full border-2 border-[var(--color-ink)] px-2.5 py-1 font-display text-[10px] font-bold uppercase tracking-wider"
                          style={{
                            background: meta.bg,
                            color: meta.text,
                          }}
                        >
                          {meta.label}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 align-middle text-xs text-[var(--color-fg-muted)]">
                        {timeAgo(row.createdAt)}
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <Link
                          href={`/admin/${collectionName}/${row.id}`}
                          className="inline-flex items-center gap-1 font-display text-xs font-semibold text-[var(--color-accent-strong)] hover:text-[var(--color-ink)]"
                        >
                          Ver
                          <ArrowRight
                            size={13}
                            className="transition-transform group-hover:translate-x-0.5"
                          />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
