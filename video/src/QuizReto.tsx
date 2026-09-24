import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { PaperBackground } from "./components/PaperBackground";
import { Canvas } from "./components/Canvas";
import { Tape } from "./components/Tape";
import { Blob } from "./components/OrganicBlobs";
import { BrushLine } from "./components/BrushLine";
import { TornPaper } from "./components/TornPaper";
import { Sparkle } from "./components/Doodles";
import { CornerMark } from "./components/Isotipo";
import { colors, fonts, FPS } from "./tokens";

const s = (sec: number) => Math.round(sec * FPS);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const W = 1080;
const H = 1350;
const CLOUD = "#F1F5F9";

const options = ["Espero", "Pregunto", "Decido con lo que hay", "Busco más datos"];
const CORRECT = 2;
const PILL_W = 780;
const PILL_H = 92;
const PILL_TOP = 470;
const PILL_STEP = 116;
const pillY = (i: number) => PILL_TOP + i * PILL_STEP;

// Hand-drawn pointing hand; fingertip sits at (27, 5) in its viewBox.
const Hand = ({ press }: { press: number }) => (
  <svg width={110} viewBox="0 0 60 72" style={{ transform: `scale(${press})`, transformOrigin: "27px 5px", overflow: "visible" }}>
    <path
      d="M22 40V10a5 5 0 0 1 10 0v22 M32 30a5 5 0 0 1 10 0v4 M42 34a5 5 0 0 1 10 0v12c0 12-8 22-19 22h-4c-8 0-12-4-16-10l-8-12a5 5 0 0 1 8-6l9 8"
      fill={colors.white}
      stroke={colors.navy}
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M24 6c1-1 4-1 6 0" fill="none" stroke={colors.navy} strokeWidth={1.5} strokeLinecap="round" />
  </svg>
);

// 12 confetti bits bursting around the correct pill.
const confetti = Array.from({ length: 12 }, (_, i) => {
  const a = (i / 12) * Math.PI * 2 + 0.3;
  return { a, dist: 150 + (i % 3) * 60, star: i % 3 === 0, color: i % 2 ? colors.mint : colors.sky, size: 28 + (i % 4) * 8 };
});

export const QuizReto = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = (from: number, damping = 12) => spring({ frame: frame - from, fps, config: { damping } });

  // Beat 1 (0–1.2s): header, question, options.
  const header = sp(0, 12);
  const question = interpolate(frame, [s(0.15), s(0.5)], [0, 1], clamp);
  const pillIn = (i: number) => sp(s(0.35 + i * 0.12), 13);

  // Beat 2 (1.2–3.2s): hand hovers B, then settles on C and clicks.
  const hx = interpolate(frame, [s(1.2), s(1.8), s(2.1), s(2.4)], [-160, 600, 620, 660], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const hy = interpolate(frame, [s(1.2), s(1.8), s(2.1), s(2.4)], [1300, pillY(1) + 40, pillY(1) + 44, pillY(CORRECT) + 40], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const press = interpolate(frame, [s(2.5), s(2.58), s(2.7)], [1, 0.82, 1], clamp);
  const handOut = interpolate(frame, [s(3.3), s(3.7)], [1, 0], clamp);
  const picked = frame >= s(2.6);
  const pop = interpolate(frame, [s(2.6), s(2.75), s(2.95)], [1, 1.12, 1], { ...clamp, easing: Easing.out(Easing.quad) });

  // Beat 3 (3.2–5.0s): confetti, score 2/5 → 3/5, brush line to the corner.
  const burst = interpolate(frame, [s(3.2), s(3.9)], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const burstFade = interpolate(frame, [s(4.4), s(5)], [1, 0], clamp);
  const scored = frame >= s(3.4);
  const scorePop = interpolate(frame, [s(3.4), s(3.55), s(3.7)], [1, 1.35, 1], clamp);
  const brush = interpolate(frame, [s(3.5), s(4.4)], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });

  // Beat 4 (5.0–6.5s): mentor feedback paper rises from the bottom.
  const paper = sp(s(5), 12);
  const scriptIn = interpolate(frame, [s(5.3), s(5.6)], [0, 1], clamp);
  const subIn = interpolate(frame, [s(5.45), s(5.8)], [0, 1], clamp);

  const cy = pillY(CORRECT) + PILL_H / 2;
  const pillLeft = (W - PILL_W) / 2;

  return (
    <AbsoluteFill>
      <PaperBackground />
      <Canvas width={W} height={H}>
        <Blob color={colors.sky} size={300} seed={1} opacity={0.45} style={{ left: -110, top: 120 }} />
        <Blob color={colors.mint} size={360} seed={0} opacity={0.45} style={{ right: -120, top: 900 }} />

        {/* Header: small torn paper with tape */}
        <TornPaper
          padding="26px 44px"
          style={{ left: (W - 560) / 2, width: 560, top: 50 - (1 - header) * 300, transform: "rotate(-2deg)" }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 28 }}>
            <div style={{ fontFamily: fonts.sans, fontWeight: 700, fontSize: 34, letterSpacing: 4, color: colors.navy }}>RETO 3 DE 5</div>
            <div style={{ fontFamily: fonts.script, fontWeight: 700, fontSize: 64, lineHeight: 1, color: colors.teal, transform: `scale(${scorePop})` }}>
              {scored ? "3/5" : "2/5"}
            </div>
          </div>
        </TornPaper>
        <Tape color="cream" width={150} rotate={4} style={{ left: (W - 150) / 2, top: 34 - (1 - header) * 300 }} />

        {/* Question */}
        <div
          style={{
            position: "absolute", top: 250, left: 90, width: W - 180, textAlign: "center",
            fontFamily: fonts.sans, fontWeight: 900, fontSize: 66, lineHeight: 1.08, letterSpacing: -1.5, color: colors.navy,
            opacity: question, transform: `translateY(${(1 - question) * 20}px)`,
          }}
        >
          ¿Qué haces si te falta info para decidir?
        </div>

        {/* Option pills */}
        {options.map((label, i) => {
          const isC = i === CORRECT;
          const on = isC && picked;
          return (
            <div
              key={label}
              style={{
                position: "absolute", left: pillLeft, top: pillY(i), width: PILL_W, height: PILL_H, borderRadius: PILL_H / 2,
                display: "flex", alignItems: "center", gap: 18, padding: "0 40px", boxSizing: "border-box",
                background: on ? colors.teal : CLOUD, color: on ? colors.white : colors.navy,
                border: `3px solid ${colors.navy}`, boxShadow: `6px 7px 0 ${colors.navy}`,
                fontFamily: fonts.sans, fontSize: 36, fontWeight: on ? 700 : 500,
                opacity: pillIn(i), transform: `translateX(${(1 - pillIn(i)) * (i % 2 ? 80 : -80)}px) scale(${isC ? pop : 1}) rotate(${i % 2 ? 0.6 : -0.6}deg)`,
              }}
            >
              <span style={{ fontWeight: 900 }}>{"ABCD"[i]})</span>
              {label}
            </div>
          );
        })}

        {/* Confetti */}
        {confetti.map((c, i) => {
          const x = W / 2 + Math.cos(c.a) * c.dist * 1.6 * burst;
          const y = cy + Math.sin(c.a) * c.dist * 0.7 * burst;
          return (
            <div key={i} style={{ position: "absolute", left: x - c.size / 2, top: y - c.size / 2, opacity: burst > 0 ? burstFade : 0, transform: `rotate(${burst * 180}deg) scale(${0.4 + burst * 0.6})` }}>
              {c.star ? (
                <svg width={c.size} viewBox="0 0 40 40">
                  <path d="M20 2c2 12 6 16 18 18-12 2-16 6-18 18-2-12-6-16-18-18 12-2 16-6 18-18z" fill={c.color} />
                </svg>
              ) : (
                <div style={{ width: c.size * 0.6, height: c.size * 0.6, borderRadius: "50%", background: c.color }} />
              )}
            </div>
          );
        })}

        {/* Brush line from the answer to the bottom corner */}
        <BrushLine viewBox="0 0 200 260" d="M20 10 C 140 40, 170 150, 80 250" progress={brush} width={9} style={{ left: pillLeft + PILL_W - 10, top: cy, width: 200, height: 260 }} />

        {/* Hand cursor */}
        <div style={{ position: "absolute", left: hx - 27 * (110 / 60), top: hy - 5 * (110 / 60), opacity: handOut }}>
          <Hand press={press} />
        </div>

        {/* Mentor feedback */}
        <TornPaper
          padding="40px 44px"
          shadow="drop-shadow(10px 10px 0 #0F172A)"
          style={{ left: (W - W * 0.8) / 2, width: W * 0.8, top: 1000 + (1 - paper) * 500, opacity: frame < s(5) ? 0 : 1, transform: "rotate(1.5deg)" }}
        >
          <div style={{ textAlign: "center", color: colors.navy }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 24 }}>
              <span style={{ fontFamily: fonts.sans, fontWeight: 900, fontSize: 76, letterSpacing: -2 }}>¡Exacto!</span>
              <span style={{ fontFamily: fonts.script, fontWeight: 700, fontSize: 78, color: colors.teal, opacity: scriptIn, display: "inline-block", transform: "rotate(-3deg)" }}>70% basta</span>
            </div>
            <div style={{ fontFamily: fonts.sans, fontSize: 28, lineHeight: 1.35, marginTop: 10, opacity: subIn }}>
              En Semillero se avanza con 70% de info.
              <br />
              <b>Se itera después.</b>
            </div>
          </div>
        </TornPaper>
        <Tape color="teal" width={170} rotate={-3} style={{ left: (W - 170) / 2, top: 984 + (1 - paper) * 500, opacity: frame < s(5) ? 0 : 1 }} />

        <div style={{ position: "absolute", left: 70, top: 420, opacity: question }}>
          <Sparkle size={44} />
        </div>
      </Canvas>
      <CornerMark delay={5.4} />
    </AbsoluteFill>
  );
};
