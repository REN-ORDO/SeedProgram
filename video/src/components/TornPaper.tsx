import { CSSProperties, ReactNode } from "react";

// Deterministic pseudo-random so every render tears the same way.
const rand = (i: number, seed: number) => {
  const x = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

// Irregular edge: big wobble + fine fibre jitter, never a clean line.
const jag = (i: number, seed: number, amp: number) =>
  (Math.sin(i * 0.45 + seed) * 0.5 + (rand(i, seed) - 0.5) * 1.6) * amp;

// Torn outline on all four sides, as a clip-path polygon in %.
const tornPolygon = (seed: number, inset: number, amp: number) => {
  const pts: string[] = [];
  const nX = 70;
  const nY = 40;
  for (let i = 0; i <= nX; i++) pts.push(`${(i / nX) * 100}% ${inset + jag(i, seed, amp)}%`);
  for (let i = 0; i <= nY; i++) pts.push(`${100 - inset * 0.6 + jag(i, seed + 3, amp * 0.6)}% ${(i / nY) * 100}%`);
  for (let i = nX; i >= 0; i--) pts.push(`${(i / nX) * 100}% ${100 - inset + jag(i, seed + 5, amp)}%`);
  for (let i = nY; i >= 0; i--) pts.push(`${inset * 0.6 + jag(i, seed + 9, amp * 0.6)}% ${(i / nY) * 100}%`);
  return `polygon(${pts.join(",")})`;
};

// Outer layer = white fibrous rim; inner layer = the recycled paper body.
const rimClip = tornPolygon(2, 1.2, 0.9);
const bodyClip = tornPolygon(11, 2.6, 1.1);

// Recycled paper flecks: short fibres and specks scattered over the sheet.
const flecks = Array.from({ length: 140 }, (_, i) => ({
  x: rand(i, 21) * 100,
  y: rand(i, 33) * 100,
  len: 0.4 + rand(i, 45) * 1.4,
  rot: rand(i, 57) * 180,
  dark: rand(i, 69) > 0.55,
  dot: rand(i, 81) > 0.7,
}));

const RecycledTexture = () => (
  <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0 }}>
    <filter id="recycled" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="4" seed="9" />
      <feColorMatrix values="0 0 0 0 0.42  0 0 0 0 0.37  0 0 0 0 0.28  0 0 0 0.5 0" />
    </filter>
    <filter id="blotch" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="3" />
      <feColorMatrix values="0 0 0 0 0.55  0 0 0 0 0.48  0 0 0 0 0.36  0 0 0 0.12 0" />
    </filter>
    <rect width="100" height="100" filter="url(#blotch)" />
    <rect width="100" height="100" filter="url(#recycled)" opacity={0.4} />
    {flecks.map((f, i) =>
      f.dot ? (
        <ellipse key={i} cx={f.x} cy={f.y} rx={0.12} ry={0.08} fill={f.dark ? "#8a7d68" : "#b8ab93"} opacity={0.7} />
      ) : (
        <line
          key={i}
          x1={f.x}
          y1={f.y}
          x2={f.x + Math.cos((f.rot * Math.PI) / 180) * f.len}
          y2={f.y + Math.sin((f.rot * Math.PI) / 180) * f.len * 0.6}
          stroke={f.dark ? "#9c8f78" : "#cfc3aa"}
          strokeWidth={0.07}
          opacity={0.75}
        />
      ),
    )}
  </svg>
);

type Props = { children: ReactNode; style?: CSSProperties; padding?: string; shadow?: string };

// Default: soft blurred offset shadow. Pass `shadow` for the hard navy neo-brutalist variant.
export const TornPaper = ({ children, style, padding = "90px 70px", shadow = "drop-shadow(12px 14px 3px rgba(15,23,42,0.18))" }: Props) => (
  <div style={{ position: "absolute", filter: shadow, ...style }}>
    <div style={{ background: "#FFFDF8", clipPath: rimClip }}>
      <div style={{ position: "relative", background: "#F8F3EA", clipPath: bodyClip, padding }}>
        <RecycledTexture />
        <div style={{ position: "relative" }}>{children}</div>
      </div>
    </div>
  </div>
);
