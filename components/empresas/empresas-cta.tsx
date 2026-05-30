"use client";

import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { Magnetic } from "@/components/magnetic";
import { empresaCTA } from "@/lib/data";

export function EmpresasCTA() {
  return (
    <section
      id="diagnostico"
      aria-label="Solicitar diagnóstico"
      className="relative isolate overflow-hidden px-5 py-20 md:px-10 md:py-36 toon-section toon-section--deep"
    >
      <svg
        viewBox="0 0 64 64"
        className="absolute top-12 left-10 h-16 w-16 opacity-90 md:left-24"
        aria-hidden
        style={{ transform: "rotate(-18deg)" }}
      >
        <path
          d="M32 6 C 50 14, 56 32, 42 52 C 30 60, 14 56, 10 38 C 8 22, 18 10, 32 6 Z"
          fill="#5EEAD4"
          stroke="#0F172A"
          strokeWidth={2.5}
        />
      </svg>
      <svg
        viewBox="0 0 64 64"
        className="absolute bottom-12 right-10 h-20 w-20 opacity-90 md:right-32"
        aria-hidden
        style={{ transform: "rotate(22deg)" }}
      >
        <path
          d="M8 56 C 8 28, 28 8, 56 8 C 56 36, 36 56, 8 56 Z"
          fill="#38BDF8"
          stroke="#0F172A"
          strokeWidth={2.5}
        />
      </svg>

      <div className="relative mx-auto max-w-3xl text-center">
        <Reveal className="mb-6 inline-flex items-center">
          <span className="toon-pill" style={{ background: "var(--color-accent-soft)" }}>
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-[var(--color-ink)] opacity-50" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-ink)]" />
            </span>
            {empresaCTA.note}
          </span>
        </Reveal>

        <Reveal delay={0.08}>
          <h2 className="text-balance font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
            {empresaCTA.title}
          </h2>
        </Reveal>

        <Reveal delay={0.2}>
          <p className="mx-auto mt-6 max-w-xl text-base text-white/80 md:text-lg">
            {empresaCTA.body}
          </p>
        </Reveal>

        <Reveal delay={0.32}>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Magnetic strength={0.3}>
              <a
                href="/postular?rol=empresa"
                data-cursor="Diagnóstico"
                className="toon-btn"
                style={{ background: "var(--color-accent-soft)" }}
              >
                {empresaCTA.cta}
                <ArrowRight size={16} />
              </a>
            </Magnetic>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
