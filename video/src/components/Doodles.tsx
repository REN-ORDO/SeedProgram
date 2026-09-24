import { colors } from "../tokens";

const stroke = { fill: "none", stroke: colors.navy, strokeWidth: 3, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export const Arrow = ({ size = 120 }: { size?: number }) => (
  <svg width={size} viewBox="0 0 120 60" {...stroke}>
    <path d="M5 40c10-25 30-25 30-8s-20 12-10-4c12-18 50-20 80-12" />
    <path d="M95 8l12 8-12 10" />
  </svg>
);
export const Bulb = ({ size = 80 }: { size?: number }) => (
  <svg width={size} viewBox="0 0 60 80" {...stroke}>
    <path d="M30 10a16 16 0 0 0-9 29c2 2 3 5 3 8h12c0-3 1-6 3-8a16 16 0 0 0-9-29z" />
    <path d="M24 54h12M25 60h10M5 22l-4-2M55 22l4-2M30 2V-2M12 8l-3-3M48 8l3-3" />
  </svg>
);
export const Sparkle = ({ size = 50 }: { size?: number }) => (
  <svg width={size} viewBox="0 0 40 40" {...stroke}>
    <path d="M20 2c2 12 6 16 18 18-12 2-16 6-18 18-2-12-6-16-18-18 12-2 16-6 18-18z" />
  </svg>
);
export const Circle = ({ size = 40 }: { size?: number }) => (
  <svg width={size} viewBox="0 0 40 40" {...stroke}>
    <circle cx="20" cy="20" r="14" />
  </svg>
);
export const Circuit = ({ size = 180 }: { size?: number }) => (
  <svg width={size} viewBox="0 0 180 90" {...stroke}>
    <circle cx="90" cy="45" r="8" />
    <path d="M82 45H20M98 45h62M90 37V15h40M90 53v22h40M60 45V20H30M60 45v25H30" />
    {[[14, 45], [166, 45], [136, 15], [136, 75], [24, 20], [24, 70]].map(([x, y]) => (
      <circle key={`${x}-${y}`} cx={x} cy={y} r="5" />
    ))}
  </svg>
);
export const DotGrid = ({ cols = 8, rows = 6, gap = 26 }: { cols?: number; rows?: number; gap?: number }) => (
  <svg width={cols * gap} height={rows * gap}>
    {Array.from({ length: cols * rows }, (_, i) => (
      <circle key={i} cx={(i % cols) * gap + 4} cy={Math.floor(i / cols) * gap + 4} r={3} fill={colors.dots} />
    ))}
  </svg>
);
