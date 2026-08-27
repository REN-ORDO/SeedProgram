"use client";

/**
 * Paso 3 del formulario de empresas: diagnóstico generado con IA.
 *
 * Componente presentacional puro — no hace fetch ni conoce el wizard.
 * `application-form.tsx` orquesta la llamada y le pasa el estado, y le
 * inyecta `radioProps` para que los radios se integren con el contexto del
 * formulario (persistencia entre pasos y restauración de borradores).
 */

import type { ChangeEventHandler } from "react";
import { motion } from "framer-motion";
import { Package, ShieldCheck, RefreshCw, Loader2 } from "lucide-react";
import { diagnosisCopy } from "@/lib/data";
import type { Diagnosis, DiagnosisSource } from "@/lib/diagnosis";

export type DiagnosisState =
  | { status: "loading" }
  | { status: "ready"; data: Diagnosis; fuente: DiagnosisSource };

/**
 * Forma exacta de lo que devuelve `radioProps` en application-form.tsx.
 * Tipada al detalle a propósito: un `Record<string, unknown>` no se puede
 * hacer spread sobre un <input> sin error de tipos.
 */
export type RadioPropsFactory = (value: string) => {
  name: string;
  value: string;
  defaultChecked: boolean;
  onChange: ChangeEventHandler<HTMLInputElement>;
};

function Respaldo() {
  return (
    <div className="mt-6 flex items-start gap-3 rounded-xl border-2 border-dashed border-[var(--color-ink)] bg-[var(--color-bg-teal)] px-4 py-3.5">
      <ShieldCheck
        size={18}
        className="mt-0.5 flex-shrink-0 text-[var(--color-accent-strong)]"
      />
      <p className="text-[13px] leading-relaxed text-[var(--color-ink)]">
        {diagnosisCopy.respaldo}
      </p>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.45, 0.85, 0.45] }}
          transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.18 }}
          className="h-[104px] rounded-xl border-2 border-[var(--color-ink)] bg-[var(--color-bg-soft)]"
        />
      ))}
    </div>
  );
}

export function DiagnosisPanel({
  state,
  generation,
  canRegenerate,
  onRegenerate,
  radioProps,
}: {
  state: DiagnosisState;
  /** Sube en cada regeneración: fuerza el remount de los radios. */
  generation: number;
  canRegenerate: boolean;
  onRegenerate: () => void;
  radioProps: RadioPropsFactory;
}) {
  if (state.status === "loading") {
    return (
      <>
        <div className="mb-7">
          <h2 className="font-display text-2xl font-bold leading-tight tracking-tight text-[var(--color-heading)] sm:text-[28px]">
            {diagnosisCopy.loading}
          </h2>
          <p className="mt-1.5 flex items-center gap-2 text-[15px] text-[var(--color-fg-muted)]">
            <Loader2 size={15} className="animate-spin" />
            Tarda unos segundos.
          </p>
        </div>
        <Skeleton />
        <Respaldo />
      </>
    );
  }

  const { data, fuente } = state;

  return (
    <>
      <div className="mb-7">
        <h2 className="font-display text-2xl font-bold leading-tight tracking-tight text-[var(--color-heading)] sm:text-[28px]">
          {diagnosisCopy.title}
        </h2>
        <p className="mt-1.5 text-[15px] text-[var(--color-fg-muted)]">
          {diagnosisCopy.desc}
        </p>
      </div>

      {/* Resumen */}
      <div className="mb-6 rounded-xl border-2 border-[var(--color-ink)] bg-[var(--color-bg-sky)] p-4 shadow-[3px_3px_0_var(--color-ink)]">
        <p className="text-[15px] leading-relaxed text-[var(--color-ink)]">
          {data.resumen}
        </p>
      </div>

      {fuente === "fallback" && (
        <p className="mb-5 text-[13px] leading-relaxed text-[var(--color-fg-muted)]">
          {diagnosisCopy.fallbackNota}
        </p>
      )}

      {/* Opciones */}
      <div key={generation} className="flex flex-col gap-3">
        {data.opciones.map((op, i) => (
          <label
            key={`${generation}-${i}`}
            className="flex cursor-pointer gap-3.5 rounded-xl border-2 border-[var(--color-ink)] bg-white p-4 shadow-[3px_3px_0_var(--color-ink)] transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_var(--color-ink)] has-[input:checked]:-translate-x-0.5 has-[input:checked]:-translate-y-0.5 has-[input:checked]:bg-[var(--color-bg-teal)] has-[input:checked]:shadow-[5px_5px_0_var(--color-ink)]"
          >
            <input
              {...radioProps(String(i))}
              type="radio"
              required={i === 0}
              className="peer sr-only"
            />
            <span className="relative mt-0.5 flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-full border-2 border-[var(--color-ink)] bg-white peer-checked:bg-[var(--color-accent)]">
              <span className="h-2 w-2 rounded-full bg-white opacity-0 peer-checked:opacity-100" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-display text-[15px] font-bold leading-snug text-[var(--color-ink)]">
                {op.titulo}
              </span>
              <span className="mt-1.5 block text-[14px] leading-relaxed text-[var(--color-fg-muted)]">
                {op.descripcion}
              </span>
              <span className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] font-medium text-[var(--color-ink)]">
                 <span className="inline-flex items-center gap-1.5">
                   <Package size={13} className="flex-shrink-0" />
                   Paquete recomendado: {op.paquete ?? "Impulso"}
                 </span>
                 <span className="block basis-full">{op.entregable}</span>
              </span>
            </span>
          </label>
        ))}
      </div>

      {/* Regenerar */}
      <button
        type="button"
        onClick={onRegenerate}
        disabled={!canRegenerate}
        className="mt-4 inline-flex items-center gap-2 font-display text-[13px] font-semibold text-[var(--color-fg-muted)] underline-offset-4 transition-colors hover:text-[var(--color-ink)] hover:underline disabled:cursor-default disabled:no-underline disabled:opacity-60"
      >
        <RefreshCw size={14} />
        {canRegenerate
          ? diagnosisCopy.regenerar
          : diagnosisCopy.regenerarAgotado}
      </button>

      <Respaldo />
    </>
  );
}
