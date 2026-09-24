import { CSSProperties, ReactNode } from "react";
import { colors, fonts } from "../tokens";

type Props = { width: number; rotate: number; bw?: boolean; label?: string; photoRatio?: number; style?: CSSProperties; children?: ReactNode };

// Placeholder photo: swap the inner block for <Img src={staticFile(...)} /> when real photos exist.
export const Polaroid = ({ width, rotate, bw, label, photoRatio = 1.12, style, children }: Props) => {
  const photoH = width * photoRatio;
  return (
    <div
      style={{
        position: "absolute",
        width,
        padding: `${width * 0.05}px ${width * 0.05}px ${width * 0.16}px`,
        background: colors.white,
        transform: `rotate(${rotate}deg)`,
        boxShadow: "8px 10px 0 rgba(15,23,42,0.12), 0 2px 10px rgba(15,23,42,0.1)",
        ...style,
      }}
    >
      {children ? (
        <div style={{ height: photoH, position: "relative", overflow: "hidden" }}>{children}</div>
      ) : (
      <div
        style={{
          height: photoH,
          background: bw
            ? "linear-gradient(160deg, #d4d4d4, #737373)"
            : `linear-gradient(160deg, ${colors.softSky}, ${colors.mint} 60%, ${colors.teal})`,
          filter: bw ? "grayscale(1)" : undefined,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          color: bw ? "#fafafa" : colors.navy,
          fontFamily: fonts.sans,
        }}
      >
        <svg width={width * 0.3} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
        </svg>
        <div style={{ fontSize: width * 0.06, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>{label}</div>
        <div style={{ fontSize: width * 0.045, opacity: 0.8 }}>foto real · placeholder</div>
      </div>
      )}
    </div>
  );
};
