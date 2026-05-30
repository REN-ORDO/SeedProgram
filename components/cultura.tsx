"use client";

import { useState } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { Heart, Lightbulb, MessagesSquare, RefreshCw, Eye, Mic2, X } from "lucide-react";
import { Reveal } from "@/components/reveal";

const W = 760;
const H = 480;

// Pentágono regular: centro (380, 270), radio 200px, vértice superior a 270°
const toRad = (deg: number) => (deg * Math.PI) / 180;
const PC = { x: 380, y: 285 };
const PR = 200;
const pv = (deg: number) => ({
  cx: Math.round(PC.x + PR * Math.cos(toRad(deg))),
  cy: Math.round(PC.y + PR * Math.sin(toRad(deg))),
});

const NODES = [
  { id: "curiosidad",    title: "Curiosidad constante",   desc: "Preguntar es la clave para crecer.",            Icon: Lightbulb,      ...pv(270), r: 82, color: "#5EEAD4", floatDelay: 0   },
  { id: "compartir",    title: "Compartir conocimiento", desc: "Enseñar es aprender dos veces.",                Icon: MessagesSquare, ...pv(342), r: 82, color: "#7DD3FC", floatDelay: 0.6 },
  { id: "transparencia",title: "Transparencia",           desc: "Tu voz importa en cada paso.",                  Icon: Eye,            ...pv(54),  r: 82, color: "#38BDF8", floatDelay: 1.2 },
  { id: "aprender",     title: "Aprender del error",      desc: "Valoramos la reflexión, no penalizamos fallar.",Icon: RefreshCw,      ...pv(126), r: 82, color: "#2DD4BF", floatDelay: 1.8 },
  { id: "respeto",      title: "Respeto ante todo",       desc: "Las ideas se discuten, las personas se cuidan.",Icon: Heart,          ...pv(198), r: 82, color: "#BAE6FD", floatDelay: 2.4 },
];

type NodeId = "curiosidad" | "respeto" | "compartir" | "aprender" | "transparencia";
type MobileSelectedId = NodeId | "cooweb-talks";

const COOWEB_TALKS_DATA = {
  id: "cooweb-talks" as const,
  title: "CooWeb Talks",
  desc: "Una charla interna por ciclo para compartir lo aprendido.",
  Icon: Mic2,
  color: "#14B8A6",
  badge: "Ritual de cultura",
};

const EDGES: [NodeId, NodeId][] = [
  ["curiosidad",     "compartir"],
  ["compartir",      "transparencia"],
  ["transparencia",  "aprender"],
  ["aprender",       "respeto"],
  ["respeto",        "curiosidad"],
  ["curiosidad",     "aprender"],   // diagonal
];

function perimeterPt(
  from: { cx: number; cy: number; r: number },
  to: { cx: number; cy: number }
) {
  const dx = to.cx - from.cx;
  const dy = to.cy - from.cy;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  return { x: from.cx + (dx / dist) * from.r, y: from.cy + (dy / dist) * from.r };
}

function edgePath(
  from: { cx: number; cy: number; r: number },
  to: { cx: number; cy: number; r: number }
) {
  const p1 = perimeterPt(from, to);
  const p2 = perimeterPt(to, from);
  const mx = (p1.x + p2.x) / 2;
  const my = (p1.y + p2.y) / 2;
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const nx = (-dy / len) * 30;
  const ny = (dx / len) * 30;
  return {
    d: `M${p1.x.toFixed(1)},${p1.y.toFixed(1)} Q${(mx + nx).toFixed(1)},${(my + ny).toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`,
    p1,
    p2,
  };
}

export function Cultura() {
  const [hoveredId, setHoveredId] = useState<NodeId | null>(null);
  const [selectedMobile, setSelectedMobile] = useState<MobileSelectedId | null>(null);
  const reduce = useReducedMotion();

  const nodeMap = Object.fromEntries(NODES.map((n) => [n.id, n])) as Record<NodeId, typeof NODES[number]>;
  const getSelectedData = (id: MobileSelectedId) =>
    id === "cooweb-talks" ? COOWEB_TALKS_DATA : { ...nodeMap[id as NodeId], badge: "ADN CooWeb" };

  const edges = EDGES.map(([a, b]) => {
    const { d, p1, p2 } = edgePath(nodeMap[a], nodeMap[b]);
    return { a, b, d, p1, p2 };
  });

  return (
    <section
      id="cultura"
      aria-label="Cultura"
      className="relative overflow-hidden px-5 py-16 md:px-10 md:py-28 toon-section toon-section--soft"
    >
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <Reveal className="mb-3 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-[--color-fg-subtle]">
          <span className="font-bold text-[--color-ink]">04</span>
          <span className="h-[2px] w-12 bg-[var(--color-ink)]" />
          <span>Manifiesto · ADN</span>
        </Reveal>

        <div className="mb-4 max-w-3xl">
          <Reveal delay={0.05}>
            <h2 className="text-balance font-display text-4xl font-bold leading-[1.05] tracking-tight text-[--color-ink] md:text-6xl">
              Cinco valores.{" "}
              <span
                className="font-handwritten"
                style={{ color: "var(--color-accent-strong)", fontWeight: 700, fontSize: "1.15em", display: "inline-block", transform: "rotate(-2deg)" }}
              >
                Una cultura
              </span>
              .
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="mt-5 text-base leading-relaxed text-[--color-fg-muted] md:text-lg">
              No son posters en la pared. Son la forma en que decidimos, discutimos y crecemos.
            </p>
          </Reveal>
        </div>

        {/* ── Desktop: constelación SVG ─────────────────────────── */}
        <div className="hidden md:flex md:items-center md:gap-8">

          {/* Constellation — todo dentro del SVG para alineación perfecta */}
          <div className="relative min-w-0 flex-1">
            {/* Aspect-ratio wrapper fiable */}
            <div style={{ position: "relative", width: "100%", paddingBottom: `${(H / W) * 100}%` }}>
              <div style={{ position: "absolute", inset: 0 }}>
                <svg
                  width="100%"
                  height="100%"
                  viewBox={`0 0 ${W} ${H}`}
                  style={{ overflow: "visible" }}
                  aria-label="Red de valores CooWeb"
                >
                  <defs>
                    {edges.map(({ a, b, d }) => (
                      <path key={`def-${a}-${b}`} id={`e-${a}-${b}`} d={d} fill="none" />
                    ))}
                  </defs>

                  {/* ── Líneas de conexión ── */}
                  {edges.map(({ a, b, d }) => {
                    const active = hoveredId === a || hoveredId === b;
                    return (
                      <path
                        key={`line-${a}-${b}`}
                        d={d}
                        fill="none"
                        stroke={active ? "#14B8A6" : "#7DD3FC"}
                        strokeWidth={active ? 2.6 : 1.8}
                        strokeDasharray="9 6"
                        strokeLinecap="round"
                        opacity={active ? 1 : 0.55}
                        style={{ transition: "stroke 0.25s, opacity 0.25s, stroke-width 0.25s" }}
                      />
                    );
                  })}

                  {/* ── Puntos viajeros animados ── */}
                  {!reduce && edges.map(({ a, b }, i) => (
                    <circle key={`tdot-${a}-${b}`} r={3.5} fill="#2DD4BF" opacity={0.9}>
                      <animateMotion dur={`${4 + i * 0.85}s`} repeatCount="indefinite">
                        <mpath href={`#e-${a}-${b}`} />
                      </animateMotion>
                    </circle>
                  ))}

                  {/* ── Puntos de unión en el perímetro ── */}
                  {edges.map(({ a, b, p1, p2 }) => (
                    <g key={`junc-${a}-${b}`}>
                      <circle cx={p1.x} cy={p1.y} r={5} fill="white" stroke="#0F172A" strokeWidth={2} />
                      <circle cx={p2.x} cy={p2.y} r={5} fill="white" stroke="#0F172A" strokeWidth={2} />
                    </g>
                  ))}

                  {/* ── Nodos ── */}
                  {NODES.map((n) => (
                    <motion.g
                      key={n.id}
                      onHoverStart={() => setHoveredId(n.id as NodeId)}
                      onHoverEnd={() => setHoveredId(null)}
                      animate={reduce ? undefined : { y: [-4, 4, -4] }}
                      whileHover={{ scale: 1.05 }}
                      transition={
                        reduce
                          ? undefined
                          : {
                              y: {
                                duration: 3.5 + n.floatDelay,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: n.floatDelay,
                              },
                              scale: { duration: 0.2 },
                            }
                      }
                      style={{ transformOrigin: `${n.cx}px ${n.cy}px`, transformBox: "fill-box" } as React.CSSProperties}
                    >
                      {/* Sombra offset cartoon */}
                      <circle cx={n.cx + 4} cy={n.cy + 4} r={n.r} fill="#0F172A" />
                      {/* Círculo principal */}
                      <circle cx={n.cx} cy={n.cy} r={n.r} fill={n.color} stroke="#0F172A" strokeWidth={2.5} />
                      {/* Contenido via foreignObject */}
                      <foreignObject x={n.cx - n.r} y={n.cy - n.r} width={n.r * 2} height={n.r * 2}>
                        <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "10px 12px", boxSizing: "border-box" }}>
                          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: 8, background: "#fff", border: "2px solid #0F172A", boxShadow: "2px 2px 0 #0F172A", marginBottom: 6, flexShrink: 0 }}>
                            <n.Icon size={15} color="#0F172A" />
                          </div>
                          <div style={{ fontFamily: "var(--font-display, sans-serif)", fontWeight: 700, fontSize: 11.5, lineHeight: 1.15, color: "#0F172A", marginBottom: 4 }}>
                            {n.title}
                          </div>
                          <div style={{ fontSize: 9.5, lineHeight: 1.3, color: "rgba(15,23,42,0.72)" }}>
                            {n.desc}
                          </div>
                        </div>
                      </foreignObject>
                    </motion.g>
                  ))}
                </svg>
              </div>
            </div>
          </div>

          {/* ── CooWeb Talks card ── */}
          <div className="shrink-0" style={{ width: 196 }}>
            <motion.div
              className="toon-card p-5"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              style={{ background: "#0F172A", color: "#fff", transform: "rotate(1.5deg)" }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 44, height: 44, borderRadius: 12, background: "rgba(45,212,191,0.12)", border: "2px solid #2DD4BF", marginBottom: 14 }}>
                <Mic2 size={20} color="#2DD4BF" />
              </span>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#2DD4BF", marginBottom: 6 }}>
                Ritual de cultura
              </p>
              <h3 className="font-display font-bold" style={{ fontSize: 20, lineHeight: 1.15, color: "#fff", marginBottom: 8 }}>
                CooWeb Talks
              </h3>
              <p style={{ fontSize: 12, lineHeight: 1.6, color: "rgba(255,255,255,0.68)" }}>
                Una charla interna por ciclo para compartir lo aprendido.
              </p>
              <div style={{ marginTop: 16, display: "flex", gap: 6, opacity: 0.28 }}>
                {[0, 1, 2].map((i) => (
                  <svg key={i} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2DD4BF" strokeWidth="1.5">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                  </svg>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── Mobile: pentágono íconos + tarjeta info al tocar ── */}
        <div className="md:hidden">

          <AnimatePresence mode="wait">
            {!selectedMobile ? (
              /* ── Pentágono + círculo CooWeb Talks ── */
              <motion.div
                key="pentagon"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* SVG pentágono */}
                <div style={{ position: "relative", width: "100%", paddingBottom: `${(H / W) * 100}%` }}>
                  <div style={{ position: "absolute", inset: 0 }}>
                    <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>

                      {/* Líneas */}
                      {edges.map(({ a, b, d }) => (
                        <path key={`ml-${a}-${b}`} d={d} fill="none" stroke="#0369A1"
                          strokeWidth={1.8} strokeDasharray="8 5" strokeLinecap="round" opacity={0.75} />
                      ))}

                      {/* Puntos de unión */}
                      {edges.map(({ a, b, p1, p2 }) => (
                        <g key={`mj-${a}-${b}`}>
                          <circle cx={p1.x} cy={p1.y} r={4.5} fill="white" stroke="#0F172A" strokeWidth={2} />
                          <circle cx={p2.x} cy={p2.y} r={4.5} fill="white" stroke="#0F172A" strokeWidth={2} />
                        </g>
                      ))}

                      {/* Nodos — vibración + tap */}
                      {NODES.map((n) => (
                        <motion.g
                          key={`mn-${n.id}`}
                          onClick={() => setSelectedMobile(n.id as NodeId)}
                          animate={{ y: [-3, 3, -3], scale: [1, 1.03, 1] }}
                          transition={{ duration: 2.2 + n.floatDelay * 0.4, repeat: Infinity, ease: "easeInOut", delay: n.floatDelay }}
                          style={{ cursor: "pointer", transformOrigin: `${n.cx}px ${n.cy}px`, transformBox: "fill-box" } as React.CSSProperties}
                        >
                          <circle cx={n.cx + 3} cy={n.cy + 3} r={n.r} fill="#0F172A" />
                          <circle cx={n.cx} cy={n.cy} r={n.r} fill={n.color} stroke="#0F172A" strokeWidth={2.5} />
                          <foreignObject x={n.cx - n.r} y={n.cy - n.r} width={n.r * 2} height={n.r * 2}>
                            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <n.Icon size={44} color="#0F172A" />
                            </div>
                          </foreignObject>
                        </motion.g>
                      ))}

                      {/* Nodo central CooWeb Talks */}
                      <motion.g
                        onClick={() => setSelectedMobile("cooweb-talks")}
                        animate={{ y: [-3, 3, -3], scale: [1, 1.03, 1] }}
                        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        style={{ cursor: "pointer", transformOrigin: `${PC.x}px ${PC.y}px`, transformBox: "fill-box" } as React.CSSProperties}
                      >
                        <circle cx={PC.x + 3} cy={PC.y + 3} r={70} fill="#0F172A" />
                        <circle cx={PC.x} cy={PC.y} r={70} fill="#14B8A6" stroke="#0F172A" strokeWidth={2.5} />
                        <foreignObject x={PC.x - 70} y={PC.y - 70} width={140} height={140}>
                          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Mic2 size={30} color="#0F172A" />
                          </div>
                        </foreignObject>
                      </motion.g>
                    </svg>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* ── Tarjeta info ── */
              (() => {
                const data = getSelectedData(selectedMobile);
                const cardBg = data.color;
                const iconBg = "#F8FAFC";
                const textColor = "#0F172A";
                const descColor = "rgba(15,23,42,0.68)";
                return (
                  <motion.div
                    key={`card-${selectedMobile}`}
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="toon-card mx-auto px-6 py-7"
                    style={{ background: cardBg, position: "relative" }}
                  >
                    {/* Botón X */}
                    <button
                      onClick={() => setSelectedMobile(null)}
                      aria-label="Cerrar"
                      style={{
                        position: "absolute",
                        top: 14,
                        right: 14,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 34,
                        height: 34,
                        borderRadius: 8,
                        background: "#F8FAFC",
                        border: "2px solid #0F172A",
                        boxShadow: "2px 2px 0 #0F172A",
                        cursor: "pointer",
                        color: "#0F172A",
                      }}
                    >
                      <X size={16} />
                    </button>

                    {/* Ícono grande */}
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 64,
                        height: 64,
                        borderRadius: 16,
                        background: iconBg,
                        border: "2px solid #0F172A",
                        boxShadow: "3px 3px 0 #0F172A",
                        marginBottom: 16,
                      }}
                    >
                      <data.Icon size={30} color="#0F172A" />
                    </div>

                    {/* Título */}
                    <h3
                      className="font-display font-bold"
                      style={{ fontSize: 20, lineHeight: 1.2, color: textColor, marginBottom: 8, paddingRight: 40 }}
                    >
                      {data.title}
                    </h3>

                    {/* Descripción */}
                    <p style={{ fontSize: 14, lineHeight: 1.65, color: descColor }}>
                      {data.desc}
                    </p>

                    {/* Pastilla decorativa */}
                    <div
                      style={{
                        marginTop: 18,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "4px 10px",
                        borderRadius: 99,
                        background: "#F8FAFC",
                        border: "1.5px solid #0F172A",
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase" as const,
                        color: "#0F172A",
                      }}
                    >
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inset-0 animate-ping rounded-full opacity-70" style={{ background: "#0F172A" }} />
                        <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: "#0F172A" }} />
                      </span>
                      {data.badge}
                    </div>
                  </motion.div>
                );
              })()
            )}
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}
