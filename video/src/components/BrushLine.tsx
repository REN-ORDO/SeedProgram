import { colors } from "../tokens";

// Brush stroke drawn in by progress (0..1) via stroke-dashoffset.
export const BrushLine = ({ d, progress, width = 14, viewBox, style }: { d: string; progress: number; width?: number; viewBox: string; style?: React.CSSProperties }) => (
  <svg viewBox={viewBox} style={{ position: "absolute", overflow: "visible", ...style }}>
    <path d={d} fill="none" stroke={colors.teal} strokeWidth={width} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - progress} opacity={0.9} />
  </svg>
);
