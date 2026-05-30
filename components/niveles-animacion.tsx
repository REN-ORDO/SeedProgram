"use client";

/**
 * Modal del botón "Ver animación" (sección Niveles).
 * Placeholder "Próximamente" mientras se prepara la animación del recorrido.
 */

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sprout, X } from "lucide-react";

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
  // Esc cierra + lock de scroll del body
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[120] flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      role="dialog"
      aria-modal="true"
      aria-label="Animación del recorrido — próximamente"
      style={{
        background:
          "radial-gradient(ellipse 70% 60% at 50% 38%, #0c4a6e 0%, #07283a 55%, #061521 100%)",
      }}
    >
      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-5 py-4 md:px-8">
        <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-white/45">
          <span className="font-bold text-white/65">02</span>
          <span className="h-px w-8 bg-white/25" />
          <span>Animación del recorrido</span>
        </div>
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition hover:bg-white/10 hover:text-white"
        >
          <X size={18} />
        </button>
      </div>

      {/* Próximamente */}
      <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 18 }}
          className="flex h-20 w-20 items-center justify-center rounded-full border border-[var(--color-accent,#14b8a6)]/40 bg-[var(--color-accent,#14b8a6)]/10 text-[var(--color-accent,#5eead4)]"
        >
          <Sprout size={36} />
        </motion.div>

        <span className="mt-7 inline-flex items-center rounded-full border border-[var(--color-accent,#14b8a6)]/40 bg-[var(--color-accent,#14b8a6)]/10 px-4 py-1.5 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent,#5eead4)]">
          Próximamente
        </span>

        <h3 className="mt-4 font-display text-2xl font-bold text-white md:text-3xl">
          Estamos plantando esta animación
        </h3>
        <p className="mt-2 max-w-md text-sm text-white/55 md:text-base">
          Pronto verás aquí el recorrido completo: de semilla a árbol. Vuelve a
          pasar por aquí.
        </p>
      </div>
    </motion.div>
  );
}
