"use client";

import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { Magnetic } from "@/components/magnetic";

export function CTA() {
  return (
    <section
      id="aplicar"
      aria-label="Convocatoria"
      className="relative isolate overflow-hidden px-6 py-28 md:px-10 md:py-36 toon-section toon-section--deep"
    >
      {/* Decorative stickers */}
      <svg
        viewBox="0 0 64 64"
        className="absolute top-12 left-10 h-16 w-16 opacity-90 md:left-24"
        aria-hidden
        style={{ transform: "rotate(-18deg)" }}
      >
        <path
          d="M32 6 C 50 14, 56 32, 42 52 C 30 60, 14 56, 10 38 C 8 22, 18 10, 32 6 Z"
          fill="#5EEAD4"
          stroke="#0F172A"
          strokeWidth={2.5}
        />
      </svg>
      <svg
        viewBox="0 0 64 64"
        className="absolute bottom-12 right-10 h-20 w-20 opacity-90 md:right-32"
        aria-hidden
        style={{ transform: "rotate(22deg)" }}
      >
        <path
          d="M8 56 C 8 28, 28 8, 56 8 C 56 36, 36 56, 8 56 Z"
          fill="#38BDF8"
          stroke="#0F172A"
          strokeWidth={2.5}
        />
      </svg>

      <div className="relative mx-auto max-w-3xl text-center">
        <Reveal className="mb-6 inline-flex items-center">
          <span
            className="toon-pill"
            style={{ background: "var(--color-accent-soft)" }}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-[--color-ink] opacity-50" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[--color-ink]" />
            </span>
            Batch 9 · Próximamente
          </span>
        </Reveal>

        <Reveal delay={0.08}>
          <h2 className="text-balance font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
            Aquí no solo creces profesionalmente,{" "}
            <span
              className="font-handwritten"
              style={{
                color: "var(--color-accent-soft)",
                fontWeight: 700,
                fontSize: "1.15em",
                display: "inline-block",
                transform: "rotate(-2deg)",
              }}
            >
              creces como persona.
            </span>
          </h2>
        </Reveal>

        <Reveal delay={0.2}>
          <p className="mx-auto mt-6 max-w-xl text-base text-white/80 md:text-lg">
            Si estás listo para transformar tu vida con tecnología, propósito y comunidad, este es tu lugar.
          </p>
        </Reveal>

        <Reveal delay={0.32}>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Magnetic strength={0.3}>
              <a
                href="#"
                data-cursor="Postular"
                className="toon-btn"
                style={{ background: "var(--color-accent-soft)" }}
              >
                Avísame cuando abra
                <ArrowRight size={16} />
              </a>
            </Magnetic>
            <a
              href="#"
              data-cursor="Mentor"
              className="toon-btn toon-btn--white"
            >
              Hablar con un mentor
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
