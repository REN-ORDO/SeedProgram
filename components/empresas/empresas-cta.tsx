"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { Magnetic } from "@/components/magnetic";
import { empresaCTA } from "@/lib/data";

/** Fotos del equipo (todas las cooweb-team#). Los .mp4 se omiten del crossfade. */
const PHOTOS = [
  "/cooweb-team1.jpg",
  "/cooweb-team2.jpeg",
  "/cooweb-team3.jpeg",
  "/cooweb-team4.jpeg",
  "/cooweb-team5.jpeg",
  "/cooweb-team6.jpeg",
  "/cooweb-team7.jpeg",
  "/cooweb-team9.jpeg",
  "/cooweb-team10.jpeg",
];
const PHOTO_MS = 4200;

function Floater({
  className,
  style,
  dur = 5,
  amp = 10,
  delay = 0,
  rotateRange = 7,
  children,
}: {
  className?: string;
  style?: React.CSSProperties;
  dur?: number;
  amp?: number;
  delay?: number;
  rotateRange?: number;
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      style={style}
      animate={
        reduce
          ? undefined
          : { y: [-amp, amp, -amp], rotate: [-rotateRange, rotateRange, -rotateRange] }
      }
      transition={{ duration: dur, repeat: Infinity, ease: "easeInOut", delay }}
      aria-hidden
    >
      {children}
    </motion.div>
  );
}

export function EmpresasCTA() {
  const reduce = useReducedMotion();
  const [photo, setPhoto] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setPhoto((i) => (i + 1) % PHOTOS.length), PHOTO_MS);
    return () => clearInterval(t);
  }, [reduce]);

  return (
    <section
      id="diagnostico"
      aria-label="Solicitar diagnóstico"
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: 880,
        background: "#000A1E",
      }}
    >
      {/* ── Capa 0: noise texture ─────────────────────────────────── */}
      <svg
        aria-hidden
        style={{
          position: "absolute", inset: 0, width: "100%", height: "100%",
          zIndex: 0, opacity: 0.022, pointerEvents: "none",
        }}
      >
        <filter id="empcta-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.68" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#empcta-noise)" />
      </svg>

      {/* ── Capa 1: glow ambiental teal+sky ──────────────────────── */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "42%",
          background: [
            "radial-gradient(ellipse 52% 60% at 50% 100%, rgba(45,212,191,0.13) 0%, transparent 58%)",
            "radial-gradient(ellipse 80% 35% at 50% 112%, rgba(56,189,248,0.07) 0%, transparent 55%)",
          ].join(", "),
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      {/* ── Capa 2: foto full-bleed (cover, no se deforma) ────────── */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          zIndex: 2,
          pointerEvents: "none",
          maskImage:
            "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.55) 20%, black 46%, black 90%, rgba(0,0,0,0.85) 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.55) 20%, black 46%, black 90%, rgba(0,0,0,0.85) 100%)",
        } as React.CSSProperties}
      >
        <AnimatePresence>
          <motion.img
            key={photo}
            src={PHOTOS[photo]}
            alt=""
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: "easeInOut" }}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center 38%",
              filter: "saturate(0.82) brightness(0.9)",
            }}
          />
        </AnimatePresence>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 60% 70% at 50% 38%, transparent 30%, rgba(0,10,30,0.48) 68%, rgba(0,10,30,0.76) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,10,30,0.28)",
          }}
        />
      </div>

      {/* ── Hojas decorativas ─────────────────────────────────────── */}
      <Floater style={{ position: "absolute", top: 40, left: 32, width: 44, height: 44, opacity: 0.2, zIndex: 5 }}
        dur={6} amp={9} delay={0} rotateRange={7}>
        <svg viewBox="0 0 64 64" style={{ width: "100%", height: "100%", transform: "rotate(-25deg)" }}>
          <path d="M8 56 C 8 28, 28 8, 56 8 C 56 36, 36 56, 8 56 Z" fill="#5EEAD4" />
        </svg>
      </Floater>
      <Floater style={{ position: "absolute", top: 128, left: 10, width: 26, height: 26, opacity: 0.14, zIndex: 5 }}
        dur={7.2} amp={7} delay={1.5} rotateRange={13}>
        <svg viewBox="0 0 64 64" style={{ width: "100%", height: "100%", transform: "rotate(32deg)" }}>
          <path d="M32 4 C 52 20, 58 44, 32 60 C 6 44, 12 20, 32 4 Z" fill="#2DD4BF" />
        </svg>
      </Floater>
      <Floater style={{ position: "absolute", top: 330, left: -18, width: 58, height: 58, opacity: 0.09, zIndex: 5, filter: "blur(2px)" }}
        dur={9.5} amp={14} delay={2.2} rotateRange={8}>
        <svg viewBox="0 0 64 64" style={{ width: "100%", height: "100%", transform: "rotate(-42deg)" }}>
          <path d="M8 56 C 8 28, 28 8, 56 8 C 56 36, 36 56, 8 56 Z" fill="#14B8A6" />
        </svg>
      </Floater>
      <Floater style={{ position: "absolute", bottom: 300, left: 20, width: 34, height: 34, opacity: 0.12, zIndex: 5, filter: "blur(1px)" }}
        dur={6.8} amp={10} delay={0.7} rotateRange={16}>
        <svg viewBox="0 0 64 64" style={{ width: "100%", height: "100%", transform: "rotate(58deg)" }}>
          <path d="M32 4 C 52 20, 58 44, 32 60 C 6 44, 12 20, 32 4 Z" fill="#5EEAD4" />
        </svg>
      </Floater>
      <Floater style={{ position: "absolute", top: 48, right: 48, width: 36, height: 36, opacity: 0.16, zIndex: 5 }}
        dur={5.5} amp={11} delay={0.9} rotateRange={9}>
        <svg viewBox="0 0 64 64" style={{ width: "100%", height: "100%", transform: "rotate(40deg)" }}>
          <path d="M32 6 C 50 14, 56 32, 42 52 C 30 60, 14 56, 10 38 C 8 22, 18 10, 32 6 Z" fill="#38BDF8" />
        </svg>
      </Floater>
      <Floater style={{ position: "absolute", top: 148, right: 16, width: 22, height: 22, opacity: 0.15, zIndex: 5 }}
        dur={8.1} amp={6} delay={1.9} rotateRange={11}>
        <svg viewBox="0 0 64 64" style={{ width: "100%", height: "100%", transform: "rotate(-62deg)" }}>
          <path d="M32 6 C 50 14, 56 32, 42 52 C 30 60, 14 56, 10 38 C 8 22, 18 10, 32 6 Z" fill="#7DD3FC" />
        </svg>
      </Floater>
      <Floater style={{ position: "absolute", top: 370, right: -20, width: 64, height: 64, opacity: 0.08, zIndex: 5, filter: "blur(2.5px)" }}
        dur={10.5} amp={12} delay={3.4} rotateRange={6}>
        <svg viewBox="0 0 64 64" style={{ width: "100%", height: "100%", transform: "rotate(18deg)" }}>
          <path d="M12 52 C 4 28, 20 4, 48 8 C 62 20, 56 46, 32 58 C 24 56, 16 56, 12 52 Z" fill="#38BDF8" />
        </svg>
      </Floater>
      <Floater style={{ position: "absolute", bottom: 285, right: 26, width: 42, height: 42, opacity: 0.11, zIndex: 5 }}
        dur={7.8} amp={9} delay={4.1} rotateRange={12}>
        <svg viewBox="0 0 64 64" style={{ width: "100%", height: "100%", transform: "rotate(-18deg)" }}>
          <path d="M8 56 C 8 28, 28 8, 56 8 C 56 36, 36 56, 8 56 Z" fill="#2DD4BF" />
        </svg>
      </Floater>
      <Floater style={{ position: "absolute", top: -10, left: -12, width: 76, height: 76, opacity: 0.32, zIndex: 5 }}
        dur={7.1} amp={8} delay={0.3} rotateRange={6}>
        <svg viewBox="0 0 64 64" style={{ width: "100%", height: "100%", transform: "rotate(-15deg)" }}>
          <path d="M8 56 C 8 28, 28 8, 56 8 C 56 36, 36 56, 8 56 Z" fill="#5EEAD4" />
        </svg>
      </Floater>
      <Floater style={{ position: "absolute", top: 210, left: -34, width: 90, height: 90, opacity: 0.18, zIndex: 5, filter: "blur(3px)" }}
        dur={11.2} amp={16} delay={1.4} rotateRange={5}>
        <svg viewBox="0 0 64 64" style={{ width: "100%", height: "100%", transform: "rotate(-33deg)" }}>
          <path d="M12 52 C 4 28, 20 4, 48 8 C 62 20, 56 46, 32 58 C 24 56, 16 56, 12 52 Z" fill="#14B8A6" />
        </svg>
      </Floater>
      <Floater style={{ position: "absolute", bottom: 170, left: -18, width: 52, height: 52, opacity: 0.22, zIndex: 5, filter: "blur(1.5px)" }}
        dur={8.4} amp={11} delay={2.8} rotateRange={10}>
        <svg viewBox="0 0 64 64" style={{ width: "100%", height: "100%", transform: "rotate(45deg)" }}>
          <path d="M32 4 C 52 20, 58 44, 32 60 C 6 44, 12 20, 32 4 Z" fill="#2DD4BF" />
        </svg>
      </Floater>
      <Floater style={{ position: "absolute", top: -8, right: -8, width: 60, height: 60, opacity: 0.28, zIndex: 5 }}
        dur={6.3} amp={9} delay={1.1} rotateRange={8}>
        <svg viewBox="0 0 64 64" style={{ width: "100%", height: "100%", transform: "rotate(22deg)" }}>
          <path d="M32 6 C 50 14, 56 32, 42 52 C 30 60, 14 56, 10 38 C 8 22, 18 10, 32 6 Z" fill="#38BDF8" />
        </svg>
      </Floater>
      <Floater style={{ position: "absolute", top: 235, right: -24, width: 64, height: 64, opacity: 0.20, zIndex: 5, filter: "blur(1px)" }}
        dur={9.2} amp={13} delay={4.6} rotateRange={7}>
        <svg viewBox="0 0 64 64" style={{ width: "100%", height: "100%", transform: "rotate(55deg)" }}>
          <path d="M32 4 C 52 20, 58 44, 32 60 C 6 44, 12 20, 32 4 Z" fill="#5EEAD4" />
        </svg>
      </Floater>
      <Floater style={{ position: "absolute", bottom: 155, right: -6, width: 38, height: 38, opacity: 0.38, zIndex: 5 }}
        dur={5.9} amp={8} delay={3.7} rotateRange={14}>
        <svg viewBox="0 0 64 64" style={{ width: "100%", height: "100%", transform: "rotate(-50deg)" }}>
          <path d="M8 56 C 8 28, 28 8, 56 8 C 56 36, 36 56, 8 56 Z" fill="#2DD4BF" />
        </svg>
      </Floater>

      {/* ── Glow radial detrás del contenido ──────────────────────── */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "4%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "clamp(280px, 58%, 700px)",
          height: 380,
          background: [
            "radial-gradient(ellipse 70% 55% at 50% 28%, rgba(45,212,191,0.07) 0%, transparent 68%)",
            "radial-gradient(ellipse 45% 35% at 50% 14%, rgba(56,189,248,0.05) 0%, transparent 62%)",
          ].join(", "),
          zIndex: 3,
          pointerEvents: "none",
        }}
      />

      {/* ── Contenido centrado ────────────────────────────────────── */}
      <div
        style={{ position: "relative", zIndex: 4 }}
        className="mx-auto flex max-w-3xl flex-col items-center px-6 pt-24 pb-10 text-center md:pt-32 md:pb-12"
      >
        {/* Badge */}
        <Reveal className="mb-7">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/6 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white/55">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-[#2DD4BF] opacity-70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#2DD4BF]" />
            </span>
            {empresaCTA.note}
          </span>
        </Reveal>

        {/* Headline */}
        <Reveal delay={0.08}>
          <h2
            className="text-balance font-display font-bold leading-[1.06] tracking-tight text-white"
            style={{ fontSize: "clamp(2.1rem, 5vw, 3.6rem)" }}
          >
            {empresaCTA.title}
          </h2>
        </Reveal>

        {/* Body */}
        <Reveal delay={0.16}>
          <p className="mx-auto mt-6 max-w-xl text-base text-white/70 md:text-lg">
            {empresaCTA.body}
          </p>
        </Reveal>

        {/* CTA */}
        <Reveal delay={0.24}>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Magnetic strength={0.25}>
              <a
                href="/postular?rol=empresa"
                data-cursor="Diagnóstico"
                className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold transition-transform hover:scale-[1.03]"
                style={{
                  background: "#2DD4BF",
                  color: "#000A1E",
                  boxShadow: "4px 4px 0px #0C4A6E",
                }}
              >
                {empresaCTA.cta}
                <ArrowRight size={15} />
              </a>
            </Magnetic>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
