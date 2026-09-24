import { continueRender, delayRender, staticFile } from "remotion";

// Fonts are bundled locally so renders never depend on the network.
const faces: [string, string, number][] = [
  ["Inter", "inter-latin-400-normal.woff2", 400],
  ["Inter", "inter-latin-700-normal.woff2", 700],
  ["Inter", "inter-latin-900-normal.woff2", 900],
  ["Caveat", "caveat-latin-700-normal.woff2", 700],
];
const handle = delayRender("fonts");
Promise.all(
  faces.map(([family, file, weight]) =>
    new FontFace(family, `url(${staticFile(`fonts/${file}`)})`, { weight: String(weight) }).load().then((f) => document.fonts.add(f)),
  ),
).then(() => continueRender(handle));

export const colors = {
  cream: "#FAF7F2",
  navy: "#0F172A",
  teal: "#14B8A6",
  mint: "#5EEAD4",
  sky: "#7DD3FC",
  softSky: "#BAE6FD",
  dots: "#CBD5E1",
  cooweb: "#3797E8",
  white: "#FFFFFF",
};

export const fonts = {
  sans: "Inter, sans-serif",
  script: "Caveat, cursive",
};

export const FPS = 30;
export const DURATION = Math.round(6.5 * FPS);
