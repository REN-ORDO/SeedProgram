import { Img, staticFile } from "remotion";

// logo-cooweb.png has white margins around the blue circle (~860px of 1254px): crop to the circle.
export const Isotipo = ({ size }: { size: number }) => {
  const k = size / 860;
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", position: "relative", flexShrink: 0 }}>
      <Img src={staticFile("logo-cooweb.png")} style={{ position: "absolute", width: 1254 * k, left: -195 * k, top: -180 * k }} />
    </div>
  );
};
