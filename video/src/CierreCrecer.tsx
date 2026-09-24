import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { PaperBackground } from "./components/PaperBackground";
import { Canvas } from "./components/Canvas";
import { Polaroid } from "./components/Polaroid";
import { Tape } from "./components/Tape";
import { Blob } from "./components/OrganicBlobs";
import { BrushLine } from "./components/BrushLine";
import { TornPaper } from "./components/TornPaper";
import { Isotipo } from "./components/Isotipo";
import { colors, fonts, FPS } from "./tokens";

const s = (sec: number) => Math.round(sec * FPS);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const W = 1080;
const H = 1350;
const POLA_W = 280;
const METRIC = 78;

// Placeholder community photos: people working together. Swap for real photos in public/photos/.
const CommunityPhoto = ({ bg, people }: { bg: string; people: number }) => (
  <svg viewBox="0 0 100 112" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" style={{ display: "block" }}>
    <rect width="100" height="112" fill={bg} />
    {Array.from({ length: people }, (_, i) => {
      const x = 100 / (people + 1) * (i + 1);
      return (
        <g key={i}>
          <circle cx={x} cy={44 + (i % 2) * 4} r={9} fill="#CBD5E1" />
          <path d={`M${x - 16} 90c1-14 7-22 16-22s15 8 16 22z`} fill={i % 2 ? "#64748B" : "#94A3B8"} />
        </g>
      );
    })}
    <rect x="0" y="86" width="100" height="26" fill="#E7DCC8" />
    <rect x="30" y="92" width="18" height="11" fill="#FFFFFF" transform="rotate(-5 39 97)" />
  </svg>
);

const polaroids = [
  { rotate: -4, tape: "cream" as const, bg: colors.softSky, people: 2 },
  { rotate: 0, tape: "teal" as const, bg: "#CCFBF1", people: 3 },
  { rotate: 4, tape: "sky" as const, bg: "#E0F2FE", people: 2 },
];

export const CierreCrecer = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = (from: number, damping = 12) => spring({ frame: frame - from, fps, config: { damping } });

  // Beat 1 (0–1.5s): community fan of polaroids.
  const polaIn = (i: number) => sp(s(0.1 + i * 0.15), 13);

  // Beat 2 (1.5–3.5s): polaroids shrink up, progress ring fills 0→78% in 1.2s.
  const up = interpolate(frame, [s(1.5), s(2.0)], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const ringIn = sp(s(1.6), 14);
  const fill = interpolate(frame, [s(1.8), s(3.0)], [0, METRIC / 100], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const ringOut = interpolate(frame, [s(3.4), s(3.7)], [1, 0], clamp);

  // Beat 3 (3.5–6.5s): big torn paper + CTA, then the full lockup.
  const paper = sp(s(3.5), 12);
  const scriptIn = interpolate(frame, [s(3.8), s(4.1)], [0, 1], clamp);
  const underline = interpolate(frame, [s(4.0), s(4.5)], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const subIn = interpolate(frame, [s(4.2), s(4.5)], [0, 1], clamp);
  const cta = interpolate(frame, [s(4.5), s(4.65), s(4.8)], [0, 1.1, 1], { ...clamp, easing: Easing.out(Easing.quad) });
  const lockup = sp(s(4.8), 14);

  const R = 170;
  const C = 2 * Math.PI * R;

  return (
    <AbsoluteFill>
      <PaperBackground />
      <Canvas width={W} height={H}>
        <Blob color={colors.mint} size={520} seed={0} opacity={0.2} style={{ left: -120, top: 180 }} />
        <Blob color={colors.sky} size={460} seed={1} opacity={0.2} style={{ right: -120, top: 420 }} />

        {/* Community fan */}
        <div style={{ position: "absolute", left: 0, top: 0, width: W, height: 800, transform: `translateY(${-up * 150}px) scale(${1 - up * 0.45})`, transformOrigin: "center 0px" }}>
          {polaroids.map((p, i) => {
            const k = polaIn(i);
            return (
              <div key={i} style={{ position: "absolute", left: W / 2 - POLA_W / 2 + (i - 1) * 250, top: 360 + (i === 1 ? -20 : 10) + (1 - k) * 700, zIndex: i === 1 ? 2 : 1 }}>
                <Polaroid width={POLA_W} rotate={p.rotate}>
                  <CommunityPhoto bg={p.bg} people={p.people} />
                </Polaroid>
                <Tape color={p.tape} width={110} rotate={p.rotate * 1.5} style={{ left: (POLA_W - 110) / 2, top: -18 }} />
              </div>
            );
          })}
        </div>

        {/* Progress ring */}
        <div
          style={{
            position: "absolute", left: W / 2 - 220, top: 470, width: 440, textAlign: "center",
            opacity: ringIn * ringOut, transform: `scale(${0.7 + ringIn * 0.3})`,
          }}
        >
          <svg width={440} height={440} viewBox="0 0 440 440">
            <circle cx={220} cy={220} r={R + 26} fill="none" stroke={colors.navy} strokeWidth={8} />
            <circle cx={220} cy={220} r={R} fill="none" stroke="#E2E8F0" strokeWidth={24} />
            <circle
              cx={220} cy={220} r={R} fill="none" stroke={colors.teal} strokeWidth={24} strokeLinecap="round"
              strokeDasharray={C} strokeDashoffset={C * (1 - fill)} transform="rotate(-90 220 220)"
            />
            <text x={220} y={258} textAnchor="middle" fontFamily={fonts.sans} fontWeight={900} fontSize={108} fill={colors.teal}>
              {Math.round(fill * 100)}%
            </text>
          </svg>
          <div style={{ fontFamily: fonts.sans, fontSize: 34, color: colors.navy, marginTop: 10 }}>aprende haciendo</div>
        </div>

        {/* Closing torn paper with CTA */}
        <TornPaper
          padding="60px 56px"
          shadow="drop-shadow(10px 10px 0 #0F172A)"
          style={{ left: (W - W * 0.85) / 2, width: W * 0.85, top: 330 + (1 - paper) * 1100, opacity: frame < s(3.5) ? 0 : 1, transform: "rotate(-1deg)" }}
        >
          <div style={{ textAlign: "center", color: colors.navy }}>
            <div style={{ fontFamily: fonts.sans, fontWeight: 900, fontSize: 88, lineHeight: 0.95, letterSpacing: -2 }}>¿LISTO PARA</div>
            <div style={{ position: "relative", display: "inline-block", marginTop: 6 }}>
              <div style={{ fontFamily: fonts.script, fontWeight: 700, fontSize: 104, color: colors.teal, lineHeight: 1, opacity: scriptIn, transform: `rotate(-3deg) translateY(${(1 - scriptIn) * 14}px)` }}>CRECER?</div>
              <BrushLine viewBox="0 0 600 40" d="M10 25 C 150 8, 400 10, 590 22" progress={underline} width={8} style={{ left: "-6%", width: "112%", bottom: -12, height: 30 }} />
            </div>
            <div style={{ fontFamily: fonts.sans, fontSize: 32, marginTop: 36, opacity: subIn }}>Pequeños pasos, gran comunidad.</div>
            <div
              style={{
                display: "inline-block", marginTop: 38, background: colors.teal, color: colors.white,
                fontFamily: fonts.sans, fontWeight: 600, fontSize: 36, borderRadius: 24, padding: "24px 44px",
                boxShadow: `6px 6px 0 ${colors.navy}`, transform: `scale(${cta})`,
              }}
            >
              Aplica al programa →
            </div>
          </div>
        </TornPaper>

        {/* Full lockup: institutional close, clear space kept around it */}
        <div
          style={{
            position: "absolute", bottom: 80, width: W, display: "flex", justifyContent: "center", alignItems: "center", gap: 20,
            opacity: lockup, transform: `translateY(${(1 - lockup) * 30}px)`,
          }}
        >
          <Isotipo size={76} />
          <div style={{ fontFamily: fonts.sans, fontWeight: 600, fontSize: 42, color: colors.cooweb, letterSpacing: 0.5 }}>Semillero by CooWeb</div>
        </div>
      </Canvas>
    </AbsoluteFill>
  );
};
