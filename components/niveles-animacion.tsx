"use client";

/**
 * Modal del botón "Ver animación" (sección Niveles).
 * Escena 3D fullscreen: una semilla cae, rebota y crece hasta volverse árbol.
 * - La escena (three.js) se carga lazy — solo cuando se abre el modal.
 * - Mientras está abierto, el scroll de la página queda bloqueado por completo.
 * - Al terminar la animación, los puntos de progreso navegan entre niveles
 *   (también con ← → del teclado).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Sprout, X } from "lucide-react";
import { niveles } from "@/lib/data";
import { STAGE_TIMES } from "@/lib/semilla-timeline";
import type { SemillaSceneApi } from "@/components/semilla-scene";

const SemillaScene = dynamic(
  () => import("@/components/semilla-scene").then((m) => m.SemillaScene),
  { ssr: false, loading: () => <SceneLoader /> }
);

function SceneLoader() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
      <motion.div
        animate={{ scale: [1, 1.15, 1], rotate: [0, -6, 6, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        className="flex h-16 w-16 items-center justify-center rounded-full border border-[#14b8a6]/40 bg-[#14b8a6]/10 text-[#5eead4]"
      >
        <Sprout size={30} />
      </motion.div>
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-white/45">
        Plantando la escena…
      </p>
    </div>
  );
}

export function NivelesAnimacionModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open && <AnimacionContent key="niveles-anim" onClose={onClose} />}
    </AnimatePresence>
  );
}

function AnimacionContent({ onClose }: { onClose: () => void }) {
  const [stage, setStage] = useState(0);
  const [runId, setRunId] = useState(0);
  const [finished, setFinished] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<SemillaSceneApi | null>(null);

  const goTo = useCallback((i: number) => {
    const idx = Math.min(Math.max(i, 0), STAGE_TIMES.length - 1);
    apiRef.current?.seek(STAGE_TIMES[idx]);
  }, []);

  // stage en ref para los atajos de teclado sin re-suscribir
  const stageRef = useRef(stage);
  useEffect(() => {
    stageRef.current = stage;
  }, [stage]);

  // Esc cierra; ← → navegan niveles cuando la animación ya terminó
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (finished && e.key === "ArrowRight") goTo(stageRef.current + 1);
      if (finished && e.key === "ArrowLeft") goTo(stageRef.current - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, finished, goTo]);

  // Bloqueo total del scroll de fondo: overflow en <html> y <body> +
  // wheel/touchmove cancelados en el overlay (cubre trackpads y móvil).
  useEffect(() => {
    const html = document.documentElement;
    const prevHtml = html.style.overflow;
    const prevBody = document.body.style.overflow;
    html.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    const root = rootRef.current;
    const block = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };
    root?.addEventListener("wheel", block, { passive: false });
    root?.addEventListener("touchmove", block, { passive: false });

    return () => {
      html.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
      root?.removeEventListener("wheel", block);
      root?.removeEventListener("touchmove", block);
    };
  }, []);

  const nivel = niveles[stage] ?? niveles[0];

  return (
    <motion.div
      ref={rootRef}
      className="fixed inset-0 z-[120] flex flex-col overscroll-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      role="dialog"
      aria-modal="true"
      aria-label="Animación del recorrido: de semilla a árbol"
      style={{
        background:
          "radial-gradient(ellipse 70% 60% at 50% 38%, #0c4a6e 0%, #07283a 55%, #061521 100%)",
      }}
    >
      {/* Atardecer dorado: crossfade del fondo en las etapas finales */}
      <div
        aria-hidden
        className="absolute inset-0 transition-opacity duration-[2500ms] ease-in-out"
        style={{
          opacity: stage >= 7 ? 1 : 0,
          background:
            "radial-gradient(ellipse 70% 60% at 50% 38%, #4f3c0e 0%, #16120a 55%, #061521 100%)",
        }}
      />

      {/* Escena 3D a pantalla completa */}
      <div className="absolute inset-0">
        <SemillaScene
          key={runId}
          onStage={setStage}
          onComplete={() => setFinished(true)}
          apiRef={apiRef}
          className="h-full w-full [&>div]:h-full [&>div]:w-full"
        />
      </div>

      {/* Top bar */}
      <div className="pointer-events-none relative z-10 flex items-center justify-between px-5 py-4 md:px-8">
        <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-white/45">
          <span className="font-bold text-white/65">02</span>
          <span className="h-px w-8 bg-white/25" />
          <span>De semilla a árbol</span>
        </div>
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 backdrop-blur-sm transition hover:bg-white/10 hover:text-white"
        >
          <X size={18} />
        </button>
      </div>

      {/* HUD inferior: nivel actual + progreso + replay */}
      <div className="pointer-events-none relative z-10 mt-auto flex flex-col gap-4 px-5 pb-6 md:flex-row md:items-end md:justify-between md:px-8 md:pb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={nivel.num}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="max-w-sm"
          >
            <div className="flex items-center gap-3">
              <span
                className="font-display text-3xl font-bold transition-colors duration-700 md:text-4xl"
                style={{ color: stage >= 7 ? "#fbbf24" : "#5eead4" }}
              >
                {nivel.num}
              </span>
              <div>
                <div className="font-display text-lg font-bold text-white md:text-xl">
                  {nivel.name}
                </div>
                <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/50">
                  {nivel.role} · {nivel.leadership}
                </div>
              </div>
            </div>
            <p className="mt-2 text-sm text-white/55">{nivel.desc}</p>
          </motion.div>
        </AnimatePresence>

        <div className="flex flex-col items-start gap-2 md:items-end">
          <div className="flex items-center gap-4">
            {/* Progreso: 9 puntos — clickeables al terminar la animación */}
            <div className="flex items-center gap-1.5">
              {niveles.map((n, i) => (
                <button
                  key={n.num}
                  type="button"
                  disabled={!finished}
                  onClick={() => goTo(i)}
                  aria-label={`Ver nivel ${n.name}`}
                  className={
                    "h-1.5 rounded-full transition-all duration-500 " +
                    (finished
                      ? "pointer-events-auto cursor-pointer hover:!bg-[#5eead4]"
                      : "cursor-default")
                  }
                  style={{
                    width: i === stage ? 22 : 7,
                    background:
                      i <= stage
                        ? i >= 7
                          ? "#fbbf24"
                          : "#2dd4bf"
                        : "rgba(255,255,255,0.18)",
                  }}
                />
              ))}
            </div>

            <button
              onClick={() => {
                setStage(0);
                setFinished(false);
                setRunId((r) => r + 1);
              }}
              className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 font-mono text-xs uppercase tracking-[0.14em] text-white/70 backdrop-blur-sm transition hover:bg-white/10 hover:text-white"
            >
              <RotateCcw size={14} />
              Repetir
            </button>
          </div>

          <AnimatePresence>
            {finished && (
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/35"
              >
                Toca un nivel para revivirlo · arrastra para explorar
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
