"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Sparkle } from "lucide-react";
import { Magnetic } from "@/components/magnetic";
import { empresaHero } from "@/lib/data";

function Floater({
  style,
  dur = 6,
  amp = 10,
  delay = 0,
  rotateRange = 8,
  children,
}: {
  style?: React.CSSProperties;
  dur?: number;
  amp?: number;
  delay?: number;
  rotateRange?: number;
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      style={style}
      animate={reduce ? undefined : { y: [-amp, amp, -amp], rotate: [-rotateRange, rotateRange, -rotateRange] }}
      transition={{ duration: dur, repeat: Infinity, ease: "easeInOut", delay }}
      aria-hidden
    >
      {children}
    </motion.div>
  );
}

function LeafA({ fill = "#27D3C3", rotate = 0 }: { fill?: string; rotate?: number }) {
  return (
    <svg viewBox="0 0 64 64" style={{ width: "100%", height: "100%", transform: `rotate(${rotate}deg)` }} aria-hidden>
      <path d="M8 56 C 8 28, 28 8, 56 8 C 56 36, 36 56, 8 56 Z" fill={fill} />
    </svg>
  );
}

function LeafB({ fill = "#58BFFF", rotate = 0 }: { fill?: string; rotate?: number }) {
  return (
    <svg viewBox="0 0 64 64" style={{ width: "100%", height: "100%", transform: `rotate(${rotate}deg)` }} aria-hidden>
      <path d="M32 4 C 52 20, 58 44, 32 60 C 6 44, 12 20, 32 4 Z" fill={fill} />
    </svg>
  );
}

export function EmpresasHero() {
  const reduce = useReducedMotion();
  const { eyebrow, title, highlight, subtitle, ctaPrimary, ctaSecondary } =
    empresaHero;

  const [before, after] = title.split(highlight);

  return (
    <section
      id="inicio"
      aria-label="Empresas patrocinadoras"
      className="relative isolate overflow-hidden px-5 pt-28 pb-16 md:px-10 md:pt-36 md:pb-28"
      style={{ background: "var(--color-bg)" }}
    >
      {/* ── Hojas flotantes ── */}

      {/* Izquierda — grande arriba */}
      <Floater style={{ position: "absolute", top: 80, left: -20, width: 96, height: 96, opacity: 0.55, zIndex: 0, pointerEvents: "none" }}
        dur={7} amp={11} delay={0} rotateRange={9}>
        <LeafA fill="#27D3C3" rotate={-30} />
      </Floater>

      {/* Izquierda — pequeña abajo */}
      <Floater style={{ position: "absolute", bottom: "20%", left: 16, width: 42, height: 42, opacity: 0.3, zIndex: 0, pointerEvents: "none" }}
        dur={9} amp={8} delay={1.5} rotateRange={13}>
        <LeafB fill="#7DD3FC" rotate={20} />
      </Floater>

      {/* Izquierda — mini blur */}
      <Floater style={{ position: "absolute", top: "45%", left: 10, width: 28, height: 28, opacity: 0.2, zIndex: 0, pointerEvents: "none", filter: "blur(1px)" }}
        dur={6.5} amp={6} delay={2.5} rotateRange={15}>
        <LeafA fill="#27D3C3" rotate={55} />
      </Floater>

      {/* Derecha — grande arriba */}
      <Floater style={{ position: "absolute", top: 72, right: -18, width: 88, height: 88, opacity: 0.5, zIndex: 0, pointerEvents: "none" }}
        dur={8} amp={10} delay={0.6} rotateRange={8}>
        <LeafA fill="#58BFFF" rotate={140} />
      </Floater>

      {/* Derecha — mediana abajo */}
      <Floater style={{ position: "absolute", bottom: "18%", right: 14, width: 52, height: 52, opacity: 0.35, zIndex: 0, pointerEvents: "none" }}
        dur={7.5} amp={9} delay={1} rotateRange={10}>
        <LeafB fill="#BAE6FD" rotate={-50} />
      </Floater>

      {/* Derecha — mini blur */}
      <Floater style={{ position: "absolute", top: "40%", right: 8, width: 30, height: 30, opacity: 0.18, zIndex: 0, pointerEvents: "none", filter: "blur(1px)" }}
        dur={10} amp={7} delay={3} rotateRange={12}>
        <LeafA fill="#58BFFF" rotate={-80} />
      </Floater>

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
