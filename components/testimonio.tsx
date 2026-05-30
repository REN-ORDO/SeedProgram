"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Sprout } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { testimonios, type Testimonio } from "@/lib/data";

const AUTO_MS = 3000;

// Windowed pagination dots — show at most DOT_WINDOW dots at once and slide the
// row left as `index` advances, so the indicator never gets crowded for long
// testimonio lists.
const DOT_WINDOW = 5;
const DOT_SIZE = 12; // px (h-3 w-3)
const DOT_GAP = 8; // px (gap-2)
const DOT_STEP = DOT_SIZE + DOT_GAP;

// Direction-aware horizontal slide variants for the testimonio body.
const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({
    x: dir > 0 ? -80 : 80,
    opacity: 0,
  }),
};

export function TestimonioSection() {
  const reduce = useReducedMotion();
  const [[index, direction], setIndexState] = useState<[number, number]>([0, 0]);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<number | null>(null);

  const goto = useCallback((i: number, dir?: number) => {
    setIndexState(([prev]) => {
      const total = testimonios.length;
      const next = ((i % total) + total) % total;
      const resolvedDir = dir ?? (next > prev ? 1 : next < prev ? -1 : 1);
      return [next, resolvedDir];
    });
  }, []);

  const next = useCallback(() => goto(index + 1, 1), [goto, index]);
  const prev = useCallback(() => goto(index - 1, -1), [goto, index]);

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
  const total = testimonios.length;

  // Sliding-window dot start position. When `total <= DOT_WINDOW`, lock at 0
  // (no slide). Otherwise center the active dot in the window, clamped to the
  // valid range so we never overshoot at either end.
  const useWindow = total > DOT_WINDOW;
  const dotStart = useWindow
    ? Math.max(0, Math.min(index - Math.floor(DOT_WINDOW / 2), total - DOT_WINDOW))
    : 0;
  const dotsContainerWidth = useWindow
    ? DOT_WINDOW * DOT_SIZE + (DOT_WINDOW - 1) * DOT_GAP
    : total * DOT_SIZE + Math.max(0, total - 1) * DOT_GAP;

  return (
    <section
      aria-label="Historia"
      aria-roledescription="carousel"
      className="relative px-5 py-16 md:px-10 md:py-32"
      style={{ background: "var(--color-bg)" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-[--color-fg-subtle]">
            <span className="font-bold text-[--color-ink]">·</span>
            <span>Historias</span>
            <span className="text-[--color-fg-subtle]">
              {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </span>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <button
              type="button"
              aria-label="Historia anterior"
              onClick={prev}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-[--color-ink] bg-white text-[--color-ink] shadow-[3px_3px_0_var(--color-ink)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_var(--color-ink)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              <ChevronLeft size={18} strokeWidth={3} />
            </button>

            {/* Windowed dot pagination */}
            <div
              className="overflow-hidden"
              style={{ width: dotsContainerWidth, height: DOT_SIZE }}
            >
              <motion.div
                className="flex items-center"
                style={{ gap: DOT_GAP }}
                animate={{ x: -dotStart * DOT_STEP }}
                transition={
                  reduce
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 320, damping: 32, mass: 0.6 }
                }
              >
                {testimonios.map((tt, i) => (
                  <button
                    key={tt.id}
                    type="button"
                    aria-label={`Ver historia ${i + 1}`}
                    aria-current={i === index}
                    onClick={() => goto(i)}
                    className="group inline-flex shrink-0 items-center justify-center"
                    style={{ width: DOT_SIZE, height: DOT_SIZE }}
                  >
                    <span
                      className="h-3 w-3 rounded-full border-2 border-[--color-ink] transition-colors"
                      style={{
                        background: i === index ? "var(--color-accent)" : "#fff",
                      }}
                    />
                  </button>
                ))}
              </motion.div>
            </div>

            <button
              type="button"
              aria-label="Siguiente historia"
              onClick={next}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-[--color-ink] bg-[var(--color-accent)] text-[--color-ink] shadow-[3px_3px_0_var(--color-ink)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_var(--color-ink)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              <ChevronRight size={18} strokeWidth={3} />
            </button>
          </div>
        </Reveal>

        {/* Body — direction-aware horizontal slide.
            Padding gives room for toon-card hard shadows (offset 6px) and
            slight card rotation; overflow-hidden still clips the off-screen
            slide animation because x travel (±80px) exceeds the padding. */}
        <div className="relative min-h-[520px] overflow-hidden p-3 -m-3 md:min-h-[460px] md:p-5 md:-m-5">
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.div
              key={t.id}
              custom={direction}
              variants={reduce ? undefined : slideVariants}
              initial={reduce ? false : "enter"}
              animate={reduce ? undefined : "center"}
              exit={reduce ? undefined : "exit"}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="grid items-center gap-10 md:grid-cols-12"
            >
              <div className="md:col-span-5">
                <Portrait t={t} />
                <div className="mt-4 text-sm font-semibold italic text-[--color-fg-muted]">
                  {t.name} · {t.badge}
                </div>
                <div className="mt-1 inline-flex items-center gap-2 text-xs font-mono text-[--color-fg-subtle]">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
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
          quality={100}
          unoptimized
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
        <span
          className="toon-pill inline-flex items-center gap-1.5"
          style={{ background: "#fff" }}
        >
          <Sprout
            size={14}
            strokeWidth={2.5}
            aria-hidden
            className="text-[var(--color-accent-strong)]"
          />
          {t.badge.split("·").slice(-1)[0].trim()}
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
