"use client";

/**
 * Paso 2 del formulario de empresas: el reto se escribe y se profundiza en
 * el MISMO paso, como un chat — no hay paso 2.5 ni sub-estado del paso 3.
 * Ver spec en docs/superpowers/specs/2026-09-23-agentes-entrevista-diagnostico-empresas-design.md
 * (sección revisada tras el feedback de Sebastián: "el reto y el
 * entrevistador deberían ser iguales... un chat que toma requerimientos").
 *
 * Presentacional puro — no hace fetch. `application-form.tsx` orquesta las
 * llamadas a /api/entrevista y a /api/diagnostico, y le pasa acá el estado
 * de la conversación más los callbacks.
 */

import { useState, useRef, type RefObject } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Pencil, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { CHALLENGE_MAX, CHALLENGE_MIN } from "@/lib/diagnosis";

export type ChatState =
  | { phase: "writing" }
  | { phase: "thinking"; reto: string }
  | {
      phase: "asking";
      reto: string;
      preguntas: string[];
      respuestas: string[];
      fuente: "ia" | "fallback";
    }
  | {
      phase: "done";
      reto: string;
      preguntas: string[];
      respuestas: string[];
      fuente: "ia" | "fallback";
    };

const inputCls =
  "w-full rounded-xl border-2 border-[var(--color-ink)] bg-white px-4 py-3.5 text-[15px] text-[var(--color-ink)] " +
  "shadow-[3px_3px_0_var(--color-ink)] outline-none transition-all duration-150 " +
  "placeholder:text-[var(--color-fg-subtle)] " +
  "hover:-translate-x-px hover:-translate-y-px hover:shadow-[4px_4px_0_var(--color-ink)] " +
  "focus:-translate-x-0.5 focus:-translate-y-0.5 focus:shadow-[5px_5px_0_var(--color-accent)]";

function Bubble({
  from,
  children,
}: {
  from: "empresa" | "agente";
  children: React.ReactNode;
}) {
  const mine = from === "empresa";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn("flex", mine ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-xl border-2 border-[var(--color-ink)] px-3.5 py-2.5 text-[14px] leading-relaxed",
          mine
            ? "bg-[var(--color-bg-teal)] text-[var(--color-ink)]"
            : "bg-white text-[var(--color-ink)] shadow-[3px_3px_0_var(--color-ink)]",
        )}
      >
        {children}
      </div>
    </motion.div>
  );
}

function TypingBubble() {
  return (
    <Bubble from="agente">
      <span className="inline-flex items-center gap-2 text-[var(--color-fg-muted)]">
        <Loader2 size={14} className="animate-spin" />
        Leyendo tu reto…
      </span>
    </Bubble>
  );
}

/** Input de respuesta dentro del chat: texto + botón enviar + Enter envía. */
function ReplyInput({
  placeholder,
  onSend,
}: {
  placeholder: string;
  onSend: (value: string) => void;
}) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const send = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue("");
    inputRef.current?.focus();
  };

  return (
    <div className="flex gap-2">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            // stopPropagation: sin esto, el Enter también dispara el
            // handleKeyDown del <form> (que intenta avanzar de paso) justo
            // antes de que el estado de la respuesta recién enviada se
            // actualice.
            e.preventDefault();
            e.stopPropagation();
            send();
          }
        }}
        maxLength={500}
        placeholder={placeholder}
        className={cn(inputCls, "py-2.5 text-[14px]")}
      />
      <button
        type="button"
        onClick={send}
        aria-label="Enviar respuesta"
        className="flex flex-shrink-0 items-center justify-center rounded-xl border-2 border-[var(--color-ink)] bg-[var(--color-ink)] px-3.5 text-white shadow-[3px_3px_0_var(--color-ink)] transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_var(--color-ink)]"
      >
        <Send size={16} />
      </button>
    </div>
  );
}

export function RetoChat({
  state,
  textProps,
  retoInputRef,
  onSendReto,
  onAnswerPregunta,
  onEditReto,
}: {
  state: ChatState;
  /** Props del textarea del reto (defaultValue + onChange), ya resueltas
   *  por application-form.tsx vía su helper `textProps`. */
  textProps: {
    name: string;
    defaultValue: string;
    onChange: React.ChangeEventHandler<HTMLTextAreaElement>;
  };
  retoInputRef: RefObject<HTMLTextAreaElement | null>;
  onSendReto: () => void;
  onAnswerPregunta: (respuesta: string) => void;
  onEditReto: () => void;
}) {
  if (state.phase === "writing") {
    return (
      <div className="flex flex-col gap-2.5">
        <textarea
          {...textProps}
          ref={retoInputRef}
          required
          minLength={CHALLENGE_MIN}
          maxLength={CHALLENGE_MAX}
          placeholder="Ej: Pasamos mucho tiempo respondiendo preguntas frecuentes de clientes..."
          className={cn(inputCls, "min-h-[120px] resize-y leading-relaxed")}
        />
        <div className="flex items-center justify-between gap-3">
          <span className="text-[13px] text-[var(--color-fg-subtle)]">
            Mínimo 20 caracteres. Al enviar, profundizamos contigo en el chat.
          </span>
          <button
            type="button"
            onClick={onSendReto}
            className="toon-btn flex-shrink-0"
            style={{ background: "var(--color-ink)", color: "#fff" }}
          >
            Enviar
            <Send size={15} />
          </button>
        </div>
      </div>
    );
  }

  const preguntas = state.phase !== "thinking" ? state.preguntas : [];
  const respuestas = state.phase !== "thinking" ? state.respuestas : [];

  return (
    <div className="flex flex-col gap-3">
      <Bubble from="empresa">{state.reto}</Bubble>

      <AnimatePresence initial={false}>
        {state.phase === "thinking" && <TypingBubble key="typing" />}
      </AnimatePresence>

      {preguntas.map((pregunta, i) => {
        const answered = i < respuestas.length;
        // No revelar la siguiente pregunta hasta responder la anterior —
        // así se siente a chat, no a formulario con preguntas precargadas.
        if (!answered && i !== respuestas.length) return null;
        return (
          <div key={i} className="flex flex-col gap-3">
            <Bubble from="agente">{pregunta}</Bubble>
            {answered && <Bubble from="empresa">{respuestas[i]}</Bubble>}
          </div>
        );
      })}

      {state.phase === "asking" && (
        <ReplyInput placeholder="Escribe tu respuesta…" onSend={onAnswerPregunta} />
      )}

      {state.phase === "done" && (
        <>
          <Bubble from="agente">
            <span className="inline-flex items-center gap-1.5">
              <Sparkles size={13} className="flex-shrink-0 text-[var(--color-accent-strong)]" />
              {state.preguntas.length > 0
                ? "Perfecto, ya tengo lo que necesito."
                : "Con esto ya tengo una buena idea de tu reto."}
            </span>
          </Bubble>
          <button
            type="button"
            onClick={onEditReto}
            className="inline-flex w-fit items-center gap-1.5 text-[13px] font-semibold text-[var(--color-fg-muted)] underline-offset-4 transition-colors hover:text-[var(--color-ink)] hover:underline"
          >
            <Pencil size={13} />
            Cambiar el reto
          </button>
        </>
      )}
    </div>
  );
}
