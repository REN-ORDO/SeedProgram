"use client";

/**
 * Sonidos globales de la web + toggle de mute flotante.
 *
 * - Hover sobre elementos interactivos → tick sutil (solo puntero mouse).
 * - Click/tap sobre elementos interactivos → pop.
 * - [data-sound-skip] excluye un subárbol (p. ej. la escena 3D, que maneja
 *   sus propios pops) para no duplicar sonidos.
 * - El toggle persiste en localStorage y se sincroniza con cualquier otro
 *   control de mute vía subscribeMuted().
 */

import { useEffect, useSyncExternalStore } from "react";
import { Volume2, VolumeX } from "lucide-react";
import {
  initSound,
  isMuted,
  playClick,
  playHover,
  setMuted,
  subscribeMuted,
} from "@/lib/sound";

const INTERACTIVE = 'a, button, [role="button"], [data-cursor], label, summary';
const SKIP = "[data-sound-skip]";

export function SoundEffects() {
  // El mute es un store externo (módulo lib/sound) — snapshot SSR: false
  const mutedState = useSyncExternalStore(subscribeMuted, isMuted, () => false);

  useEffect(() => {
    initSound();

    let lastHover = 0;
    const onOver = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const el = target.closest(INTERACTIVE);
      if (!el || el.closest(SKIP)) return;
      // relatedTarget = de dónde viene: si ya estaba dentro, no es un "enter"
      const from = e.relatedTarget as Node | null;
      if (from && el.contains(from)) return;
      const now = performance.now();
      if (now - lastHover < 80) return;
      lastHover = now;
      playHover();
    };

    const onDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (target.closest(SKIP)) return;
      if (!target.closest(INTERACTIVE)) return;
      playClick();
    };

    window.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    return () => {
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
    };
  }, []);

  return (
    <button
      type="button"
      data-sound-skip
      aria-pressed={!mutedState}
      aria-label={mutedState ? "Activar sonidos" : "Silenciar sonidos"}
      title={mutedState ? "Activar sonidos" : "Silenciar sonidos"}
      onClick={() => {
        const next = !mutedState;
        setMuted(next);
        if (!next) playClick(); // confirmación sonora al reactivar
      }}
      className="fixed bottom-5 right-5 z-[110] flex h-11 w-11 items-center justify-center rounded-full border-2 border-[--color-ink] bg-white text-[--color-ink] opacity-80 shadow-[3px_3px_0_var(--color-ink)] transition hover:-translate-y-0.5 hover:opacity-100"
    >
      {mutedState ? <VolumeX size={18} /> : <Volume2 size={18} />}
    </button>
  );
}
