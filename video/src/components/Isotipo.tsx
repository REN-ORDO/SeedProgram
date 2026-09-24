import { Img, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

// logo-cooweb.png has white margins around the blue circle (~860px of 1254px): crop to the circle.
export const Isotipo = ({ size }: { size: number }) => {
  const k = size / 860;
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", position: "relative", flexShrink: 0 }}>
      <Img src={staticFile("logo-cooweb.png")} style={{ position: "absolute", width: 1254 * k, left: -195 * k, top: -180 * k }} />
    </div>
  );
};

// Isotipo-only brand mark (manual p.5, videos 1–4): rolls in from the left edge at `delay` seconds.
export const CornerMark = ({ size = 64, margin = 32, delay = 0 }: { size?: number; margin?: number; delay?: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - Math.round(delay * fps), fps, config: { damping: 11 } });
  return (
    <div
      style={{
        position: "absolute",
        left: margin,
        bottom: margin,
        transform: `translateX(${-(1 - p) * (size + margin * 2)}px) rotate(${-(1 - p) * 220}deg)`,
      }}
    >
      <Isotipo size={size} />
    </div>
  );
};
