"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Globe, Workflow, Rocket, Wrench, Sprout } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { empresaAreas } from "@/lib/data";

const NAVY = "#0B1633";
const TEAL = "#27D3C3";
const SKY  = "#58BFFF";

type AreaKey = "web" | "automation" | "mvp" | "support";

const ICON_MAP: Record<AreaKey, React.ElementType> = {
  web:        Globe,
  automation: Workflow,
  mvp:        Rocket,
  support:    Wrench,
};

// Dashed connection paths in SVG viewBox 0 0 1000 530
// Left icons at x≈115, right icons at x≈700; nucleus center at (500,265)
const PATH_MAP: Record<AreaKey, string> = {
  web:        "M210,135 C270,125 370,195 445,232",
  automation: "M625,135 C600,125 590,195 555,232",
  mvp:        "M210,395 C270,405 370,335 445,298",
  support:    "M625,415 C600,420 600,345 558,302",
};

// Dots where dashed lines meet the orbital paths
const ORBIT_DOTS = [
  { cx: 332, cy: 218, areaKey: "web"        },
  { cx: 338, cy: 312, areaKey: "mvp"        },
  { cx: 662, cy: 224, areaKey: "automation" },
  { cx: 658, cy: 308, areaKey: "support"    },
];

export function EmpresasAreas() {
  const [hovered, setHovered] = useState<AreaKey | null>(null);
  const reduce = useReducedMotion();

  const areas = empresaAreas.map((a) => ({
    ...a,
    key: a.icon as AreaKey,
    Icon: ICON_MAP[a.icon as AreaKey],
    path: PATH_MAP[a.icon as AreaKey],
  }));

  const leftAreas  = [areas[0], areas[2]]; // web, mvp
  const rightAreas = [areas[1], areas[3]]; // automation, support

  return (
    <section
      aria-label="Qué resolvemos"
      className="relative overflow-hidden px-5 py-16 md:px-10 md:py-28 toon-section toon-section--soft"
    >
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <Reveal className="mb-3 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-[--color-fg-subtle]">
          <span className="font-bold text-[--color-ink]">02</span>
          <span className="h-[2px] w-12 bg-[var(--color-ink)]" />
          <span>Qué resolvemos juntos</span>
        </Reveal>

        <div className="mb-14 grid items-end gap-8 md:grid-cols-12">
          <Reveal delay={0.05} className="md:col-span-7">
            <h2 className="text-balance font-display text-4xl font-bold leading-[1.05] tracking-tight text-[--color-ink] md:text-6xl">
              Soluciones{" "}
              <span
                className="font-handwritten"
                style={{ color: "var(--color-accent-strong)", fontWeight: 700, fontSize: "1.15em", display: "inline-block", transform: "rotate(-2deg)" }}
              >
                acotadas
              </span>{" "}
              y de alto impacto.
            </h2>
          </Reveal>
          <Reveal delay={0.15} className="md:col-span-5">
            <p className="text-base leading-relaxed text-[--color-fg-muted] md:text-lg">
              Diseñamos retos realistas para tu operación diaria. Estas son las cuatro áreas donde más movemos la aguja.
            </p>
          </Reveal>
        </div>

        {/* ── Desktop: ecosystem diagram ── */}
        <div className="hidden md:block">
          <div className="relative" style={{ minHeight: 500 }}>

            {/* SVG: orbits + connections */}
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full"
              viewBox="0 0 1000 530"
              preserveAspectRatio="none"
              style={{ overflow: "visible" }}
            >
              <defs>
                <filter id="ar-glow" x="-30%" y="-50%" width="160%" height="200%">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                {/* Hidden paths for traveling dots */}
                {areas.map((a) => (
                  <path key={`def-${a.key}`} id={`arpath-${a.key}`} d={a.path} fill="none" />
                ))}
              </defs>

              {/* Orbital ellipses */}
              {[20, -20].map((rot, i) => (
                <ellipse
                  key={i}
                  cx={500} cy={265} rx={195} ry={108}
                  fill="none"
                  stroke={i === 0 ? SKY : TEAL}
                  strokeWidth={1.4}
                  strokeDasharray="7 5"
                  opacity={0.3}
                  transform={`rotate(${rot}, 500, 265)`}
                />
              ))}

              {/* Dashed connection paths */}
              {areas.map((a) => {
                const isHov = hovered === a.key;
                const isDim = hovered !== null && !isHov;
                return (
                  <motion.path
                    key={a.key}
                    d={a.path}
                    fill="none"
                    stroke={isHov ? TEAL : SKY}
                    strokeWidth={isHov ? 2.2 : 1.5}
                    strokeDasharray="7 5"
                    strokeLinecap="round"
                    opacity={isDim ? 0.12 : isHov ? 1 : 0.5}
                    filter={isHov ? "url(#ar-glow)" : undefined}
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 1.2, delay: 0.5 }}
                    style={{ transition: "opacity 0.25s, stroke 0.25s, stroke-width 0.25s" }}
                  />
                );
              })}

              {/* Orbital dots */}
              {ORBIT_DOTS.map((dot, i) => {
                const isHov = hovered === dot.areaKey;
                const isDim = hovered !== null && !isHov;
                return (
                  <motion.circle
                    key={i}
                    cx={dot.cx} cy={dot.cy} r={isHov ? 8 : 6}
                    fill={isHov ? TEAL : SKY}
                    stroke="white" strokeWidth={2}
                    opacity={isDim ? 0.15 : 1}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: isDim ? 0.15 : 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.9 + i * 0.08 }}
                    style={{ transition: "opacity 0.25s, r 0.2s, fill 0.2s" }}
                  />
                );
              })}

              {/* Traveling dots */}
              {!reduce && areas.map((a, i) => (
                <circle key={a.key} r={3.5} fill="white" opacity={0.75}>
                  <animateMotion dur={`${5 + i * 0.8}s`} repeatCount="indefinite" begin={`${i * 1.4}s`}>
                    <mpath href={`#arpath-${a.key}`} />
                  </animateMotion>
                </circle>
              ))}
            </svg>

            {/* 3-column layout */}
            <div
              className="grid h-full"
              style={{ gridTemplateColumns: "1fr 210px 1fr", gap: "0 24px", minHeight: 500, position: "relative", zIndex: 1 }}
            >
              {/* Left areas */}
              <div className="flex flex-col justify-between py-10">
                {leftAreas.map((area) => (
                  <AreaNode
                    key={area.key}
                    area={area}
                    hovered={hovered}
                    onHover={setHovered}
                    align="left"
                  />
                ))}
              </div>

              {/* Center nucleus */}
              <div className="flex items-center justify-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.6 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.55, ease: "easeOut" }}
                >
                  <Nucleus hovered={hovered} />
                </motion.div>
              </div>

              {/* Right areas */}
              <div className="flex flex-col justify-between py-10">
                {rightAreas.map((area) => (
                  <AreaNode
                    key={area.key}
                    area={area}
                    hovered={hovered}
                    onHover={setHovered}
                    align="left"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Mobile: vertical list ── */}
        <div className="md:hidden mt-8">
          {/* Mini nucleus */}
          <div className="mb-8 flex justify-center">
            <div
              style={{
                width: 150, height: 140,
                borderRadius: "55% 45% 60% 40% / 50% 60% 45% 55%",
                background: NAVY,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                textAlign: "center", padding: "18px 14px",
              }}
            >
              <Sprout size={20} color={TEAL} strokeWidth={1.8} style={{ marginBottom: 6 }} />
              <p className="font-display font-bold" style={{ fontSize: 13, lineHeight: 1.2, color: "white", marginBottom: 4 }}>
                Tu reto<br />técnico
              </p>
              <p style={{ fontSize: 9, lineHeight: 1.5, color: "rgba(255,255,255,0.5)" }}>
                Lo que realmente impulsa tu negocio.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {areas.map((area, i) => (
              <motion.div
                key={area.key}
                className="flex items-start gap-4"
                initial={{ opacity: 0, x: -14 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <div
                  style={{
                    width: 58, height: 58, borderRadius: "50%",
                    background: "white",
                    border: `2.5px solid ${NAVY}`,
                    boxShadow: `3px 3px 0 ${NAVY}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <area.Icon size={24} color={TEAL} strokeWidth={1.7} />
                </div>
                <div>
                  <h3 className="font-display font-bold leading-tight" style={{ fontSize: 15, color: NAVY, marginBottom: 6 }}>
                    {area.title}
                  </h3>
                  <div style={{ width: 28, height: 2.5, background: TEAL, borderRadius: 2, marginBottom: 6 }} />
                  <p style={{ fontSize: 12, lineHeight: 1.65, color: `${NAVY}aa` }}>{area.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Closing phrase ── */}
        <Reveal delay={0.3}>
          <div className="mt-16 flex items-center justify-center gap-4 text-center">
            <svg width="44" height="16" viewBox="0 0 44 16" fill="none" className="hidden sm:block shrink-0" aria-hidden>
              <circle cx={4} cy={8} r={3.5} fill={TEAL} opacity={0.5} />
              <path d="M10,8 C18,3 26,13 36,8 L44,8" stroke={TEAL} strokeWidth={1.5} strokeLinecap="round" opacity={0.4} />
            </svg>
            <p className="font-display text-base font-bold text-[--color-ink] md:text-xl">
              Cuatro frentes. Un solo objetivo:{" "}
              <span
                className="font-handwritten"
                style={{ color: TEAL, fontWeight: 700, fontSize: "1.15em", display: "inline-block", transform: "rotate(-1deg)" }}
              >
                hacer crecer tu empresa.
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

/* ── Center nucleus blob ── */
function Nucleus({ hovered }: { hovered: AreaKey | null }) {
  const glowing = hovered !== null;
  return (
    <div
      style={{
        width: 188,
        height: 174,
        borderRadius: "55% 45% 62% 38% / 50% 62% 44% 56%",
        background: NAVY,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "22px 18px",
        boxShadow: glowing
          ? `0 0 36px rgba(39,211,195,0.45), 5px 5px 0 rgba(39,211,195,0.3)`
          : `5px 5px 0 rgba(11,22,51,0.25)`,
        transition: "box-shadow 0.3s ease",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute", inset: 10,
          borderRadius: "inherit",
          border: `1px solid rgba(39,211,195,0.18)`,
          pointerEvents: "none",
        }}
      />
      <Sprout size={26} color={TEAL} strokeWidth={1.8} style={{ marginBottom: 10, flexShrink: 0 }} />
      <p className="font-display font-bold" style={{ fontSize: 15, lineHeight: 1.2, color: "white", marginBottom: 6 }}>
        Tu reto<br />técnico
      </p>
      <p style={{ fontSize: 10, lineHeight: 1.55, color: "rgba(255,255,255,0.52)" }}>
        Nos enfocamos en lo que realmente impulsa tu negocio.
      </p>
    </div>
  );
}

/* ── Area node (desktop) ── */
function AreaNode({
  area,
  hovered,
  onHover,
}: {
  area: { key: AreaKey; Icon: React.ElementType; title: string; desc: string };
  hovered: AreaKey | null;
  onHover: (k: AreaKey | null) => void;
  align: "left" | "right";
}) {
  const isHov = hovered === area.key;
  const isDim = hovered !== null && !isHov;

  return (
    <motion.div
      className="flex cursor-default items-start gap-4"
      onHoverStart={() => onHover(area.key)}
      onHoverEnd={() => onHover(null)}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45 }}
      style={{ opacity: isDim ? 0.3 : 1, transition: "opacity 0.25s" }}
    >
      {/* Icon */}
      <motion.div
        animate={{ scale: isHov ? 1.1 : 1, y: isHov ? -4 : [0, -5, 0] }}
        transition={isHov ? { duration: 0.2 } : { y: { duration: 3.5, repeat: Infinity, ease: "easeInOut" } }}
        style={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          background: "white",
          border: `3px solid ${NAVY}`,
          boxShadow: isHov
            ? `4px 4px 0 ${NAVY}, 0 0 22px rgba(39,211,195,0.4)`
            : `4px 4px 0 ${NAVY}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "box-shadow 0.2s",
        }}
      >
        <area.Icon size={28} color={isHov ? TEAL : NAVY} strokeWidth={1.7} />
      </motion.div>

      {/* Text */}
      <div style={{ paddingTop: 4 }}>
        <h3 className="font-display font-bold leading-tight" style={{ fontSize: 15, color: NAVY, marginBottom: 7 }}>
          {area.title}
        </h3>
        <div
          style={{
            width: 28, height: 2.5,
            background: isHov ? TEAL : SKY,
            borderRadius: 2, marginBottom: 7,
            transition: "background 0.25s",
          }}
        />
        <p style={{ fontSize: 12.5, lineHeight: 1.65, color: `${NAVY}99`, maxWidth: 200 }}>
          {area.desc}
        </p>
      </div>
    </motion.div>
  );
}
