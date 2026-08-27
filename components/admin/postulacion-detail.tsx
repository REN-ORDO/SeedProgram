"use client";

/**
 * Vista de detalle reusable para una postulación.
 * Carga el doc por ID en tiempo real, muestra todos los fields,
 * permite cambiar estado, y abre el CV en Cloudinary si existe.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  doc,
  onSnapshot,
  type DocumentData,
  type Timestamp,
} from "firebase/firestore";
import {
  ArrowLeft,
  Loader2,
  FileText,
  ExternalLink,
  Mail,
  Phone,
  MessageCircle,
} from "lucide-react";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import {
  STATUS_META,
  formatFirestoreDate,
  type AppStatus,
} from "@/lib/admin-helpers";
import { StatusChanger } from "@/components/admin/status-changer";

export type FieldSection = {
  title: string;
  fields: Array<{
    key: string;
    label: string;
    /** Si está, transforma el valor. Recibe también el doc completo, para
     *  campos que dependen de otro (ej: diagnóstico + opción elegida). */
    format?: (v: unknown, data: DocumentData) => React.ReactNode;
    /** Ocupa las dos columnas de la grilla. Para bloques largos. */
    fullWidth?: boolean;
  }>;
};

export function PostulacionDetail({
  collectionName,
  docId,
  titleKey,
  subtitleKey,
  sections,
  showCv = false,
}: {
  collectionName: "aspirantes" | "empresas";
  docId: string;
  titleKey: string;
  subtitleKey?: string;
  sections: FieldSection[];
  showCv?: boolean;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const [data, setData] = useState<DocumentData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, collectionName, docId),
      (snap) => {
        if (!snap.exists()) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        setData(snap.data());
        setLoading(false);
      },
      (err) => {
        console.error("Detail snapshot error:", err);
        setLoading(false);
      },
    );
    return () => unsub();
  }, [collectionName, docId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-[var(--color-accent)]" />
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="mx-auto max-w-2xl text-center">
        <p className="mb-4 text-sm text-[var(--color-fg-muted)]">
          Postulación no encontrada.
        </p>
        <button onClick={() => router.back()} className="toon-btn toon-btn--white">
          <ArrowLeft size={16} /> Volver
        </button>
      </div>
    );
  }

  const status = (data.status as AppStatus) ?? "pending";
  const meta = STATUS_META[status];
  const title = (data[titleKey] as string) ?? "Sin nombre";
  const subtitle = subtitleKey ? ((data[subtitleKey] as string) ?? "") : "";
  const email = data.email as string | undefined;
  const phone = (data.telefono ?? data.whatsapp) as string | undefined;

  return (
    <div className="mx-auto max-w-4xl">
      {/* Back */}
      <Link
        href={`/admin/${collectionName}`}
        className="mb-6 inline-flex items-center gap-2 font-display text-sm font-semibold text-[var(--color-fg-muted)] transition-colors hover:text-[var(--color-ink)]"
      >
        <ArrowLeft size={16} />
        Volver a {collectionName === "aspirantes" ? "aspirantes" : "empresas"}
      </Link>

      {/* Header */}
      <div className="mb-6 rounded-2xl border-2 border-[var(--color-ink)] bg-white p-6 shadow-[6px_6px_0_var(--color-ink)] sm:p-8">
        <div className="mb-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <span
              className="inline-block rounded-full border-2 border-[var(--color-ink)] px-2.5 py-1 font-display text-[10px] font-bold uppercase tracking-wider"
              style={{ background: meta.bg, color: meta.text }}
            >
              {meta.label}
            </span>
            <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-[var(--color-heading)] sm:text-3xl">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1 text-sm text-[var(--color-fg-muted)]">
                {subtitle}
              </p>
            )}
          </div>
          <div className="text-right text-xs text-[var(--color-fg-muted)]">
            <div>Recibido</div>
            <div className="mt-0.5 font-semibold text-[var(--color-ink)]">
              {formatFirestoreDate(data.createdAt as Timestamp)}
            </div>
          </div>
        </div>

        {/* Quick contact actions */}
        <div className="mt-4 flex flex-wrap gap-2">
          {email && (
            <a
              href={`mailto:${email}`}
              className="inline-flex max-w-full items-center gap-1.5 rounded-full border-2 border-[var(--color-ink)] bg-[var(--color-bg-soft)] px-3 py-1.5 font-display text-xs font-semibold transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_var(--color-ink)]"
            >
              <Mail size={13} className="flex-shrink-0" />
              <span className="truncate">{email}</span>
            </a>
          )}
          {phone && (
            <>
              <a
                href={`tel:${phone.replace(/\s/g, "")}`}
                className="inline-flex max-w-full items-center gap-1.5 rounded-full border-2 border-[var(--color-ink)] bg-[var(--color-bg-soft)] px-3 py-1.5 font-display text-xs font-semibold transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_var(--color-ink)]"
              >
                <Phone size={13} className="flex-shrink-0" />
                <span className="truncate">{phone}</span>
              </a>
              <a
                href={`https://wa.me/${phone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border-2 border-[var(--color-ink)] bg-[var(--color-bg-teal)] px-3 py-1.5 font-display text-xs font-semibold transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_var(--color-ink)]"
              >
                <MessageCircle size={13} />
                WhatsApp
              </a>
            </>
          )}
        </div>

        {/* Status changer */}
        <div className="mt-6 border-t-2 border-dashed border-[var(--color-bg-soft)] pt-5">
          <StatusChanger
            collectionName={collectionName}
            docId={docId}
            currentStatus={status}
            adminEmail={user?.email}
          />
        </div>
      </div>

      {/* CV (solo aspirantes) */}
      {showCv && data.cvUrl && (
        <div className="mb-6 rounded-2xl border-2 border-[var(--color-ink)] bg-white p-5 shadow-[3px_3px_0_var(--color-ink)]">
          <div className="mb-3 font-display text-xs font-semibold uppercase tracking-wider text-[var(--color-fg-muted)]">
            Hoja de vida
          </div>
          <a
            href={data.cvUrl as string}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 rounded-xl border-2 border-dashed border-[var(--color-ink)] bg-[var(--color-bg-soft)] p-4 transition-colors hover:bg-[var(--color-bg-sky)]"
          >
            <div className="flex h-10 w-10 -rotate-[4deg] flex-shrink-0 items-center justify-center rounded-xl border-2 border-[var(--color-ink)] bg-white text-[var(--color-ink)]">
              <FileText size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-display text-sm font-bold text-[var(--color-ink)]">
                {(data.cvFilename as string) ?? "Ver CV"}
              </div>
              <div className="mt-0.5 text-xs text-[var(--color-fg-muted)]">
                {data.cvFormat ? String(data.cvFormat).toUpperCase() : "—"}
                {data.cvBytes
                  ? ` · ${Math.round((data.cvBytes as number) / 1024)} KB`
                  : ""}
              </div>
            </div>
            <ExternalLink
              size={16}
              className="text-[var(--color-fg-muted)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--color-ink)]"
            />
          </a>
        </div>
      )}

      {/* Sections con todos los fields */}
      <div className="flex flex-col gap-5">
        {sections.map((section) => (
          <div
            key={section.title}
            className="rounded-2xl border-2 border-[var(--color-ink)] bg-white p-6 shadow-[3px_3px_0_var(--color-ink)]"
          >
            <h2 className="mb-4 font-display text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-accent-strong)]">
              {section.title}
            </h2>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
              {section.fields.map((f) => {
                const value = data[f.key];
                const display = f.format
                  ? f.format(value, data)
                  : value === undefined || value === null || value === ""
                    ? "—"
                    : String(value);
                return (
                  <div key={f.key} className={f.fullWidth ? "sm:col-span-2" : undefined}>
                    <dt className="mb-1 font-display text-xs font-semibold uppercase tracking-wider text-[var(--color-fg-muted)]">
                      {f.label}
                    </dt>
                    <dd className="break-words font-body text-sm text-[var(--color-ink)]">
                      {display}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </div>
        ))}
      </div>
    </div>
  );
}
