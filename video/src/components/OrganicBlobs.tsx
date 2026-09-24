import { CSSProperties } from "react";

type Props = { color: string; size: number; opacity?: number; seed?: number; style?: CSSProperties };

const shapes = [
  "M60 5c30 0 55 20 55 50s-20 60-58 60S2 90 5 55 30 5 60 5z",
  "M50 8c35-8 68 22 62 55s-35 55-65 48S0 80 6 50 20 14 50 8z",
  "M65 2c28 6 52 35 45 65s-40 48-70 38S-2 70 8 40 38-4 65 2z",
];

// Watercolour-style blob: soft edge via blur + layered opacity.
export const Blob = ({ color, size, opacity = 0.75, seed = 0, style }: Props) => (
  <svg width={size} height={size} viewBox="0 0 120 120" style={{ position: "absolute", overflow: "visible", ...style }}>
    <path d={shapes[seed % shapes.length]} fill={color} opacity={opacity} style={{ filter: "blur(1.5px)" }} />
    <path d={shapes[(seed + 1) % shapes.length]} fill={color} opacity={opacity * 0.35} transform="translate(8 6) scale(0.92)" />
  </svg>
);
