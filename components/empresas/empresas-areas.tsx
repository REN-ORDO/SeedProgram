"use client";

import { Globe, Workflow, Rocket, Wrench } from "lucide-react";
import { Reveal, RevealStagger, RevealItem } from "@/components/reveal";
import { empresaAreas, type EmpresaArea } from "@/lib/data";

const iconMap = {
  web: Globe,
  automation: Workflow,
  mvp: Rocket,
  support: Wrench,
};

const cardBgs = ["var(--color-surface)", "var(--color-bg-elev)", "var(--color-surface)", "var(--color-bg-elev)"];
const cardRotates = [-1, 1.2, -1.2, 1];

export function EmpresasAreas() {
  return (
    <section
      id="soluciones"
      aria-label="Qué resolvemos"
      className="relative px-5 py-16 md:px-10 md:py-32 toon-section toon-section--soft"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-3 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-[--color-fg-subtle]">
          <span className="font-bold text-[--color-ink]">02</span>
          <span className="h-[2px] w-12 bg-[var(--color-ink)]" />
          <span>Qué resolvemos juntos</span>
        </Reveal>

        <div className="mb-14 grid items-end gap-8 md:grid-cols-12">
          <Reveal delay={0.05} className="md:col-span-7">
            <h2 className="text-balance font-display text-4xl font-bold leading-[1.05] tracking-tight text-[--color-ink] md:text-6xl">
              Soluciones{" "}
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
                acotadas
              </span>{" "}
              y de alto impacto.
            </h2>
          </Reveal>
          <Reveal delay={0.15} className="md:col-span-5">
            <p className="text-base leading-relaxed text-[--color-fg-muted] md:text-lg">
              Diseñamos retos realistas para tu operación diaria. Estas son las
              cuatro áreas donde más movemos la aguja.
            </p>
          </Reveal>
        </div>

        <RevealStagger className="grid gap-6 sm:grid-cols-2">
          {empresaAreas.map((area, i) => (
            <RevealItem key={area.title}>
              <AreaCard area={area} index={i} />
            </RevealItem>
          ))}
        </RevealStagger>
      </div>
    </section>
  );
}

function AreaCard({ area, index }: { area: EmpresaArea; index: number }) {
  const Icon = iconMap[area.icon];
  return (
    <article
      className="toon-card relative flex h-full items-start gap-5 p-7"
      style={{
        background: cardBgs[index % cardBgs.length],
        transform: `rotate(${cardRotates[index % cardRotates.length]}deg)`,
      }}
      data-cursor="Área"
    >
      <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 border-[--color-ink] bg-white text-[--color-ink] shadow-[3px_3px_0_var(--color-ink)]">
        <Icon size={22} />
      </span>
      <div>
        <h3 className="font-display text-xl font-bold leading-tight text-[--color-ink]">
          {area.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-[--color-ink]/80">
          {area.desc}
        </p>
      </div>
    </article>
  );
}
