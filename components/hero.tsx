"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowDown } from "lucide-react";
import { Counter } from "@/components/counter";
import { Magnetic } from "@/components/magnetic";
import { metrics, taglines } from "@/lib/data";

function Sticker({
  className,
  children,
  bg = "var(--color-bg-teal)",
  rotate = -6,
}: {
  className?: string;
  children: React.ReactNode;
  bg?: string;
  rotate?: number;
}) {
  return (
    <div
      className={className}
      style={{
        background: bg,
        border: "var(--toon-border)",
        borderRadius: 18,
        padding: "6px 14px",
        boxShadow: "var(--toon-shadow-sm)",
        transform: `rotate(${rotate}deg)`,
        fontWeight: 700,
        color: "var(--color-ink)",
      }}
    >
      {children}
    </div>
  );
}

function SeedSVG({
  className,
  fill = "#14B8A6",
  rotate = 0,
}: {
  className?: string;
  fill?: string;
  rotate?: number;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      style={{ transform: `rotate(${rotate}deg)` }}
      aria-hidden
    >
      <path
        d="M32 6 C 50 14, 56 32, 42 52 C 30 60, 14 56, 10 38 C 8 22, 18 10, 32 6 Z"
        fill={fill}
        stroke="#0F172A"
        strokeWidth={2.5}
      />
      <path
        d="M30 18 C 26 26, 26 36, 32 46"
        fill="none"
        stroke="#0F172A"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  );
}

function LeafSVG({
  className,
  fill = "#5EEAD4",
  rotate = 0,
}: {
  className?: string;
  fill?: string;
  rotate?: number;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      style={{ transform: `rotate(${rotate}deg)` }}
      aria-hidden
    >
      <path
        d="M8 56 C 8 28, 28 8, 56 8 C 56 36, 36 56, 8 56 Z"
        fill={fill}
        stroke="#0F172A"
        strokeWidth={2.5}
      />
      <path
        d="M14 50 L 48 16"
        stroke="#0F172A"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  );
}

function DotsSVG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 40" className={className} aria-hidden>
      {[6, 22, 38, 54, 70].map((x, i) => (
        <circle key={i} cx={x} cy={20 + (i % 2 === 0 ? -6 : 6)} r={4} fill="#0F172A" />
      ))}
    </svg>
  );
}

function Floater({
  className,
  dur = 5,
  amp = 12,
  delay = 0,
  rotateRange = 8,
  reduce,
  children,
}: {
  className?: string;
  dur?: number;
  amp?: number;
  delay?: number;
  rotateRange?: number;
  reduce: boolean;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      className={className}
      animate={
        reduce
          ? undefined
          : {
              y: [-amp, amp, -amp],
              rotate: [-rotateRange, rotateRange, -rotateRange],
            }
      }
      transition={{ duration: dur, repeat: Infinity, ease: "easeInOut", delay }}
      aria-hidden
    >
      {children}
    </motion.div>
  );
}

export function Hero() {
  const reduce = useReducedMotion();
  return (
    <section
      id="inicio"
      aria-label="Inicio"
      className="relative isolate overflow-hidden px-5 pt-24 pb-16 md:px-10 md:pt-36 md:pb-32"
      style={{ background: "var(--color-bg)" }}
    >
      {/* Floating decorative stickers — background */}
      <Floater reduce={!!reduce} className="absolute top-24 left-8 h-16 w-16 opacity-90 md:left-16" dur={5.5} amp={10} delay={0} rotateRange={6}>
        <SeedSVG className="h-full w-full" fill="#5EEAD4" rotate={-18} />
      </Floater>
      <Floater reduce={!!reduce} className="absolute top-40 right-10 h-20 w-20 opacity-90 md:right-24" dur={6.5} amp={14} delay={0.4} rotateRange={8}>
        <LeafSVG className="h-full w-full" fill="#38BDF8" rotate={22} />
      </Floater>
      <Floater reduce={!!reduce} className="absolute bottom-32 left-12 h-12 w-12 opacity-90 md:left-32" dur={4.8} amp={10} delay={0.8} rotateRange={10}>
        <SeedSVG className="h-full w-full" fill="#14B8A6" rotate={36} />
      </Floater>
      <Floater reduce={!!reduce} className="absolute bottom-16 right-16 h-14 w-14 opacity-90 md:right-40" dur={5.2} amp={12} delay={1.1} rotateRange={6}>
        <LeafSVG className="h-full w-full" fill="#BAE6FD" rotate={-14} />
      </Floater>

      {/* Extra leaves — flock (mobile-thinned with `hidden sm:block`) */}
      <Floater reduce={!!reduce} className="absolute top-12 left-1/3 h-10 w-10 opacity-80" dur={6} amp={14} delay={0.2} rotateRange={12}>
        <LeafSVG className="h-full w-full" fill="#2DD4BF" rotate={45} />
      </Floater>
      <Floater reduce={!!reduce} className="absolute top-1/2 left-4 hidden h-9 w-9 opacity-80 sm:block md:left-12" dur={5.8} amp={11} delay={1.6} rotateRange={9}>
        <LeafSVG className="h-full w-full" fill="#7DD3FC" rotate={-30} />
      </Floater>
      <Floater reduce={!!reduce} className="absolute top-1/3 right-1/4 hidden h-8 w-8 opacity-75 sm:block" dur={6.8} amp={9} delay={0.9} rotateRange={14}>
        <LeafSVG className="h-full w-full" fill="#5EEAD4" rotate={60} />
      </Floater>
      <Floater reduce={!!reduce} className="absolute bottom-1/3 right-4 h-11 w-11 opacity-85 md:right-16" dur={5.4} amp={13} delay={2.0} rotateRange={7}>
        <LeafSVG className="h-full w-full" fill="#38BDF8" rotate={-50} />
      </Floater>
      <Floater reduce={!!reduce} className="absolute top-1/2 right-1/2 hidden h-7 w-7 opacity-70 sm:block" dur={7.2} amp={8} delay={0.5} rotateRange={11}>
        <LeafSVG className="h-full w-full" fill="#BAE6FD" rotate={15} />
      </Floater>
      <Floater reduce={!!reduce} className="absolute bottom-44 left-1/2 hidden h-8 w-8 opacity-75 sm:block" dur={6.2} amp={10} delay={1.4} rotateRange={9}>
        <LeafSVG className="h-full w-full" fill="#0D9488" rotate={-20} />
      </Floater>
      <Floater reduce={!!reduce} className="absolute top-3/4 left-1/4 h-9 w-9 opacity-80" dur={5.6} amp={12} delay={0.7} rotateRange={10}>
        <LeafSVG className="h-full w-full" fill="#5EEAD4" rotate={70} />
      </Floater>
      <Floater reduce={!!reduce} className="absolute top-16 right-1/2 hidden h-6 w-6 opacity-65 sm:block" dur={4.6} amp={9} delay={1.9} rotateRange={13}>
        <LeafSVG className="h-full w-full" fill="#2DD4BF" rotate={-65} />
      </Floater>

      <DotsSVG className="absolute top-32 right-1/3 h-10 w-20 opacity-60" />
      <DotsSVG className="absolute bottom-28 left-1/3 h-10 w-20 opacity-60" />

      <div className="relative mx-auto w-full max-w-5xl">
        {/* Status pill */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 inline-flex items-center"
        >
          <span className="toon-pill">
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-[var(--color-accent)] opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-accent)]" />
            </span>
            Batch 9 · Próximamente
          </span>
        </motion.div>

        {/* Big card with headline */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="toon-card relative px-5 py-8 md:px-12 md:py-14"
        >
          {/* Corner sticker */}
          <Sticker
            className="absolute -top-4 right-2 text-xs md:-top-6 md:-right-6 md:text-sm"
            bg="#5EEAD4"
            rotate={8}
          >
            🌱 Programa Semilla
          </Sticker>

          <h1
            className="text-balance font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-7xl"
            style={{ color: "var(--color-ink)" }}
          >
            Encontramos talento{" "}
            <span
              className="font-handwritten"
              style={{
                color: "var(--color-accent-strong)",
                fontWeight: 700,
                fontSize: "1.15em",
                display: "inline-block",
                transform: "rotate(-2deg)",
              }}
            >
              donde otros no miran.
            </span>
          </h1>

          <p
            className="mt-7 max-w-2xl text-lg leading-relaxed md:text-xl"
            style={{ color: "var(--color-fg-muted)" }}
          >
            Programa de formación intensivo en{" "}
            {taglines.map((t, i) => (
              <span key={t}>
                <span style={{ color: "var(--color-ink)", fontWeight: 700 }}>{t}</span>
                {i < taglines.length - 1 ? (i === taglines.length - 2 ? " y " : ", ") : "."}
              </span>
            ))}{" "}
            Mentoría senior 1:1, comunidad activa, compensación desde el día uno.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Magnetic strength={0.2}>
              <a href="#aplicar" data-cursor="Aplicar" className="toon-btn">
                Avísame del Batch 9
                <ArrowRight size={16} />
              </a>
            </Magnetic>
            <a href="#plan" data-cursor="Ver" className="toon-btn toon-btn--white">
              Ver silabus
              <span aria-hidden>↗</span>
            </a>
          </div>
        </motion.div>

        {/* Metrics row — sticker cards */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mt-12 grid grid-cols-2 gap-5 md:grid-cols-4"
        >
          {metrics.map((m, i) => {
            const bgs = ["#5EEAD4", "#BAE6FD", "#7DD3FC", "#2DD4BF"];
            const rotates = [-2, 1.5, -1, 2];
            return (
              <div
                key={m.label}
                className="toon-card px-5 py-6 text-center"
                style={{
                  background: bgs[i % bgs.length],
                  transform: `rotate(${rotates[i % rotates.length]}deg)`,
                }}
              >
                <Counter
                  to={Number(m.value)}
                  suffix={m.suffix}
                  className="font-display text-4xl font-bold leading-none md:text-5xl"
                />
                <div
                  className="mt-2 text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "var(--color-ink)" }}
                >
                  {m.label}
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-4 left-1/2 hidden -translate-x-1/2 md:block"
      >
        <a
          href="#programa"
          aria-label="Desplázate para ver más"
          className="group flex flex-col items-center gap-2"
          style={{ color: "var(--color-ink)" }}
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.25em]">Scroll</span>
          <ArrowDown size={16} className="transition-transform group-hover:translate-y-0.5" />
        </a>
      </motion.div>
    </section>
  );
}
