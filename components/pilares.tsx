"use client";

import { Sparkles, Users, GitBranch } from "lucide-react";
import { Reveal, RevealStagger, RevealItem } from "@/components/reveal";
import { pilares, type Pilar } from "@/lib/data";

const iconMap = {
  talent: Sparkles,
  mentor: Users,
  leadership: GitBranch,
};

const cardBgs = ["#BAE6FD", "#5EEAD4", "#7DD3FC"];
const cardRotates = [-1.5, 1.5, -1];

export function Pilares() {
  return (
    <section
      id="programa"
      aria-label="Programa"
      className="relative px-6 py-24 md:px-10 md:py-32 toon-section toon-section--soft"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-3 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-[--color-fg-subtle]">
          <span className="font-bold text-[--color-ink]">01</span>
          <span className="h-[2px] w-12 bg-[--color-ink]" />
          <span>Programa</span>
        </Reveal>

        <div className="mb-14 grid items-end gap-8 md:grid-cols-12">
          <Reveal delay={0.05} className="md:col-span-7">
            <h2 className="text-balance font-display text-4xl font-bold leading-[1.05] tracking-tight text-[--color-ink] md:text-6xl">
              Tres pilares para{" "}
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
                crecer
              </span>
              .
            </h2>
          </Reveal>
          <Reveal delay={0.15} className="md:col-span-5">
            <p className="text-base leading-relaxed text-[--color-fg-muted] md:text-lg">
              Selección por motivación, no por credenciales. Acompañamiento real
              de desarrolladores senior. Una estructura de niveles que ordena tu
              evolución técnica y de liderazgo.
            </p>
          </Reveal>
        </div>

        <RevealStagger className="grid gap-6 md:grid-cols-3">
          {pilares.map((p, i) => (
            <RevealItem key={p.title}>
              <PilarCard pilar={p} index={i} />
            </RevealItem>
          ))}
        </RevealStagger>
      </div>
    </section>
  );
}

function PilarCard({ pilar, index }: { pilar: Pilar; index: number }) {
  const Icon = iconMap[pilar.icon];
  return (
    <article
      className="toon-card relative h-full p-7"
      style={{
        background: cardBgs[index % cardBgs.length],
        transform: `rotate(${cardRotates[index % cardRotates.length]}deg)`,
      }}
      data-cursor="Card"
    >
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-[--color-ink] bg-white text-[--color-ink] shadow-[3px_3px_0_var(--color-ink)]">
        <Icon size={22} />
      </span>
      <h3 className="mt-5 font-display text-2xl font-bold leading-tight text-[--color-ink]">
        {pilar.title}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-[--color-ink]/80">{pilar.desc}</p>
    </article>
  );
}
