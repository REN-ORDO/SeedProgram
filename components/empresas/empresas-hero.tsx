"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Sparkle } from "lucide-react";
import { Magnetic } from "@/components/magnetic";
import { empresaHero } from "@/lib/data";

export function EmpresasHero() {
  const reduce = useReducedMotion();
  const { eyebrow, title, highlight, subtitle, ctaPrimary, ctaSecondary } =
    empresaHero;

  // Parte el título alrededor del fragmento resaltado.
  const [before, after] = title.split(highlight);

  return (
    <section
      id="inicio"
      aria-label="Empresas patrocinadoras"
      className="relative isolate overflow-hidden px-5 pt-28 pb-16 md:px-10 md:pt-36 md:pb-28"
      style={{ background: "var(--color-bg)" }}
    >
      {/* Stickers decorativos */}
      <svg
        viewBox="0 0 64 64"
        className="absolute top-28 left-8 h-14 w-14 opacity-90 md:left-20"
        aria-hidden
        style={{ transform: "rotate(-16deg)" }}
      >
        <path
          d="M8 56 C 8 28, 28 8, 56 8 C 56 36, 36 56, 8 56 Z"
          fill="#5EEAD4"
          stroke="#0F172A"
          strokeWidth={2.5}
        />
      </svg>
      <svg
        viewBox="0 0 64 64"
        className="absolute bottom-16 right-10 h-16 w-16 opacity-90 md:right-28"
        aria-hidden
        style={{ transform: "rotate(20deg)" }}
      >
        <path
          d="M32 6 C 50 14, 56 32, 42 52 C 30 60, 14 56, 10 38 C 8 22, 18 10, 32 6 Z"
          fill="#38BDF8"
          stroke="#0F172A"
          strokeWidth={2.5}
        />
      </svg>

      <div className="relative mx-auto w-full max-w-4xl text-center">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-7 inline-flex items-center"
        >
          <span className="toon-pill" style={{ background: "var(--color-accent-soft)" }}>
            <Sparkle size={14} strokeWidth={2.5} aria-hidden />
            {eyebrow}
          </span>
        </motion.div>

        <motion.h1
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-balance font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl"
          style={{ color: "var(--color-ink)" }}
        >
          {before}
          <span
            className="font-handwritten"
            style={{
              color: "var(--color-accent-strong)",
              fontWeight: 700,
              fontSize: "1.12em",
              display: "inline-block",
              transform: "rotate(-2deg)",
            }}
          >
            {highlight}
          </span>
          {after}
        </motion.h1>

        <motion.p
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed md:text-xl"
          style={{ color: "var(--color-fg-muted)" }}
        >
          {subtitle}
        </motion.p>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-10 flex flex-wrap justify-center gap-4"
        >
          <Magnetic strength={0.25}>
            <a href="/postular?rol=empresa" data-cursor="Diagnóstico" className="toon-btn">
              {ctaPrimary}
              <ArrowRight size={16} />
            </a>
          </Magnetic>
          <a href="#modelo" data-cursor="Ver" className="toon-btn toon-btn--white">
            {ctaSecondary}
            <span aria-hidden>↓</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
