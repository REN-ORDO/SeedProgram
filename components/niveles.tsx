"use client";

import { Reveal, RevealStagger, RevealItem } from "@/components/reveal";
import { niveles } from "@/lib/data";
import { cn } from "@/lib/utils";

const badgeBgs = ["#BAE6FD", "#5EEAD4", "#7DD3FC", "#2DD4BF", "#38BDF8", "#0D9488"];

export function Niveles() {
  return (
    <section
      id="niveles"
      aria-label="Niveles"
      className="relative px-5 py-16 md:px-10 md:py-32"
      style={{ background: "var(--color-bg)" }}
    >
      <div className="mx-auto max-w-5xl">
        <Reveal className="mb-3 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-[--color-fg-subtle]">
          <span className="font-bold text-[--color-ink]">02</span>
          <span className="h-[2px] w-12 bg-[var(--color-ink)]" />
          <span>Hoja de ruta</span>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="text-balance font-display text-4xl font-bold leading-[1.05] tracking-tight text-[--color-ink] md:text-6xl">
            Una escalera,{" "}
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
              nueve niveles
            </span>
            .
          </h2>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-[--color-fg-muted] md:text-lg">
            Tu evolución no es lineal. Cada nivel suma autonomía, responsabilidad
            y liderazgo. Pasas por evaluación cada 3 meses.
          </p>
        </Reveal>

        <RevealStagger className="mt-12 space-y-4">
          {niveles.map((n, i) => {
            const isLast = n.highlight;
            const rotate = (i % 2 === 0 ? -1 : 1) * 0.7;
            return (
              <RevealItem key={n.num}>
                <article
                  className={cn(
                    "toon-card flex flex-col gap-4 p-5 md:flex-row md:items-center md:gap-6 md:p-6"
                  )}
                  style={{
                    background: isLast ? "var(--color-accent-soft)" : "#ffffff",
                    transform: `rotate(${rotate}deg)`,
                  }}
                  data-cursor="Nivel"
                >
                  <div
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-[--color-ink] font-display text-2xl font-bold text-[--color-ink] shadow-[3px_3px_0_var(--color-ink)]"
                    style={{ background: badgeBgs[i % badgeBgs.length] }}
                  >
                    {n.num}
                  </div>
                  <div className="flex-1">
                    <div className="font-display text-lg font-bold text-[--color-ink] md:text-xl">
                      {n.name}
                    </div>
                    <div className="text-xs text-[--color-fg-subtle] md:text-sm">
                      {n.role}
                    </div>
                  </div>
                  <span
                    className="inline-flex items-center self-start rounded-full border-2 border-[--color-ink] bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[--color-ink] shadow-[2px_2px_0_var(--color-ink)] md:self-auto"
                  >
                    {n.leadership}
                  </span>
                  <p className="text-sm text-[--color-ink]/80 md:max-w-xs md:text-sm">
                    {n.desc}
                  </p>
                </article>
              </RevealItem>
            );
          })}
        </RevealStagger>
      </div>
    </section>
  );
}
