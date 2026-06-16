"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ClipboardList, Search, Rocket, Zap, Users2 } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { empresaPasos } from "@/lib/data";

const NAVY = "#0B1633";
const TEAL = "#27D3C3";
const SKY  = "#58BFFF";

const PASO_ICONS = [ClipboardList, Search, Rocket];
const PASO_BG    = ["#DBEAFE", "#BAE6FD", "#7DD3FC"];

// Desktop SVG: viewBox 0 0 1000 120
// Icon centers (from SVG top=40): step1 y=90, step2 y=10, step3 y=70
// x positions (cols at ~17%, 50%, 83%): 167, 500, 833
const DESKTOP_PATH = "M167,90 C290,88 400,10 500,10 C600,10 710,70 833,70";

// Desktop card paddingTop offsets to create curve (step2 highest)
const DESKTOP_OFFSETS = [80, 28, 60];

// Mobile: container 700px, icon centers at (40,30) (280,270) (40,510)
// intermediate nodes at center x=160: Diagnóstico y=230, Match y=470
const MOBILE_SVG_PATH = "M40,30 C40,130 160,130 160,230 C160,250 280,250 280,270 C280,380 160,420 160,470 C160,490 40,490 40,510";

const INTERMEDIATE_NODES = [
  { label: "Diagnóstico", Icon: Zap,    top: 210, delay: 0.7 },
  { label: "Match",       Icon: Users2, top: 468, delay: 1.4 },
];

export function EmpresasModelo() {
  const reduce = useReducedMotion();

  return (
    <section
      id="modelo"
      aria-label="Cómo funciona"
      className="relative overflow-hidden px-5 py-16 md:px-10 md:py-28 toon-section toon-section--navy"
    >
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <Reveal className="mb-3 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-[#7dd3fc]">
          <span className="font-bold text-white">01</span>
          <span className="h-[2px] w-12 bg-white" />
          <span>El modelo de impacto</span>
        </Reveal>

        <Reveal delay={0.05}>
          <h2 className="mb-3 max-w-3xl text-balance font-display text-4xl font-bold leading-[1.05] tracking-tight text-white md:text-6xl">
            ¿Cómo{" "}
            <span
              className="font-handwritten"
              style={{ color: "#7dd3fc", fontWeight: 700, fontSize: "1.15em", display: "inline-block", transform: "rotate(-2deg)" }}
            >
              funciona
            </span>
            ?
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mb-16 text-base leading-relaxed text-white/60 md:text-lg">
            Un proceso simple, claro y acompañado en cada paso.
          </p>
        </Reveal>

        {/* ── Desktop: ruta horizontal ── */}
        <div className="hidden md:block">
          <div className="relative">

            {/* SVG connecting line — top:40 para alinear con centros de íconos */}
            <div
              className="pointer-events-none absolute inset-x-0"
              style={{ top: 40, height: 120, zIndex: 0 }}
            >
              <svg
                width="100%"
                height="120"
                viewBox="0 0 1000 120"
                preserveAspectRatio="none"
                style={{ overflow: "visible" }}
              >
                <defs>
                  <linearGradient id="mod-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={SKY} />
                    <stop offset="100%" stopColor={TEAL} />
                  </linearGradient>
                  <filter id="mod-glow" x="-20%" y="-50%" width="140%" height="200%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <path id="mod-path" d={DESKTOP_PATH} fill="none" />
                </defs>

                {/* Glow suave detrás */}
                <path
                  d={DESKTOP_PATH}
                  fill="none"
                  stroke={TEAL}
                  strokeWidth={8}
                  opacity={0.15}
                  filter="url(#mod-glow)"
                />

                {/* Línea punteada animada */}
                <motion.path
                  d={DESKTOP_PATH}
                  fill="none"
                  stroke="url(#mod-grad)"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeDasharray="8 5"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 1.8, ease: "easeInOut" }}
                />

                {/* Nodos de unión */}
                <motion.circle
                  cx={333} cy={52} r={7}
                  fill={TEAL} stroke="white" strokeWidth={2}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.9 }}
                />
                <motion.circle
                  cx={667} cy={42} r={7}
                  fill={TEAL} stroke="white" strokeWidth={2}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 1.5 }}
                />

                {/* Puntos viajeros */}
                {!reduce && [0, 2, 4].map((delay, i) => (
                  <circle key={i} r={4} fill="white" opacity={0.85}>
                    <animateMotion dur="5s" repeatCount="indefinite" begin={`${delay}s`}>
                      <mpath href="#mod-path" />
                    </animateMotion>
                  </circle>
                ))}
              </svg>
            </div>

            {/* Pasos */}
            <div className="grid grid-cols-3 gap-6">
              {empresaPasos.map((paso, i) => {
                const Icon = PASO_ICONS[i];
                return (
                  <motion.div
                    key={paso.num}
                    className="flex flex-col items-center"
                    style={{ paddingTop: DESKTOP_OFFSETS[i] }}
                    initial={{ opacity: 0, y: 28 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.15 + i * 0.18 }}
                  >
                    {/* Ícono flotante */}
                    <motion.div
                      className="relative"
                      style={{ zIndex: 2, marginBottom: -22 }}
                      whileHover={{ scale: 1.1, y: -5 }}
                      transition={{ duration: 0.22 }}
                    >
                      <div
                        style={{
                          width: 100,
                          height: 100,
                          borderRadius: "50%",
                          background: "white",
                          border: `3px solid ${NAVY}`,
                          boxShadow: `4px 4px 0 ${NAVY}, 0 0 24px rgba(39,211,195,0.18)`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Icon size={38} color={TEAL} strokeWidth={1.7} />
                      </div>

                      {/* Badge número */}
                      <div
                        style={{
                          position: "absolute",
                          bottom: -4,
                          right: -4,
                          width: 30,
                          height: 30,
                          borderRadius: "50%",
                          background: TEAL,
                          border: `2.5px solid ${NAVY}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontFamily: "var(--font-display)",
                          fontWeight: 700,
                          fontSize: 10,
                          color: NAVY,
                        }}
                      >
                        {paso.num}
                      </div>
                    </motion.div>

                    {/* Tarjeta */}
                    <motion.article
                      className="toon-card w-full p-6"
                      style={{ background: PASO_BG[i], paddingTop: 34, position: "relative", zIndex: 1 }}
                      whileHover={{ y: -8 }}
                      transition={{ duration: 0.25 }}
                    >
                      <h3
                        className="font-display font-bold leading-tight"
                        style={{ fontSize: 18, color: NAVY, marginBottom: 10 }}
                      >
                        {paso.title}
                      </h3>
                      <div
                        style={{ width: 32, height: 2.5, background: TEAL, borderRadius: 2, marginBottom: 10 }}
                      />
                      <p style={{ fontSize: 13, lineHeight: 1.65, color: `${NAVY}cc` }}>
                        {paso.desc}
                      </p>
                    </motion.article>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Mobile: recorrido guiado ── */}
        <div className="md:hidden mt-8 relative" style={{ height: 700 }}>

          {/* SVG línea serpentina de fondo */}
          <svg
            width="100%" height="700"
            viewBox="0 0 320 700"
            preserveAspectRatio="none"
            className="absolute inset-0 pointer-events-none"
            style={{ overflow: "visible" }}
          >
            <defs>
              <linearGradient id="mob-mod-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={SKY} />
                <stop offset="100%" stopColor={TEAL} />
              </linearGradient>
              <filter id="mob-glow" x="-30%" y="-20%" width="160%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <path id="mob-mod-path" d={MOBILE_SVG_PATH} fill="none" />
            </defs>

            {/* Ghost track */}
            <path d={MOBILE_SVG_PATH} fill="none" stroke="rgba(88,191,255,0.08)" strokeWidth={3} />

            {/* Glow layer */}
            <path d={MOBILE_SVG_PATH} fill="none" stroke={TEAL} strokeWidth={6} opacity={0.12} filter="url(#mob-glow)" />

            {/* Línea animada */}
            <motion.path
              d={MOBILE_SVG_PATH}
              fill="none"
              stroke="url(#mob-mod-grad)"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeDasharray="9 5"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true, amount: 0.05 }}
              transition={{ duration: 2.6, ease: "easeInOut" }}
            />

            {/* Puntos viajeros */}
            {!reduce && [0, 3.5].map((delay, i) => (
              <circle key={i} r={3.5} fill="white" opacity={0.8}>
                <animateMotion dur="7s" repeatCount="indefinite" begin={`${delay}s`}>
                  <mpath href="#mob-mod-path" />
                </animateMotion>
              </circle>
            ))}
          </svg>

          {/* ── Paso 1 — izquierda ── */}
          {[0, 1, 2].map((i) => {
            const Icon = PASO_ICONS[i];
            const paso = empresaPasos[i];
            const isLeft = i % 2 === 0;
            const cardTop = i === 0 ? 0 : i === 1 ? 240 : 480;
            return (
              <motion.div
                key={paso.num}
                style={{
                  position: "absolute",
                  top: cardTop,
                  left: isLeft ? 0 : "auto",
                  right: isLeft ? "auto" : 0,
                  width: "88%",
                  zIndex: 2,
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.45, delay: i * 0.15 }}
              >
                {/* Ícono flotante */}
                <div style={{ position: "relative", paddingTop: 32 }}>
                  <motion.div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: isLeft ? 14 : "auto",
                      right: isLeft ? "auto" : 14,
                      width: 58,
                      height: 58,
                      borderRadius: "50%",
                      background: "white",
                      border: `3px solid ${NAVY}`,
                      boxShadow: `3px 3px 0 ${NAVY}, 0 0 16px rgba(39,211,195,0.18)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 3,
                    }}
                    whileInView={{ scale: [0.8, 1.05, 1] }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.2 + i * 0.15 }}
                  >
                    <Icon size={24} color={TEAL} strokeWidth={1.7} />
                    {/* Badge número */}
                    <div style={{
                      position: "absolute", bottom: -5, right: isLeft ? -5 : "auto", left: isLeft ? "auto" : -5,
                      width: 22, height: 22, borderRadius: "50%",
                      background: TEAL, border: `2px solid ${NAVY}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 9, color: NAVY,
                    }}>
                      {paso.num}
                    </div>
                  </motion.div>

                  {/* Tarjeta */}
                  <div
                    className="toon-card"
                    style={{
                      background: PASO_BG[i],
                      padding: "42px 18px 18px",
                    }}
                  >
                    <h3
                      className="font-display font-bold leading-tight"
                      style={{ fontSize: 15, color: NAVY, marginBottom: 8 }}
                    >
                      {paso.title}
                    </h3>
                    <div style={{ width: 28, height: 2, background: TEAL, borderRadius: 2, marginBottom: 8 }} />
                    <p style={{ fontSize: 12, lineHeight: 1.65, color: `${NAVY}bb` }}>
                      {paso.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* ── Nodos intermedios ── */}
          {INTERMEDIATE_NODES.map(({ label, Icon, top, delay }) => (
            <motion.div
              key={label}
              style={{
                position: "absolute",
                top,
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 3,
              }}
              initial={{ opacity: 0, scale: 0.75 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.35, delay }}
            >
              <motion.div
                whileInView={{ scale: [1, 1.08, 1] }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: delay + 0.2 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "7px 14px",
                  borderRadius: 99,
                  background: NAVY,
                  border: `2px solid ${TEAL}`,
                  boxShadow: `0 0 18px rgba(39,211,195,0.25), 2px 2px 0 ${TEAL}`,
                  whiteSpace: "nowrap",
                }}
              >
                <Icon size={13} color={TEAL} strokeWidth={2} />
                <span style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: 11,
                  letterSpacing: "0.06em",
                  color: TEAL,
                }}>
                  {label}
                </span>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* ── Frase de cierre ── */}
        <Reveal delay={0.35}>
          <div className="mt-16 flex items-center justify-center gap-4 text-center">
            <svg width="44" height="16" viewBox="0 0 44 16" fill="none" className="hidden sm:block shrink-0" aria-hidden>
              <circle cx={4} cy={8} r={3.5} fill={TEAL} opacity={0.5} />
              <path d="M10,8 C18,3 26,13 36,8 L44,8" stroke={TEAL} strokeWidth={1.5} strokeLinecap="round" opacity={0.4} />
            </svg>

            <p className="font-display text-lg font-bold text-white md:text-2xl">
              Tú traes el reto. Nosotros{" "}
              <span
                className="font-handwritten"
                style={{ color: TEAL, fontWeight: 700, fontSize: "1.15em", display: "inline-block", transform: "rotate(-1deg)" }}
              >
                activamos el talento.
              </span>
            </p>

            <svg width="44" height="16" viewBox="0 0 44 16" fill="none" className="hidden sm:block shrink-0" aria-hidden>
              <path d="M0,8 L8,8 C18,8 26,3 34,13" stroke={TEAL} strokeWidth={1.5} strokeLinecap="round" opacity={0.4} />
              <circle cx={40} cy={8} r={3.5} fill={TEAL} opacity={0.5} />
            </svg>
          </div>
        </Reveal>

      </div>
    </section>
  );
}
