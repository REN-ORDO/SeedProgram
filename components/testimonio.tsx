"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { testimonios, type Testimonio } from "@/lib/data";

const AUTO_MS = 3000;

export function TestimonioSection() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<number | null>(null);

  const goto = useCallback((i: number) => {
    setIndex(((i % testimonios.length) + testimonios.length) % testimonios.length);
  }, []);
  const next = useCallback(() => goto(index + 1), [goto, index]);
  const prev = useCallback(() => goto(index - 1), [goto, index]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  useEffect(() => {
    if (reduce || paused) return;
    timerRef.current = window.setTimeout(next, AUTO_MS);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [index, paused, reduce, next]);

  const t = testimonios[index];

  return (
    <section
      aria-label="Historia"
      aria-roledescription="carousel"
      className="relative px-6 py-24 md:px-10 md:py-32"
      style={{ background: "var(--color-bg)" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-[--color-fg-subtle]">
            <span className="font-bold text-[--color-ink]">·</span>
            <span>Historias</span>
            <span className="text-[--color-fg-subtle]">
              {String(index + 1).padStart(2, "0")} / {String(testimonios.length).padStart(2, "0")}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Historia anterior"
              onClick={prev}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-[--color-ink] bg-white text-[--color-ink] shadow-[3px_3px_0_var(--color-ink)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_var(--color-ink)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              <ChevronLeft size={18} strokeWidth={3} />
            </button>

            <div className="flex items-center gap-2">
              {testimonios.map((tt, i) => (
                <button
                  key={tt.id}
                  type="button"
                  aria-label={`Ver historia ${i + 1}`}
                  aria-current={i === index}
                  onClick={() => goto(i)}
                  className="group inline-flex h-3 w-3 items-center justify-center"
                >
                  <span
                    className="h-3 w-3 rounded-full border-2 border-[--color-ink] transition-colors"
                    style={{
                      background: i === index ? "var(--color-accent)" : "#fff",
                    }}
                  />
                </button>
              ))}
            </div>

            <button
              type="button"
              aria-label="Siguiente historia"
              onClick={next}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-[--color-ink] bg-[--color-accent] text-[--color-ink] shadow-[3px_3px_0_var(--color-ink)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_var(--color-ink)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              <ChevronRight size={18} strokeWidth={3} />
            </button>
          </div>
        </Reveal>

        <div className="relative min-h-[520px] md:min-h-[460px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={t.id}
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -16 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="grid items-center gap-10 md:grid-cols-12"
            >
              <div className="md:col-span-5">
                <Portrait t={t} />
                <div className="mt-4 text-sm font-semibold italic text-[--color-fg-muted]">
                  {t.name} · {t.badge}
                </div>
                <div className="mt-1 inline-flex items-center gap-2 text-xs font-mono text-[--color-fg-subtle]">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[--color-accent]" />
                  {t.tenure}
                </div>
              </div>

              <div className="md:col-span-7">
                <h3 className="text-balance font-display text-3xl font-bold leading-tight text-[--color-ink] md:text-5xl">
                  {t.headline}
                </h3>
                <p className="mt-6 text-base leading-relaxed text-[--color-fg-muted] md:text-lg">
                  {t.body}
                </p>
                <blockquote
                  className="toon-card mt-8 p-7"
                  style={{ background: "#BAE6FD", transform: "rotate(-1deg)" }}
                >
                  <p
                    className="font-handwritten text-2xl leading-snug text-[--color-ink] md:text-3xl"
                    style={{ fontWeight: 600 }}
                  >
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <footer className="mt-4 text-sm font-bold text-[--color-ink]">
                    — {t.name}
                  </footer>
                </blockquote>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress bar */}
        {!reduce && (
          <div className="mt-10 h-1.5 w-full overflow-hidden rounded-full border-2 border-[--color-ink] bg-white">
            <motion.div
              key={`${t.id}-${paused}`}
              className="h-full"
              style={{ background: "var(--color-accent)" }}
              initial={{ width: "0%" }}
              animate={{ width: paused ? "0%" : "100%" }}
              transition={{ duration: paused ? 0 : AUTO_MS / 1000, ease: "linear" }}
            />
          </div>
        )}
      </div>
    </section>
  );
}

function Portrait({ t }: { t: Testimonio }) {
  const reduce = useReducedMotion();
  const bg = t.accent ?? "var(--color-accent-soft)";
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, scale: 0.94, rotate: -3 }}
      animate={{ opacity: 1, scale: 1, rotate: -2 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="toon-card relative aspect-square w-full overflow-hidden p-0"
      style={{ background: bg }}
    >
      {t.photo ? (
        <Image
          src={t.photo}
          alt={`Retrato toon de ${t.name}`}
          fill
          sizes="(min-width: 768px) 40vw, 90vw"
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="font-display text-[12rem] font-extrabold leading-none text-[--color-ink]/40 md:text-[14rem]"
          >
            {t.initial ?? t.name[0]}
          </span>
        </div>
      )}

      <div className="absolute top-5 left-5 z-10">
        <span className="toon-pill" style={{ background: "#fff" }}>
          🌱 {t.badge.split("·").slice(-1)[0].trim()}
        </span>
      </div>

      {t.placeholder && (
        <div className="absolute bottom-5 right-5 z-10">
          <span
            className="toon-pill"
            style={{ background: "var(--color-ink)", color: "#fff" }}
          >
            TODO
          </span>
        </div>
      )}
    </motion.div>
  );
}
