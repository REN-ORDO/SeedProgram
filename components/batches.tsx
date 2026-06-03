"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, ChevronDown, Hammer, Wrench, Sprout, X, Quote } from "lucide-react";
import Image from "next/image";
import { Reveal, RevealStagger, RevealItem } from "@/components/reveal";
import { batches, testimonios, type Batch } from "@/lib/data";
import { cn } from "@/lib/utils";

export function Batches() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [modalBatchId, setModalBatchId] = useState<string | null>(null);

  const modalTestimonios = modalBatchId
    ? testimonios.filter((t) => t.batch === modalBatchId)
    : [];
  const modalBatch = batches.find((b) => b.id === modalBatchId);

  return (
    <section
      id="batches"
      aria-label="Batches"
      className="relative px-5 py-16 md:px-10 md:py-32"
      style={{ background: "var(--color-bg)" }}
    >
      <div className="mx-auto max-w-7xl">
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

        <RevealStagger className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {batches.map((b, i) => (
            <RevealItem key={b.id}>
              <BatchCard
                batch={b}
                index={i}
                expanded={openIndex === i}
                onToggle={() => setOpenIndex(openIndex === i ? null : i)}
                onOpenTestimonios={() => setModalBatchId(b.id)}
              />
            </RevealItem>
          ))}
        </RevealStagger>
      </div>

      {/* Modal testimonios */}
      <AnimatePresence>
        {modalBatchId && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setModalBatchId(null)}
            />
            <motion.div
              key="modal"
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.96 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="fixed inset-x-4 top-1/2 z-50 mx-auto max-w-2xl -translate-y-1/2 overflow-hidden rounded-2xl border-2 border-[--color-ink] bg-[var(--color-bg)] shadow-[6px_6px_0_var(--color-ink)] md:inset-x-auto md:w-full"
            >
              {/* Header modal */}
              <div className="flex items-center justify-between border-b-2 border-[--color-ink] px-6 py-4">
                <div>
                  <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-[--color-fg-subtle]">
                    {modalBatch?.title}
                  </p>
                  <h3 className="font-display text-xl font-bold text-[--color-ink]">
                    Testimonios
                  </h3>
                </div>
                <button
                  onClick={() => setModalBatchId(null)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[--color-ink] bg-white shadow-[2px_2px_0_var(--color-ink)] transition-transform hover:scale-105"
                >
                  <X size={16} strokeWidth={2.5} />
                </button>
              </div>

              {/* Testimonios */}
              <div className="max-h-[60vh] overflow-y-auto p-6">
                {modalTestimonios.length === 0 ? (
                  <p className="text-center text-sm text-[--color-fg-muted]">
                    Aún no hay testimonios para este batch.
                  </p>
                ) : (
                  <div className="space-y-5">
                    {modalTestimonios.map((t) => (
                      <div
                        key={t.id}
                        className="toon-card flex gap-4 p-5"
                        style={{ background: t.accent ?? "var(--color-bg-soft)" }}
                      >
                        {/* Foto */}
                        <div className="shrink-0">
                          {t.photo ? (
                            <div className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-[--color-ink] shadow-[2px_2px_0_var(--color-ink)]">
                              <Image src={t.photo} alt={t.name} fill className="object-cover" />
                            </div>
                          ) : (
                            <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-[--color-ink] bg-white font-display text-xl font-bold text-[--color-ink] shadow-[2px_2px_0_var(--color-ink)]">
                              {t.initial ?? t.name[0]}
                            </div>
                          )}
                        </div>
                        {/* Contenido */}
                        <div className="flex-1">
                          <p className="font-display text-sm font-bold text-[--color-ink]">{t.name}</p>
                          <p className="text-[11px] text-[--color-ink]/60">{t.badge}</p>
                          <p className="mt-2 text-sm italic leading-relaxed text-[--color-ink]/80">
                            <Quote size={12} className="mr-1 inline opacity-50" />
                            {t.quote}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}

function BatchCard({
  batch,
  index,
  expanded,
  onToggle,
  onOpenTestimonios,
}: {
  batch: Batch;
  index: number;
  expanded: boolean;
  onToggle: () => void;
  onOpenTestimonios: () => void;
}) {
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
  const hasTesimonios = testimonios.some((t) => t.batch === batch.id);

  return (
    <article
      className="toon-card relative overflow-hidden"
      style={{ background: bg, transform: `rotate(${rotate}deg)`, opacity: isClosed ? 0.92 : 1 }}
      data-cursor={batch.title}
    >
      {isSoon && <CrossedToolsWatermark />}

      {/* Header */}
      <button
        onClick={onToggle}
        className="relative z-10 flex w-full items-start justify-between gap-3 p-6 text-left min-h-[10rem]"
      >
        <div className="flex-1">
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-[--color-ink]/70">
            {batch.title}
          </div>
          <h3 className="mt-1 font-display text-xl font-bold leading-tight text-[--color-ink] md:text-2xl">
            {batch.subtitle}
          </h3>
          {!isSoon && (
            <span
              className={cn(
                "mt-2 inline-flex items-center gap-1.5 rounded-full border-2 border-[--color-ink] px-3 py-0.5 text-[11px] font-bold shadow-[2px_2px_0_var(--color-ink)]"
              )}
              style={{ background: isOpen ? "#fff" : "var(--color-bg-soft)", color: "var(--color-ink)" }}
            >
              <span className="relative flex h-1.5 w-1.5">
                {isOpen && (
                  <span
                    className="absolute inset-0 animate-ping rounded-full opacity-70"
                    style={{ background: statusDot }}
                  />
                )}
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ background: statusDot }} />
              </span>
              {statusLabel}
            </span>
          )}
        </div>
        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="mt-1 shrink-0 text-[--color-ink]"
        >
          <ChevronDown size={18} strokeWidth={2.5} />
        </motion.span>
      </button>

      {/* Contenido expandible */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="relative z-10 flex h-[26rem] flex-col justify-between px-6 pb-6">
              <p className="text-sm leading-relaxed text-[--color-ink]/85">{batch.desc}</p>

              <ul className="mt-4 space-y-2 text-sm">
                {batch.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-center gap-2 text-[--color-ink]">
                    <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-[--color-ink] bg-white">
                      <Check size={12} className="text-[--color-ink]" strokeWidth={3} />
                    </span>
                    {bullet}
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex flex-col gap-3">
                {hasTesimonios && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onOpenTestimonios(); }}
                    className="toon-btn w-full justify-center"
                    style={{ background: "#fff" }}
                  >
                    Ver testimonios
                    <ArrowRight size={14} />
                  </button>
                )}
                {batch.featured && (
                  <a
                    href="#aplicar"
                    data-cursor={batch.cta}
                    className="toon-btn w-full justify-center"
                  >
                    {batch.cta}
                    <ArrowRight size={14} />
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
