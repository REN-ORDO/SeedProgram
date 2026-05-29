"use client";

import { PiggyBank, Eye, UserCheck } from "lucide-react";
import { Reveal, RevealStagger, RevealItem } from "@/components/reveal";
import { empresaBeneficios, type EmpresaBeneficio } from "@/lib/data";

const iconMap = {
  cost: PiggyBank,
  talent: Eye,
  hire: UserCheck,
};

export function EmpresasBeneficio() {
  return (
    <section
      aria-label="Beneficio estratégico"
      className="relative px-5 py-16 md:px-10 md:py-32 toon-section toon-section--soft"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-3 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-[--color-fg-subtle]">
          <span className="font-bold text-[--color-ink]">04</span>
          <span className="h-[2px] w-12 bg-[var(--color-ink)]" />
          <span>El beneficio estratégico</span>
        </Reveal>

        <Reveal delay={0.05}>
          <h2 className="mb-14 max-w-3xl text-balance font-display text-4xl font-bold leading-[1.05] tracking-tight text-[--color-ink] md:text-6xl">
            No solo resuelves un problema. Conoces a tu{" "}
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
              próximo fichaje
            </span>
            .
          </h2>
        </Reveal>

        <RevealStagger className="grid gap-6 md:grid-cols-3">
          {empresaBeneficios.map((b) => (
            <RevealItem key={b.title}>
              <BeneficioCard beneficio={b} />
            </RevealItem>
          ))}
        </RevealStagger>
      </div>
    </section>
  );
}

function BeneficioCard({ beneficio }: { beneficio: EmpresaBeneficio }) {
  const Icon = iconMap[beneficio.icon];
  return (
    <article className="toon-card h-full bg-white p-7" data-cursor="Beneficio">
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-[--color-ink] bg-[var(--color-accent-soft)] text-[--color-ink] shadow-[3px_3px_0_var(--color-ink)]">
        <Icon size={22} />
      </span>
      <h3 className="mt-5 font-display text-xl font-bold leading-tight text-[--color-ink]">
        {beneficio.title}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-[--color-fg-muted]">
        {beneficio.desc}
      </p>
    </article>
  );
}
