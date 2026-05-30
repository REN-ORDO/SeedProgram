"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Search, Lightbulb, Users, Rocket, TrendingUp } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { empresaProblema } from "@/lib/data";

function Floater({
  style,
  dur = 5,
  amp = 10,
  delay = 0,
  rotateRange = 7,
  children,
}: {
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
      style={style}
      animate={reduce ? undefined : { y: [-amp, amp, -amp], rotate: [-rotateRange, rotateRange, -rotateRange] }}
      transition={{ duration: dur, repeat: Infinity, ease: "easeInOut", delay }}
      aria-hidden
    >
      {children}
    </motion.div>
  );
}

const NAVY = "#0B1633";
const TEAL = "#27D3C3";
const SKY  = "#58BFFF";

const NODES = [
  { id: "procesos",    title: "Procesos por optimizar",   desc: "Detectamos lo que hoy limita tu crecimiento.",  Icon: Search,     bg: "#DBEAFE" },
  { id: "ideas",       title: "Ideas que no avanzan",      desc: "Proyectos que siempre quedan para después.",    Icon: Lightbulb,  bg: "#CCFBF1" },
  { id: "talento",     title: "Talento con potencial",     desc: "Jóvenes acompañados por mentores Senior.",      Icon: Users,      bg: "#BAE6FD", featured: true },
  { id: "resultados",  title: "Resultados reales",         desc: "Soluciones funcionales para tu negocio.",       Icon: Rocket,     bg: "#CCFBF1" },
  { id: "impacto",     title: "Impacto que se multiplica", desc: "Tu empresa crece mientras formas talento.",     Icon: TrendingUp, bg: "#DBEAFE" },
] as const;

// SVG viewBox 0 0 800 90 — nodes at x = 0, 200, 400, 600, 800  y = 45
// Container is inset-x-[10%] so node centers land at 10%,30%,50%,70%,90% of outer width
const LINE = "M0,45 C55,22 145,68 200,45 C255,22 345,68 400,45 C455,22 545,68 600,45 C655,22 745,68 800,45";

// Mobile serpentine — viewBox 0 0 320 640, left x=45 right x=275, spacing 130px
const MOBILE_PATH = "M45,60 C45,125 275,125 275,190 C275,255 45,255 45,320 C45,385 275,385 275,450 C275,515 45,515 45,580";
const MOBILE_NODES = NODES.map((n, i) => ({
  ...n,
  side: (i % 2 === 0 ? "left" : "right") as "left" | "right",
  nodeY: 60 + i * 130,
}));

export function EmpresasProblema() {
  const reduce = useReducedMotion();

  return (
    <section
      aria-label="El reto"
      className="relative overflow-hidden px-5 py-16 md:px-10 md:py-28 toon-section toon-section--soft"
    >
      {/* Hoja izquierda grande — teal */}
      <Floater
        style={{ position: "absolute", top: "50%", left: -28, transform: "translateY(-50%)", width: 100, height: 100, opacity: 0.55, zIndex: 0, pointerEvents: "none" }}
        dur={7} amp={10} delay={0} rotateRange={8}
      >
        <svg viewBox="0 0 64 64" style={{ width: "100%", height: "100%", transform: "rotate(-30deg)" }}>
          <path d="M8 56 C 8 28, 28 8, 56 8 C 56 36, 36 56, 8 56 Z" fill="#27D3C3" />
        </svg>
      </Floater>

      {/* Hoja izquierda pequeña — teal oscuro, arriba */}
      <Floater
        style={{ position: "absolute", top: "15%", left: 18, width: 44, height: 44, opacity: 0.3, zIndex: 0, pointerEvents: "none" }}
        dur={9} amp={7} delay={2} rotateRange={12}
      >
        <svg viewBox="0 0 64 64" style={{ width: "100%", height: "100%", transform: "rotate(20deg)" }}>
          <path d="M32 4 C 52 20, 58 44, 32 60 C 6 44, 12 20, 32 4 Z" fill="#0D9488" />
        </svg>
      </Floater>

      {/* Hoja izquierda mini — abajo */}
      <Floater
        style={{ position: "absolute", bottom: "18%", left: 10, width: 30, height: 30, opacity: 0.2, zIndex: 0, pointerEvents: "none", filter: "blur(1px)" }}
        dur={6.5} amp={6} delay={1} rotateRange={15}
      >
        <svg viewBox="0 0 64 64" style={{ width: "100%", height: "100%", transform: "rotate(-55deg)" }}>
          <path d="M8 56 C 8 28, 28 8, 56 8 C 56 36, 36 56, 8 56 Z" fill="#27D3C3" />
        </svg>
      </Floater>

      {/* Hoja derecha grande — azul */}
      <Floater
        style={{ position: "absolute", top: "50%", right: -24, transform: "translateY(-40%)", width: 88, height: 88, opacity: 0.45, zIndex: 0, pointerEvents: "none" }}
        dur={8.5} amp={9} delay={1.2} rotateRange={7}
      >
        <svg viewBox="0 0 64 64" style={{ width: "100%", height: "100%", transform: "rotate(140deg)" }}>
          <path d="M8 56 C 8 28, 28 8, 56 8 C 56 36, 36 56, 8 56 Z" fill="#58BFFF" />
        </svg>
      </Floater>

      {/* Hoja derecha pequeña — azul claro, arriba */}
      <Floater
        style={{ position: "absolute", top: "12%", right: 22, width: 38, height: 38, opacity: 0.28, zIndex: 0, pointerEvents: "none" }}
        dur={7.8} amp={8} delay={0.6} rotateRange={10}
      >
        <svg viewBox="0 0 64 64" style={{ width: "100%", height: "100%", transform: "rotate(60deg)" }}>
          <path d="M32 4 C 52 20, 58 44, 32 60 C 6 44, 12 20, 32 4 Z" fill="#7DD3FC" />
        </svg>
      </Floater>

      {/* Hoja derecha mini — abajo, blur */}
      <Floater
        style={{ position: "absolute", bottom: "14%", right: 8, width: 28, height: 28, opacity: 0.18, zIndex: 0, pointerEvents: "none", filter: "blur(1px)" }}
        dur={10} amp={6} delay={3} rotateRange={14}
      >
        <svg viewBox="0 0 64 64" style={{ width: "100%", height: "100%", transform: "rotate(-80deg)" }}>
          <path d="M8 56 C 8 28, 28 8, 56 8 C 56 36, 36 56, 8 56 Z" fill="#38BDF8" />
        </svg>
      </Floater>

      <div className="mx-auto max-w-6xl">

        {/* ── Header ── */}
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <Reveal>
            <h2 className="text-balance font-display text-3xl font-bold leading-tight tracking-tight text-[--color-ink] md:text-5xl">
              Esa tarea que llevas meses{" "}
              <span
                className="font-handwritten"
                style={{
                  color: SKY,
                  fontWeight: 700,
                  fontSize: "1.12em",
                  display: "inline-block",
                  transform: "rotate(-1.5deg)",
                }}
              >
                posponiendo
              </span>
              .
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[--color-fg-muted] md:text-lg">
              {empresaProblema.body}
            </p>
          </Reveal>
        </div>

        {/* ── Desktop: 5 nodos horizontales ── */}
        <div className="hidden md:block">
          <Reveal delay={0.2}>
            <div className="relative">

              {/* SVG connecting line — behind circles */}
              <div
                className="pointer-events-none absolute inset-x-[10%]"
                style={{ top: 0, height: 90 }}
              >
                <svg
                  width="100%"
                  height="90"
                  viewBox="0 0 800 90"
                  preserveAspectRatio="none"
                  style={{ overflow: "visible" }}
                >
                  <defs>
                    <linearGradient id="ep-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={SKY} />
                      <stop offset="100%" stopColor={TEAL} />
                    </linearGradient>
                    <path id="ep-path" d={LINE} fill="none" />
                  </defs>

                  {/* Wavy gradient line */}
                  <use
                    href="#ep-path"
                    fill="none"
                    stroke="url(#ep-grad)"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                  />

                  {/* Junction dots at intermediate nodes */}
                  {[200, 400, 600].map((x) => (
                    <circle key={x} cx={x} cy={45} r={5} fill="white" stroke={NAVY} strokeWidth={1.8} />
                  ))}

                  {/* Traveling dots */}
                  {!reduce && [0, 1.6, 3.2].map((delay, i) => (
                    <circle key={i} r={4.5} fill={TEAL} opacity={0.85}>
                      <animateMotion dur="5s" repeatCount="indefinite" begin={`${delay}s`}>
                        <mpath href="#ep-path" />
                      </animateMotion>
                    </circle>
                  ))}
                </svg>
              </div>

              {/* Node circles row */}
              <div className="flex items-start justify-between">
                {NODES.map((node, i) => {
                  const size = node.featured ? 92 : 80;
                  return (
                    <motion.div
                      key={node.id}
                      className="flex w-[20%] flex-col items-center text-center"
                      initial={{ opacity: 0, y: 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.15 + i * 0.12 }}
                    >
                      <motion.div
                        whileHover={{
                          scale: 1.07,
                          boxShadow: `5px 5px 0 ${NAVY}, 0 0 22px rgba(39,211,195,0.3)`,
                        }}
                        transition={{ duration: 0.2 }}
                        style={{
                          width: size,
                          height: size,
                          borderRadius: "50%",
                          background: node.bg,
                          border: `3px solid ${NAVY}`,
                          boxShadow: `4px 4px 0 ${NAVY}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          position: "relative",
                          zIndex: 2,
                          marginBottom: 14,
                          cursor: "default",
                        }}
                      >
                        <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
                          <node.Icon
                            size={node.featured ? 34 : 28}
                            color={NAVY}
                            strokeWidth={1.7}
                          />
                        </motion.div>
                      </motion.div>

                      <p
                        className="font-display font-bold text-sm leading-snug"
                        style={{ color: NAVY, marginBottom: 5 }}
                      >
                        {node.title}
                      </p>
                      <p
                        className="px-1 text-xs leading-relaxed"
                        style={{ color: "rgba(11,22,51,0.62)" }}
                      >
                        {node.desc}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </Reveal>
        </div>

        {/* ── Mobile: serpentine timeline ── */}
        <div className="md:hidden mt-10 relative" style={{ height: 640 }}>

          {/* SVG serpentine line */}
          <svg
            width="100%"
            height="640"
            viewBox="0 0 320 640"
            preserveAspectRatio="none"
            className="absolute inset-0 pointer-events-none"
            style={{ overflow: "visible" }}
          >
            <defs>
              <linearGradient id="mob-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={SKY} />
                <stop offset="100%" stopColor={TEAL} />
              </linearGradient>
              <path id="mob-path" d={MOBILE_PATH} fill="none" />
            </defs>

            {/* Ghost path (faint background) */}
            <path
              d={MOBILE_PATH}
              fill="none"
              stroke="rgba(88,191,255,0.12)"
              strokeWidth={3}
            />

            {/* Animated draw */}
            <motion.path
              d={MOBILE_PATH}
              fill="none"
              stroke="url(#mob-grad)"
              strokeWidth={3}
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true, amount: 0.05 }}
              transition={{ duration: 2.4, ease: "easeInOut" }}
            />

            {/* Junction sparkles at intermediate nodes */}
            {[190, 320, 450].map((y, i) => (
              <circle key={i} cx={i % 2 === 0 ? 275 : 45} cy={y} r={5} fill="white" stroke={NAVY} strokeWidth={1.5} />
            ))}

            {/* Traveling dots */}
            {!reduce && [0, 2.7, 5.4].map((delay, i) => (
              <circle key={i} r={4} fill={TEAL} opacity={0.85}>
                <animateMotion dur="8s" repeatCount="indefinite" begin={`${delay}s`}>
                  <mpath href="#mob-path" />
                </animateMotion>
              </circle>
            ))}
          </svg>

          {/* Nodes alternados izq/der */}
          {MOBILE_NODES.map((node, i) => (
            <motion.div
              key={node.id}
              style={{
                position: "absolute",
                left: 0,
                width: "100%",
                top: node.nodeY - 45,
                display: "flex",
                flexDirection: node.side === "left" ? "row" : "row-reverse",
                alignItems: "center",
                gap: 14,
                zIndex: 2,
              }}
              initial={{ opacity: 0, scale: 0.82 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.45, delay: i * 0.08, ease: "easeOut" }}
            >
              {/* Círculo */}
              <motion.div
                whileTap={{ scale: 1.05, boxShadow: `5px 5px 0 ${NAVY}, 0 0 20px rgba(39,211,195,0.3)` }}
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: "50%",
                  background: node.bg,
                  border: `3px solid ${NAVY}`,
                  boxShadow: `4px 4px 0 ${NAVY}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <node.Icon size={30} color={NAVY} strokeWidth={1.7} />
              </motion.div>

              {/* Texto */}
              <div style={{ flex: 1, textAlign: node.side === "left" ? "left" : "right" }}>
                <p
                  className="font-display font-bold"
                  style={{ fontSize: 13, lineHeight: 1.25, color: NAVY, marginBottom: 5 }}
                >
                  {node.title}
                </p>
                <p style={{ fontSize: 11.5, lineHeight: 1.6, color: "rgba(11,22,51,0.62)" }}>
                  {node.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
