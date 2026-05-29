"use client";

import { Reveal, RevealStagger, RevealItem } from "@/components/reveal";
import { empresaPasos, type EmpresaPaso } from "@/lib/data";

const cardBgs = ["#BAE6FD", "#7DD3FC", "#38BDF8"];
const cardRotates = [-1.5, 1.5, -1];

export function EmpresasModelo() {
  return (
    <section
      id="modelo"
      aria-label="Cómo funciona"
      className="relative px-5 py-16 md:px-10 md:py-32 toon-section toon-section--navy"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-3 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-[--color-fg-subtle]">
          <span className="font-bold text-[--color-ink]">01</span>
          <span className="h-[2px] w-12 bg-[var(--color-ink)]" />
          <span>El modelo de impacto</span>
        </Reveal>

        <Reveal delay={0.05}>
          <h2 className="mb-14 max-w-3xl text-balance font-display text-4xl font-bold leading-[1.05] tracking-tight text-[--color-ink] md:text-6xl">
            ¿Cómo{" "}
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
              funciona
            </span>
            ?
          </h2>
        </Reveal>

        <RevealStagger className="grid gap-6 md:grid-cols-3">
          {empresaPasos.map((paso, i) => (
            <RevealItem key={paso.num}>
              <PasoCard paso={paso} index={i} />
            </RevealItem>
          ))}
        </RevealStagger>
      </div>
    </section>
  );
}

function PasoCard({ paso, index }: { paso: EmpresaPaso; index: number }) {
  return (
    <article
      className="toon-card relative h-full p-7"
      style={{
        background: cardBgs[index % cardBgs.length],
        transform: `rotate(${cardRotates[index % cardRotates.length]}deg)`,
      }}
      data-cursor="Paso"
    >
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-[--color-ink] bg-white font-display text-lg font-bold text-[--color-ink] shadow-[3px_3px_0_var(--color-ink)]">
        {paso.num}
      </span>
      <h3 className="mt-5 font-display text-2xl font-bold leading-tight text-[--color-ink]">
        {paso.title}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-[--color-ink]/80">
        {paso.desc}
      </p>
    </article>
  );
}
