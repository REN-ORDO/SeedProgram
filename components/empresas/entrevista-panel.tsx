"use client";

/**
 * Paso 3 del formulario de empresas, sub-estado A: entrevista.
 *
 * Componente presentacional puro — no hace fetch ni conoce el wizard.
 * `application-form.tsx` orquesta la llamada a /api/entrevista y le pasa el
 * estado; el botón que confirma las respuestas vive en la barra de
 * navegación del wizard (no acá), para reusar el mismo botón "Continuar"
 * que el resto de pasos.
 */

import { motion } from "framer-motion";
import { MessageCircleQuestion, Loader2 } from "lucide-react";
import { entrevistaCopy } from "@/lib/data";

export type EntrevistaState =
  | { status: "loading" }
  | { status: "ready"; preguntas: string[]; fuente: "ia" | "fallback" }
  | { status: "skipped" };

/** Mismo shape que `RadioPropsFactory` en diagnosis-panel.tsx, pero para
 * inputs de texto: mergea defaultValue + onChange del formulario no
 * controlado. */
export type TextPropsFactory = (name: string) => {
  name: string;
  defaultValue: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
};

function Skeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[0, 1].map((i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.45, 0.85, 0.45] }}
          transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.18 }}
          className="h-[72px] rounded-xl border-2 border-[var(--color-ink)] bg-[var(--color-bg-soft)]"
        />
      ))}
    </div>
  );
}

export function EntrevistaPanel({
  preguntas,
  loading,
  textProps,
}: {
  preguntas: string[];
  loading: boolean;
  textProps: TextPropsFactory;
}) {
  if (loading) {
    return (
      <>
        <div className="mb-7">
          <h2 className="font-display text-2xl font-bold leading-tight tracking-tight text-[var(--color-heading)] sm:text-[28px]">
            {entrevistaCopy.loading}
          </h2>
          <p className="mt-1.5 flex items-center gap-2 text-[15px] text-[var(--color-fg-muted)]">
            <Loader2 size={15} className="animate-spin" />
            Tarda unos segundos.
          </p>
        </div>
        <Skeleton />
      </>
    );
  }

  return (
    <>
      <div className="mb-7">
        <h2 className="font-display text-2xl font-bold leading-tight tracking-tight text-[var(--color-heading)] sm:text-[28px]">
          {entrevistaCopy.title}
        </h2>
        <p className="mt-1.5 text-[15px] text-[var(--color-fg-muted)]">
          {entrevistaCopy.desc}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {preguntas.map((pregunta, i) => (
          <div
            key={i}
            className="rounded-xl border-2 border-dashed border-[var(--color-ink)] bg-white p-4"
          >
            <label
              htmlFor={`entrevista_respuesta_${i}`}
              className="mb-2.5 flex items-start gap-2 text-[13.5px] font-bold leading-snug text-[var(--color-ink)]"
            >
              <MessageCircleQuestion
                size={16}
                className="mt-0.5 flex-shrink-0 text-[var(--color-accent-strong)]"
              />
              {pregunta}
            </label>
            <input
              id={`entrevista_respuesta_${i}`}
              type="text"
              required
              maxLength={500}
              placeholder="Escribe tu respuesta…"
              className="w-full rounded-lg border-2 border-[var(--color-ink)] bg-[var(--color-bg-soft)] px-3.5 py-2.5 text-[14px] text-[var(--color-ink)] outline-none transition-colors placeholder:text-[var(--color-fg-subtle)] focus:bg-white"
              {...textProps(`entrevista_respuesta_${i}`)}
            />
          </div>
        ))}
      </div>
    </>
  );
}
