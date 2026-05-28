"use client";

import { Heart, Lightbulb, MessagesSquare, RefreshCw, Eye, Mic2 } from "lucide-react";
import { Reveal, RevealStagger, RevealItem } from "@/components/reveal";
import { valores, type Valor } from "@/lib/data";

const iconMap = {
  heart: Heart,
  spark: Lightbulb,
  share: MessagesSquare,
  loop: RefreshCw,
  eye: Eye,
  talk: Mic2,
};

const cardBgs = ["#BAE6FD", "#5EEAD4", "#7DD3FC", "#2DD4BF", "#38BDF8", "#0D9488"];
const cardRotates = [-1, 1.5, -1.5, 1, -1, 1.5];

export function Cultura() {
  return (
    <section
      id="cultura"
      aria-label="Cultura"
      className="relative px-5 py-16 md:px-10 md:py-32 toon-section toon-section--soft"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-3 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-[--color-fg-subtle]">
          <span className="font-bold text-[--color-ink]">04</span>
          <span className="h-[2px] w-12 bg-[var(--color-ink)]" />
          <span>Manifiesto · ADN</span>
        </Reveal>

        <div className="mb-14 max-w-3xl">
          <Reveal delay={0.05}>
            <h2 className="text-balance font-display text-4xl font-bold leading-[1.05] tracking-tight text-[--color-ink] md:text-6xl">
              Cinco valores.{" "}
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
                Una cultura
              </span>
              .
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="mt-5 text-base leading-relaxed text-[--color-fg-muted] md:text-lg">
              No son posters en la pared. Son la forma en que decidimos, discutimos y crecemos.
            </p>
          </Reveal>
        </div>

        <RevealStagger
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          stagger={0.06}
        >
          {valores.map((v, i) => (
            <RevealItem key={v.title}>
              <ValorCard valor={v} index={i} />
            </RevealItem>
          ))}
        </RevealStagger>
      </div>
    </section>
  );
}

function ValorCard({ valor, index }: { valor: Valor; index: number }) {
  const Icon = iconMap[valor.icon];
  const isFeat = valor.featured;
  return (
    <article
      className="toon-card relative h-full p-6"
      style={{
        background: isFeat ? "var(--color-ink)" : cardBgs[index % cardBgs.length],
        color: isFeat ? "#fff" : "var(--color-ink)",
        transform: `rotate(${cardRotates[index % cardRotates.length]}deg)`,
      }}
      data-cursor="Valor"
    >
      <span
        className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-[--color-ink] shadow-[3px_3px_0_var(--color-ink)]"
        style={{
          background: isFeat ? "var(--color-accent-soft)" : "#fff",
          color: "var(--color-ink)",
        }}
      >
        <Icon size={22} />
      </span>
      <h3 className="mt-5 font-display text-xl font-bold leading-tight">
        {valor.title}
      </h3>
      <p
        className="mt-2 text-sm leading-relaxed"
        style={{ color: isFeat ? "rgba(255,255,255,0.85)" : "rgba(15,23,42,0.8)" }}
      >
        {valor.desc}
      </p>
    </article>
  );
}
