"use client";

import { ArrowRight, Check } from "lucide-react";
import { Reveal, RevealItem, RevealStagger } from "@/components/reveal";
import { empresaPaquetes, type EmpresaPaquete } from "@/lib/data";

const cardBgs = ["var(--color-surface)", "var(--color-bg-elev)", "var(--color-surface)", "var(--color-bg-elev)"];
const cardRotates = [-1.2, 1, -0.8, 1.2];

export function EmpresasPaquetes() {
  return (
    <section id="paquetes" aria-label="Paquetes de solución" className="relative px-5 py-16 md:px-10 md:py-32 toon-section toon-section--navy">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-3 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-[#7dd3fc]">
          <span className="font-bold text-[#0F172A]">02</span>
          <span className="h-[2px] w-12 bg-[#0F172A]" />
          <span>Rutas para avanzar</span>
        </Reveal>
        <Reveal delay={0.05}>
          <div className="mb-14 max-w-3xl">
            <h2 className="text-balance font-display text-4xl font-bold leading-[1.05] tracking-tight text-[#0C4A6E] md:text-6xl">
              Elige el punto de partida para tu próximo <span className="font-handwritten text-[#7dd3fc]">salto</span>.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-[var(--color-fg-muted)] md:text-lg">
              No todas las empresas necesitan lo mismo. Conversamos sobre tu contexto y encontramos la forma más útil de empezar.
            </p>
          </div>
        </Reveal>
        <RevealStagger className="grid gap-6 sm:grid-cols-2">
          {empresaPaquetes.map((paquete, index) => (
            <RevealItem key={paquete.name}>
              <PaqueteCard paquete={paquete} index={index} />
            </RevealItem>
          ))}
        </RevealStagger>
      </div>
    </section>
  );
}

function PaqueteCard({ paquete, index }: { paquete: EmpresaPaquete; index: number }) {
  return (
    <article className="toon-card flex h-full flex-col p-7" style={{ background: cardBgs[index], transform: `rotate(${cardRotates[index]}deg)` }}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--color-fg-muted)]">Ruta 0{index + 1}</p>
          <h3 className="mt-3 font-display text-3xl font-bold text-[var(--color-ink)]">{paquete.name}</h3>
        </div>
        <span className="rounded-lg border-2 border-[var(--color-ink)] bg-white px-3 py-2 font-mono text-xs font-bold text-[var(--color-ink)]">{paquete.solutionType}</span>
      </div>
      <p className="mt-5 text-base font-semibold leading-relaxed text-[var(--color-ink)]">{paquete.positioning}</p>
      <ul className="mt-5 space-y-3 border-t-2 border-[var(--color-ink)]/15 pt-5">
        {paquete.includes.map((item) => <li key={item} className="flex gap-2 text-sm leading-relaxed text-[var(--color-fg-muted)]"><Check size={17} className="mt-0.5 shrink-0 text-[var(--color-accent-strong)]" aria-hidden="true" />{item}</li>)}
      </ul>
      <a href="#diagnostico" className="mt-7 inline-flex items-center gap-2 font-display font-bold text-[var(--color-accent-strong)] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent-strong)]">
        Conversar sobre esta ruta <ArrowRight size={16} aria-hidden="true" />
      </a>
    </article>
  );
}
