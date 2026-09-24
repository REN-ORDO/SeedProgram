import { CSSProperties } from "react";

type Props = { color?: "teal" | "cream" | "sky"; width?: number; rotate?: number; style?: CSSProperties };

const tapeColors = { teal: "rgba(94,234,212,0.78)", cream: "rgba(236,226,205,0.85)", sky: "rgba(186,230,253,0.85)" };

export const Tape = ({ color = "teal", width = 170, rotate = 0, style }: Props) => (
  <div
    style={{
      position: "absolute",
      width,
      height: width * 0.32,
      transform: `rotate(${rotate}deg)`,
      background: tapeColors[color],
      clipPath: "polygon(3% 0, 97% 4%, 100% 50%, 96% 100%, 2% 96%, 0 45%)",
      boxShadow: "0 2px 6px rgba(15,23,42,0.08)",
      ...style,
    }}
  />
);
