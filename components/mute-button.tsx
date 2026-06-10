"use client";

/**
 * Botón de mute global reutilizable (estilo toon).
 * Lee/escribe el store de lib/sound — todos los toggles de la web quedan
 * sincronizados (nav, vista del form, flotante, modal 3D).
 */

import { useSyncExternalStore } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { isMuted, setMuted, subscribeMuted } from "@/lib/sound";
import { cn } from "@/lib/utils";

export function MuteButton({ className }: { className?: string }) {
  const muted = useSyncExternalStore(subscribeMuted, isMuted, () => false);

  return (
    <button
      type="button"
      aria-pressed={!muted}
      aria-label={muted ? "Activar sonidos" : "Silenciar la web"}
      title={muted ? "Activar sonidos" : "Silenciar la web"}
      onClick={() => setMuted(!muted)}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-[--color-ink] bg-white text-[--color-ink] shadow-[3px_3px_0_var(--color-ink)] transition-transform hover:-translate-y-0.5",
        className
      )}
    >
      {muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
    </button>
  );
}
