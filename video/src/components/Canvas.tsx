import { ReactNode } from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";

// Fixed design canvas scaled to fit (and centred in) any output size.
export const Canvas = ({ width: W, height: H, children }: { width: number; height: number; children: ReactNode }) => {
  const { width, height } = useVideoConfig();
  const scale = Math.min(width / W, height / H);
  return (
    <AbsoluteFill
      style={{
        width: W,
        height: H,
        left: (width - W * scale) / 2,
        top: (height - H * scale) / 2,
        transform: `scale(${scale})`,
        transformOrigin: "top left",
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
