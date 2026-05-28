"use client";

import { Reveal, RevealStagger, RevealItem } from "@/components/reveal";
import { semanas } from "@/lib/data";

const cardBgs = ["#5EEAD4", "#BAE6FD", "#7DD3FC", "#2DD4BF"];
const cardRotates = [-1.5, 1, -1, 1.5];

export function Plan() {
  return (
    <section
      id="plan"
      aria-label="Plan de 4 semanas"
      className="relative px-6 py-24 md:px-10 md:py-32 toon-section toon-section--sky"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-3 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-[--color-fg-subtle]">
          <span className="font-bold text-[--color-ink]">03</span>
          <span className="h-[2px] w-12 bg-[--color-ink]" />
          <span>Plan base</span>
        </Reveal>
        <div className="mb-14 max-w-3xl">
          <Reveal delay={0.05}>
            <h2 className="text-balance font-display text-4xl font-bold leading-[1.05] tracking-tight text-[--color-ink] md:text-6xl">
              Cuatro semanas que{" "}
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
                cambian todo
              </span>
              .
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="mt-5 text-base leading-relaxed text-[--color-ink]/80 md:text-lg">
              Cada semana tiene un foco, una entrega y un acompañamiento individual.
              Sales con propósito definido, proyecto colaborativo y un plan personal.
            </p>
          </Reveal>
        </div>

        <RevealStagger
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
          stagger={0.1}
        >
          {semanas.map((s, i) => (
            <RevealItem key={s.num}>
              <article
                className="toon-card relative h-full p-6"
                style={{
                  background: cardBgs[i % cardBgs.length],
                  transform: `rotate(${cardRotates[i % cardRotates.length]}deg)`,
                }}
                data-cursor={`Sem ${s.num}`}
              >
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-full border-2 border-[--color-ink] bg-white font-display text-2xl font-bold text-[--color-ink] shadow-[3px_3px_0_var(--color-ink)]">
                  {s.num}
                </div>
                <div className="mt-4 text-[10px] font-bold uppercase tracking-[0.18em] text-[--color-ink]">
                  {s.focus}
                </div>
                <h3 className="mt-2 font-display text-xl font-bold leading-tight text-[--color-ink]">
                  {s.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[--color-ink]/80">
                  {s.desc}
                </p>
              </article>
            </RevealItem>
          ))}
        </RevealStagger>
      </div>
    </section>
  );
}
