"use client";

import { Reveal } from "@/components/reveal";
import { empresaProblema } from "@/lib/data";

export function EmpresasProblema() {
  return (
    <section
      aria-label="El reto"
      className="relative px-5 py-16 md:px-10 md:py-28 toon-section toon-section--soft"
    >
      <div className="mx-auto max-w-3xl text-center">
        <Reveal>
          <h2 className="text-balance font-display text-3xl font-bold leading-tight tracking-tight text-[--color-ink] md:text-5xl">
            {empresaProblema.title}
          </h2>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[--color-fg-muted] md:text-lg">
            {empresaProblema.body}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
