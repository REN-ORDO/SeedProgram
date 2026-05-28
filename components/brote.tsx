"use client";

import { motion, useReducedMotion } from "framer-motion";

type Node = {
  cx: number;
  cy: number;
  r: number;
  label: string;
  anchor?: "start" | "end" | "middle";
  tx: number;
  ty: number;
  apex?: boolean;
};

const NODES: Node[] = [
  { cx: 120, cy: 320, r: 6, label: "Presemilla", anchor: "end", tx: 110, ty: 310 },
  { cx: 285, cy: 305, r: 7, label: "Semilla", anchor: "start", tx: 295, ty: 295 },
  { cx: 95, cy: 235, r: 8, label: "Junior", anchor: "end", tx: 85, ty: 224 },
  { cx: 305, cy: 215, r: 9, label: "Semi Middle", anchor: "start", tx: 315, ty: 204 },
  { cx: 160, cy: 120, r: 10, label: "Middle", anchor: "end", tx: 150, ty: 108 },
  { cx: 215, cy: 30, r: 13, label: "Senior · Expert", anchor: "start", tx: 228, ty: 24, apex: true },
];

const TRUNK = "M200,410 C195,350 205,295 200,235 C195,175 205,115 215,55";

const ROOTS = [
  "M200,410 C175,408 150,408 130,412",
  "M200,410 C225,408 250,408 270,412",
  "M200,410 C190,415 180,420 165,422",
];

const BRANCHES: { d: string; w?: number }[] = [
  { d: "M200,335 C170,330 145,325 120,320" },
  { d: "M200,320 C235,315 260,310 285,305" },
  { d: "M200,250 C160,243 125,238 95,235" },
  { d: "M200,228 C245,222 280,218 305,215" },
  { d: "M200,150 C185,140 172,130 160,120", w: 1.6 },
  { d: "M200,90 C208,75 212,55 215,40", w: 2 },
  { d: "M200,290 C220,285 235,282 250,278", w: 1.2 },
  { d: "M200,200 C180,196 168,194 155,193", w: 1.2 },
  { d: "M200,170 C220,165 235,162 248,160", w: 1.1 },
];

const LEAVES = [
  { cx: 268, cy: 280, rx: 5, ry: 3, rotate: 25, color: "var(--color-accent-soft)" },
  { cx: 173, cy: 193, rx: 5, ry: 3, rotate: -30, color: "var(--color-accent-soft)" },
  { cx: 232, cy: 161, rx: 5, ry: 3, rotate: 20, color: "var(--color-accent-soft)" },
  { cx: 138, cy: 322, rx: 4, ry: 2.5, rotate: -10, color: "var(--color-accent)" },
  { cx: 270, cy: 306, rx: 4, ry: 2.5, rotate: 15, color: "var(--color-accent)" },
  { cx: 113, cy: 237, rx: 4, ry: 2.5, rotate: -20, color: "var(--color-accent)" },
  { cx: 295, cy: 217, rx: 4, ry: 2.5, rotate: 20, color: "var(--color-accent)" },
];

export function Brote() {
  const reduce = useReducedMotion();

  return (
    <div className="relative aspect-[1/1.1] w-full">
      {!reduce && (
        <>
          <span className="animate-float absolute left-[8%] top-[12%] h-1 w-1 rounded-full bg-[var(--color-accent)] opacity-50" />
          <span
            className="animate-float absolute right-[14%] top-[28%] h-1 w-1 rounded-full bg-[var(--color-accent-2)] opacity-50"
            style={{ animationDelay: "1.2s" }}
          />
          <span
            className="animate-float absolute left-[18%] top-[58%] h-1 w-1 rounded-full bg-[var(--color-accent-soft)] opacity-60"
            style={{ animationDelay: "2.4s" }}
          />
          <span
            className="animate-float absolute right-[22%] bottom-[14%] h-1 w-1 rounded-full bg-[var(--color-accent)] opacity-50"
            style={{ animationDelay: "3.6s" }}
          />
        </>
      )}

      <svg viewBox="0 0 400 440" preserveAspectRatio="xMidYMid meet" className="h-full w-full overflow-visible">
        <defs>
          <linearGradient id="trunk-gradient" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="var(--color-accent-strong)" />
            <stop offset="55%" stopColor="var(--color-accent)" />
            <stop offset="100%" stopColor="var(--color-accent-soft)" />
          </linearGradient>
          <radialGradient id="apex-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-accent-2)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="var(--color-accent-2)" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx={215} cy={30} r={40} fill="url(#apex-glow)" />

        {ROOTS.map((d, i) => (
          <motion.path
            key={`r-${i}`}
            d={d}
            fill="none"
            stroke="var(--color-accent-2)"
            strokeWidth={1.2}
            strokeLinecap="round"
            opacity={0.4}
            initial={reduce ? false : { pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 0.9, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
          />
        ))}

        <motion.path
          d={TRUNK}
          fill="none"
          stroke="url(#trunk-gradient)"
          strokeWidth={3}
          strokeLinecap="round"
          initial={reduce ? false : { pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 1.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        />

        {BRANCHES.map((b, i) => (
          <motion.path
            key={`b-${i}`}
            d={b.d}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth={b.w ?? 1.8}
            strokeLinecap="round"
            opacity={0.75}
            initial={reduce ? false : { pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 1.0, delay: 0.5 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
          />
        ))}

        {LEAVES.map((l, i) => (
          <motion.ellipse
            key={`l-${i}`}
            cx={l.cx}
            cy={l.cy}
            rx={l.rx}
            ry={l.ry}
            fill={l.color}
            opacity={0.7}
            transform={`rotate(${l.rotate} ${l.cx} ${l.cy})`}
            initial={reduce ? false : { scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 0.7 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 0.45, delay: 1.4 + i * 0.08, ease: [0.34, 1.56, 0.64, 1] }}
            style={{ transformOrigin: `${l.cx}px ${l.cy}px`, transformBox: "fill-box" }}
          />
        ))}

        {NODES.map((n, i) => (
          <motion.g
            key={n.label}
            initial={reduce ? false : { opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 0.45, delay: 1.6 + i * 0.2, ease: [0.34, 1.56, 0.64, 1] }}
            style={{ transformOrigin: `${n.cx}px ${n.cy}px`, transformBox: "fill-box" }}
          >
            <circle
              cx={n.cx}
              cy={n.cy}
              r={n.r + 4}
              fill={n.apex ? "var(--color-accent-2)" : "var(--color-accent)"}
              opacity={0.18}
            />
            <circle
              cx={n.cx}
              cy={n.cy}
              r={n.r}
              fill={n.apex ? "var(--color-accent-2)" : "var(--color-accent)"}
              style={{
                filter: n.apex
                  ? "drop-shadow(0 0 14px var(--color-accent-2))"
                  : i >= 4
                  ? "drop-shadow(0 0 8px var(--color-accent))"
                  : undefined,
              }}
            />
            <text
              x={n.tx}
              y={n.ty}
              textAnchor={n.anchor ?? "start"}
              className="font-sans"
              style={{
                fill: n.apex ? "var(--color-accent-2-strong)" : "var(--color-fg-muted)",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              {n.label}
            </text>
          </motion.g>
        ))}
      </svg>
    </div>
  );
}
