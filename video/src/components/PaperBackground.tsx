import { AbsoluteFill } from "remotion";
import { colors } from "../tokens";

// Cream paper with fibre noise, plus a 10% white wash to integrate it.
export const PaperBackground = () => (
  <AbsoluteFill style={{ backgroundColor: colors.cream }}>
    <svg width="100%" height="100%" style={{ position: "absolute", opacity: 0.35 }}>
      <filter id="paper">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="4" />
        <feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.40  0 0 0 0 0.32  0 0 0 0.35 0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#paper)" />
    </svg>
    <AbsoluteFill style={{ backgroundColor: "rgba(255,255,255,0.1)" }} />
  </AbsoluteFill>
);
