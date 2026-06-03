"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Sprout } from "lucide-react";
import { Reveal, RevealStagger, RevealItem } from "@/components/reveal";
import { testimonios, batches } from "@/lib/data";
import { cn } from "@/lib/utils";

const batchesConTestimonios = batches.filter((b) =>
  testimonios.some((t) => t.batch === b.id)
);

export function BatchTestimonios() {
  const [activeBatch, setActiveBatch] = useState(batchesConTestimonios[0]?.id ?? null);

  // Recibe el evento de las batch cards
  useEffect(() => {
    const handler = (e: Event) => {
      const batchId = (e as CustomEvent<{ batchId: string }>).detail.batchId;
      setActiveBatch(batchId);
      document.getElementById("batch-testimonios")?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    window.addEventListener("filter-testimonios", handler);
    return () => window.removeEventListener("filter-testimonios", handler);
  }, []);

  const filtered = testimonios.filter((t) => t.batch === activeBatch);
  const activeBatchData = batches.find((b) => b.id === activeBatch);

  return (
    <section
      id="batch-testimonios"
      aria-label="Testimonios por batch"
      className="relative px-5 py-16 md:px-10 md:py-32"
      style={{ background: "var(--color-bg-soft)" }}
    >
      <div className="mx-auto max-w-6xl">
        {/* Eyebrow */}
        <Reveal className="mb-3 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-[--color-fg-subtle]">
          <span className="font-bold text-[--color-ink]">06</span>
          <span className="h-[2px] w-12 bg-[var(--color-ink)]" />
          <span>Voces del Semillero</span>
        </Reveal>

        {/* Título */}
        <Reveal delay={0.05} className="mb-10 max-w-2xl">
          <h2 className="text-balance font-display text-4xl font-bold leading-[1.05] tracking-tight text-[--color-ink] md:text-5xl">
            Ellos lo vivieron.{" "}
            <span
              className="font-handwritten"
              style={{
                color: "var(--color-accent-strong)",
                fontWeight: 700,
                fontSize: "1.1em",
                display: "inline-block",
                transform: "rotate(-2deg)",
              }}
            >
              Ellos lo cuentan.
            </span>
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-[--color-fg-muted]">
            Cada batch es una historia distinta. Aquí van las palabras de quienes lo vivieron desde adentro — sin editar, sin filtros.
          </p>
        </Reveal>

        {/* Tabs de batch */}
        <Reveal delay={0.08} className="mb-10 flex flex-wrap gap-3">
          {batchesConTestimonios.map((b) => (
            <button
              key={b.id}
              onClick={() => setActiveBatch(b.id)}
              className={cn(
                "rounded-full border-2 border-[--color-ink] px-5 py-1.5 font-display text-sm font-bold transition-all",
                activeBatch === b.id
                  ? "bg-[var(--color-ink)] text-white shadow-[3px_3px_0_var(--color-accent)]"
                  : "bg-white text-[--color-ink] shadow-[2px_2px_0_var(--color-ink)] hover:-translate-y-0.5 hover:shadow-[4px_4px_0_var(--color-ink)]"
              )}
            >
              {b.title}
            </button>
          ))}
        </Reveal>

        {/* Subtítulo del batch activo */}
        <AnimatePresence mode="wait">
          <motion.p
            key={activeBatch}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="mb-8 font-mono text-xs uppercase tracking-widest text-[--color-fg-subtle]"
          >
            {activeBatchData?.subtitle}
          </motion.p>
        </AnimatePresence>

        {/* Grid de tarjetas */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeBatch}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <RevealStagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((t, i) => (
                <RevealItem key={t.id}>
                  <article
                    className="toon-card flex flex-col gap-4 p-6"
                    style={{
                      background: t.accent ?? "var(--color-bg-soft)",
                      transform: i % 2 === 0 ? "rotate(-1deg)" : "rotate(1deg)",
                    }}
                  >
                    {/* Foto + nombre */}
                    <div className="flex items-center gap-3">
                      {t.photo ? (
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-[--color-ink] shadow-[2px_2px_0_var(--color-ink)]">
                          <Image src={t.photo} alt={t.name} fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-[--color-ink] bg-white font-display text-xl font-bold text-[--color-ink] shadow-[2px_2px_0_var(--color-ink)]">
                          {t.initial ?? t.name[0]}
                        </div>
                      )}
                      <div>
                        <p className="font-display text-base font-bold text-[--color-ink]">{t.name}</p>
                        <span className="inline-flex items-center gap-1 rounded-full border border-[--color-ink]/30 bg-white/60 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-[--color-ink]/70">
                          <Sprout size={10} strokeWidth={2.5} />
                          {t.badge.split("·").slice(-1)[0].trim()}
                        </span>
                      </div>
                    </div>

                    {/* Headline */}
                    <p className="font-display text-sm font-bold leading-snug text-[--color-ink]">
                      {t.headline}
                    </p>

                    {/* Quote */}
                    <blockquote className="mt-auto border-l-4 border-[--color-ink]/30 pl-3 font-handwritten text-lg leading-snug text-[--color-ink]">
                      "{t.quote}"
                    </blockquote>
                  </article>
                </RevealItem>
              ))}
            </RevealStagger>

            {filtered.length === 0 && (
              <p className="text-center text-sm text-[--color-fg-muted]">
                Próximamente testimonios de este batch.
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
