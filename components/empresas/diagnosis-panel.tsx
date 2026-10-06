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
import { ShieldCheck, RefreshCw, Loader2, Target } from "lucide-react";
import { diagnosisCopy, packageTiers, comparativoCopy } from "@/lib/data";
import type { Diagnosis, DiagnosisSource } from "@/lib/diagnosis";
import { PackageComparison } from "@/components/empresas/package-comparison";

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

/** Rejilla compartida por el skeleton y las tarjetas finales. */
const OPTIONS_GRID = "grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-5";

function Skeleton() {
  return (
    <div className={OPTIONS_GRID} aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{ animationDelay: `${i * 180}ms` }}
          className="flex min-h-[320px] animate-pulse flex-col overflow-hidden rounded-2xl border-2 border-[var(--color-ink)] bg-white shadow-[3px_3px_0_var(--color-ink)] motion-reduce:animate-none"
        >
          <div className="h-[110px] bg-[var(--color-bg-soft)]" />
          <div className="flex flex-1 flex-col gap-3 p-5">
            <div className="h-5 w-24 rounded-full bg-[var(--color-bg-soft)]" />
            <div className="h-4 w-4/5 rounded bg-[var(--color-bg-soft)]" />
            <div className="h-3 w-full rounded bg-[var(--color-bg-soft)]" />
            <div className="h-3 w-2/3 rounded bg-[var(--color-bg-soft)]" />
            <div className="mt-auto h-3 w-3/4 rounded bg-[var(--color-bg-soft)]" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Pips de nivel (1-4): llena tantos como el nivel del paquete. */
function LevelPips({ level }: { level: number }) {
  return (
    <span className="inline-flex items-center gap-1" role="img" aria-label={`Nivel ${level} de 4`}>
      {[1, 2, 3, 4].map((n) => (
        <span
          key={n}
          aria-hidden="true"
          className={`h-2 w-6 rounded-full border-2 border-current ${n <= level ? "bg-current" : "bg-transparent opacity-40"}`}
        />
      ))}
    </span>
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

  // Orden ascendente por nivel (sort estable); conserva el índice original.
  const sorted = data.opciones
    .map((op, index) => ({ op, index, tier: packageTiers[op.paquete ?? "Impulso"] }))
    .sort((a, b) => a.tier.level - b.tier.level);

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

      {/* Opciones: tarjetas tipo plan, de menor a mayor nivel. El `value` del
          radio es el índice ORIGINAL (así se persiste la selección). */}
      <div key={generation} className={OPTIONS_GRID}>
        {sorted.map(({ op, index, tier }, pos) => (
          <label
            key={`${generation}-${index}`}
            className="group/card relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border-2 border-[var(--color-ink)] bg-white shadow-[3px_3px_0_var(--color-ink)] transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_var(--color-ink)] has-[input:checked]:-translate-x-0.5 has-[input:checked]:-translate-y-0.5 has-[input:checked]:shadow-[6px_6px_0_var(--color-ink)] has-[input:checked]:ring-4 has-[input:checked]:ring-[var(--color-accent)] has-[input:focus-visible]:ring-4 has-[input:focus-visible]:ring-[var(--color-accent-2)] motion-reduce:transition-none"
          >
            <input
              {...radioProps(String(index))}
              type="radio"
              required={pos === 0}
              className="peer sr-only"
            />

            {/* Banda del nivel */}
            <div className={`p-5 ${tier.band}`}>
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-[11px] font-semibold uppercase tracking-widest">
                  {tier.kicker}
                </span>
                <span
                  aria-hidden="true"
                  className="relative flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-full border-2 border-[var(--color-ink)] bg-white group-has-[input:checked]/card:bg-[var(--color-accent-strong)]"
                >
                  <span className="h-2 w-2 rounded-full bg-white opacity-0 group-has-[input:checked]/card:opacity-100" />
                </span>
              </div>
              <p className="mt-2 font-display text-[26px] font-bold leading-none tracking-tight">
                {op.paquete ?? "Impulso"}
              </p>
              <div className="mt-3.5 flex flex-col gap-1.5">
                <LevelPips level={tier.level} />
                <span className="text-[12px] font-medium leading-snug">
                  {tier.team}
                </span>
              </div>
            </div>

            {/* Solución */}
            <div className="flex flex-1 flex-col border-t-2 border-[var(--color-ink)] p-5">
              {op.dolor_resuelto && (
                <span className="mb-2.5 inline-flex items-center gap-1.5 self-start rounded-full border border-[var(--color-ink)] bg-[var(--color-bg-teal)] px-2.5 py-0.5 text-[11px] font-bold text-[var(--color-ink)]">
                  <Target size={11} className="flex-shrink-0" />
                  {op.dolor_resuelto}
                </span>
              )}
              <span className="block font-display text-[16px] font-bold leading-snug text-[var(--color-ink)]">
                {op.titulo}
              </span>
              <span className="mt-1.5 block text-[14px] leading-relaxed text-[var(--color-fg-muted)]">
                {op.descripcion}
              </span>

              <div className="mt-auto border-t border-dashed border-[var(--color-ink)] pt-4">
                <span className="block font-mono text-[10px] font-semibold uppercase tracking-widest text-[var(--color-fg-muted)]">
                  {comparativoCopy.entregable}
                </span>
                <span className="mt-1 block text-[13px] font-medium leading-snug text-[var(--color-ink)]">
                  {op.entregable}
                </span>
              </div>
            </div>
          </label>
        ))}
      </div>

      {/* Comparativo de paquetes (mismo orden que las tarjetas) */}
      <PackageComparison opciones={sorted.map((s) => s.op)} />

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
