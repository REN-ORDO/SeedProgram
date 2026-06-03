"use client";

import { ArrowRight, Check, Hammer, Wrench, Sprout } from "lucide-react";
import { Reveal, RevealStagger, RevealItem } from "@/components/reveal";
import { batches, type Batch } from "@/lib/data";
import { cn } from "@/lib/utils";

export function Batches() {
  return (
    <section
      id="batches"
      aria-label="Batches"
      className="relative px-5 py-16 md:px-10 md:py-32"
      style={{ background: "var(--color-bg)" }}
    >
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-3 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-[--color-fg-subtle]">
          <span className="font-bold text-[--color-ink]">05</span>
          <span className="h-[2px] w-12 bg-[var(--color-ink)]" />
          <span>Próximas convocatorias</span>
        </Reveal>

        <div className="mb-14 max-w-3xl">
          <Reveal delay={0.05}>
            <h2 className="text-balance font-display text-4xl font-bold leading-[1.05] tracking-tight text-[--color-ink] md:text-6xl">
              Batches 7, 8 y 9 en marcha.{" "}
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
                Sigue el 10
              </span>
              .
            </h2>
          </Reveal>
        </div>

        <RevealStagger className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {batches.map((b, i) => (
            <RevealItem key={b.id}>
              <BatchCard batch={b} index={i} />
            </RevealItem>
          ))}
        </RevealStagger>
      </div>
    </section>
  );
}

function BatchCard({ batch, index }: { batch: Batch; index: number }) {
  const isOpen = batch.status === "abierto";
  const isSoon = batch.status === "proximamente";
  const isClosed = batch.status === "cerrado";
  const statusLabel = isOpen ? "Abierto" : isSoon ? "Próximamente" : "Cerrado";
  const statusDot = isOpen
    ? "var(--color-accent-strong)"
    : isSoon
    ? "var(--color-accent-2-strong)"
    : "var(--color-fg-subtle)";
  const bg = batch.featured ? "var(--color-accent-soft)" : isClosed ? "var(--color-bg-soft)" : "#BAE6FD";
  const rotate = index % 2 === 0 ? -1.2 : 1.2;
  return (
    <article
      className="toon-card relative h-full overflow-hidden p-8"
      style={{
        background: bg,
        transform: `rotate(${rotate}deg)`,
        opacity: isClosed ? 0.92 : 1,
      }}
      data-cursor={batch.title}
    >
      {isSoon && <CrossedToolsWatermark />}

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-[--color-ink]/70">
            {batch.title}
          </div>
          <h3 className="mt-1 font-display text-2xl font-bold leading-tight text-[--color-ink] md:text-3xl">
            {batch.subtitle}
          </h3>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border-2 border-[--color-ink] px-3 py-1 text-[11px] font-bold shadow-[2px_2px_0_var(--color-ink)]"
          )}
          style={{
            background: isOpen ? "#fff" : isClosed ? "var(--color-bg-soft)" : "#fff",
            color: "var(--color-ink)",
          }}
        >
          <span className="relative flex h-1.5 w-1.5">
            {isOpen && (
              <span
                className="absolute inset-0 animate-ping rounded-full opacity-70"
                style={{ background: statusDot }}
              />
            )}
            <span
              className="relative inline-flex h-1.5 w-1.5 rounded-full"
              style={{ background: statusDot }}
            />
          </span>
          {statusLabel}
        </span>
      </div>

      <p className="relative z-10 mt-5 text-sm leading-relaxed text-[--color-ink]/85">{batch.desc}</p>

      <ul className="relative z-10 mt-5 space-y-2 text-sm">
        {batch.bullets.map((bullet) => (
          <li key={bullet} className="flex items-center gap-2 text-[--color-ink]">
            <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-[--color-ink] bg-white">
              <Check size={12} className="text-[--color-ink]" strokeWidth={3} />
            </span>
            {bullet}
          </li>
        ))}
      </ul>

      <a
        href={batch.featured ? "#aplicar" : "#"}
        data-cursor={batch.cta}
        className="toon-btn relative z-10 mt-7"
        style={batch.featured ? undefined : { background: "#fff" }}
      >
        {batch.cta}
        <ArrowRight size={14} />
      </a>

      {isSoon && <ProximamenteBanner />}
    </article>
  );
}

function ProximamenteBanner() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute -right-6 top-8 z-20 rotate-[25deg] whitespace-nowrap bg-[var(--color-ink)] px-6 py-2 font-display text-sm font-extrabold uppercase tracking-widest text-white shadow-[4px_4px_0_rgba(0,0,0,0.4)]"
    >
      <span className="inline-flex items-center gap-1.5">
        <Sprout size={13} strokeWidth={2.5} />
        Próximamente
      </span>
    </div>
  );
}

function CrossedToolsWatermark() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center"
    >
      <div className="relative h-44 w-44 opacity-15 md:h-56 md:w-56">
        <Hammer
          className="absolute inset-0 m-auto h-full w-full text-[--color-ink]"
          strokeWidth={2.5}
          style={{ transform: "rotate(-35deg)" }}
        />
        <Wrench
          className="absolute inset-0 m-auto h-full w-full text-[--color-ink]"
          strokeWidth={2.5}
          style={{ transform: "rotate(45deg)" }}
        />
      </div>
    </div>
  );
}

