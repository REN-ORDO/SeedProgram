import { CSSProperties, ReactNode } from "react";
import { colors } from "../tokens";

// Deterministic jagged edge so every render tears the same way.
const edge = (n: number, y: number, amp: number, seed: number) =>
  Array.from({ length: n + 1 }, (_, i) => {
    const jitter = Math.sin(i * 12.9898 + seed) * 43758.5453;
    const r = jitter - Math.floor(jitter);
    return `${(i / n) * 100}% ${y + (r - 0.5) * amp}%`;
  });

const clip = `polygon(${[...edge(40, 2, 3, 1), ...edge(40, 98, 3, 7).reverse()].join(",")})`;

export const TornPaper = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => (
  <div style={{ position: "absolute", filter: "drop-shadow(10px 12px 0 rgba(15,23,42,0.14))", ...style }}>
    <div style={{ background: colors.cream, clipPath: clip, padding: "70px 60px" }}>{children}</div>
  </div>
);
