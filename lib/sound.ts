/**
 * Sistema de sonido de la web — todo sintetizado con WebAudio, sin assets.
 *
 * - Un solo AudioContext + gain maestro compartido por landing y escena 3D.
 * - Mute global persistido en localStorage, con pub-sub para sincronizar
 *   cualquier toggle (botón flotante, modal de la animación, etc.).
 * - Los navegadores bloquean el audio hasta el primer gesto del usuario:
 *   ensureCtx() reanuda el contexto en cada llamada.
 */

const STORAGE_KEY = "seed-sound-muted";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let muted = false;
let initialized = false;

const listeners = new Set<(muted: boolean) => void>();

function ensureCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!ctx) {
      ctx = new AudioContext();
      master = ctx.createGain();
      master.gain.value = muted ? 0 : 1;
      master.connect(ctx.destination);
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

/** Lee el estado persistido. Idempotente; llamar al montar cualquier UI de sonido. */
export function initSound() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  try {
    muted = window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    muted = false;
  }
}

export function isMuted(): boolean {
  initSound();
  return muted;
}

export function setMuted(value: boolean) {
  initSound();
  muted = value;
  try {
    window.localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
  } catch {
    // localStorage bloqueado: el mute vive solo en memoria
  }
  if (ctx && master) {
    master.gain.setTargetAtTime(value ? 0 : 1, ctx.currentTime, 0.02);
  }
  listeners.forEach((cb) => cb(muted));
}

/** Suscribe un callback a cambios de mute. Devuelve el unsubscribe. */
export function subscribeMuted(cb: (muted: boolean) => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function blip(
  type: OscillatorType,
  freq: number,
  freqEnd: number,
  volume: number,
  duration: number
) {
  if (muted) return;
  const c = ensureCtx();
  if (!c || !master) return;
  const t0 = c.currentTime;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  osc.frequency.exponentialRampToValueAtTime(Math.max(40, freqEnd), t0 + duration);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(gain).connect(master);
  osc.start(t0);
  osc.stop(t0 + duration + 0.03);
}

/** Tick sutil al pasar el mouse por un elemento interactivo. */
export function playHover() {
  blip("sine", 850 + Math.random() * 350, 1250, 0.028, 0.07);
}

/** Pop de click para botones y links de la web. */
export function playClick() {
  const f = 300 + Math.random() * 380;
  blip("triangle", f, f * 0.55, 0.075, 0.16);
}

/** Pop tipo burbuja de la escena 3D (mismo carácter, algo más presente). */
export function playPop(volume = 0.1) {
  const f = 320 + Math.random() * 440;
  blip("triangle", f, f * 0.55, volume, 0.17);
}
