import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { PaperBackground } from "./components/PaperBackground";
import { Canvas } from "./components/Canvas";
import { Polaroid } from "./components/Polaroid";
import { Tape } from "./components/Tape";
import { Blob } from "./components/OrganicBlobs";
import { BrushLine } from "./components/BrushLine";
import { TornPaper } from "./components/TornPaper";
import { Arrow, Sparkle } from "./components/Doodles";
import { CornerMark } from "./components/Isotipo";
import { colors, fonts, FPS } from "./tokens";

const s = (sec: number) => Math.round(sec * FPS);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const W = 1080;
const H = 1350;
const CARD_W = 580;
const PHOTO_H = CARD_W; // square photo keeps the card compact
const CARD_H = CARD_W * 0.05 + PHOTO_H + CARD_W * 0.16;
const CARD_TOP = 150;

// Placeholder mentor photo (mentor explaining at a table). Swap for a real photo in public/photos/.
const MentorPhoto = () => (
  <svg viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" style={{ display: "block" }}>
    <defs>
      <linearGradient id="room" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={colors.softSky} />
        <stop offset="1" stopColor="#E2E8F0" />
      </linearGradient>
    </defs>
    <rect width="100" height="100" fill="url(#room)" />
    <circle cx="48" cy="34" r="11" fill="#CBD5E1" />
    <path d="M26 72c2-14 11-22 22-22s20 8 22 22z" fill="#94A3B8" />
    <path d="M66 60l12-8" stroke="#94A3B8" strokeWidth="5" strokeLinecap="round" />
    <rect x="0" y="72" width="100" height="28" fill="#E7DCC8" />
    <rect x="18" y="78" width="26" height="16" rx="1" fill="#FFFFFF" transform="rotate(-6 31 86)" />
    <path d="M22 82h16M22 86h12" stroke="#CBD5E1" strokeWidth="1" transform="rotate(-6 31 86)" />
    <rect x="62" y="80" width="22" height="12" rx="1.5" fill={colors.navy} opacity={0.8} />
  </svg>
);

export const FlashcardMentor = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = (from: number, damping = 12) => spring({ frame: frame - from, fps, config: { damping } });

  // Beat 1 (0–1.5s): polaroid + question.
  const enter = sp(0, 13);
  const questionIn = interpolate(frame, [s(0.4), s(0.8)], [0, 1], clamp);

  // Beat 2 (1.5–3.0s): 3D flip in 0.6s + diagonal brush line.
  const flip = interpolate(frame, [s(1.5), s(2.1)], [0, 180], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const lift = Math.sin((flip / 180) * Math.PI) * 0.06;
  const brush = interpolate(frame, [s(1.5), s(2.4)], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });

  // Beat 3 (3.0–5.0s): mentor answer builds on the back.
  const headIn = interpolate(frame, [s(2.2), s(2.5)], [0, 1], clamp);
  const scriptIn = interpolate(frame, [s(3.0), s(3.4)], [0, 1], clamp);
  const underline = interpolate(frame, [s(3.3), s(3.9)], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const subIn = interpolate(frame, [s(3.7), s(4.1)], [0, 1], clamp);
  const doodles = interpolate(frame, [s(3.4), s(3.9)], [0, 1], clamp);

  // Beat 4 (5.0–6.5s): mint depth block behind the card.
  const blob = interpolate(frame, [s(5), s(5.6)], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });

  const cardLeft = (W - CARD_W) / 2;
  const face = { position: "absolute", inset: 0, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" } as const;

  return (
    <AbsoluteFill>
      <PaperBackground />
      <Canvas width={W} height={H}>
        <Blob color={colors.softSky} size={280} seed={2} opacity={0.4} style={{ right: -90, top: 60 }} />
        {/* Mint depth block (20%) behind the polaroid */}
        <Blob color={colors.mint} size={760} seed={0} opacity={0.2 * blob} style={{ left: cardLeft - 120, top: CARD_TOP - 40, transform: `scale(${0.85 + blob * 0.15})` }} />

        {/* Diagonal brush line crossing the frame during the flip */}
        <BrushLine viewBox="0 0 1080 1350" d="M-40 1180 C 640 1180, 1050 1100, 1035 720 S 1035 260, 1120 150" progress={brush} width={12} style={{ left: 0, top: 0, width: W, height: H, opacity: 0.85 }} />

        {/* Flip card */}
        <div
          style={{
            position: "absolute", left: cardLeft, top: CARD_TOP - (1 - enter) * 900, width: CARD_W, height: CARD_H,
            perspective: 1800, transform: `rotate(-2deg) scale(${1 + lift})`,
          }}
        >
          <div style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d", transform: `rotateY(${flip}deg)` }}>
            {/* Front: mentor photo + DUDA REAL tag */}
            <div style={face}>
              <Polaroid width={CARD_W} rotate={0} photoRatio={1}>
                <MentorPhoto />
                <TornPaper padding="12px 22px" style={{ left: 24, top: 22, transform: "rotate(-3deg)" }}>
                  <div style={{ fontFamily: fonts.sans, fontWeight: 700, fontSize: 24, letterSpacing: 3, color: colors.navy }}>DUDA REAL</div>
                </TornPaper>
              </Polaroid>
            </div>

            {/* Back: mentor answer on cream with faint dot grid */}
            <div
              style={{
                ...face, transform: "rotateY(180deg)", background: colors.cream, border: `${CARD_W * 0.05}px solid ${colors.white}`,
                boxSizing: "border-box", boxShadow: "8px 10px 0 rgba(15,23,42,0.12), 0 2px 10px rgba(15,23,42,0.1)",
                backgroundImage: "radial-gradient(#E2E8F0 2px, transparent 2px)", backgroundSize: "26px 26px",
                display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", color: colors.navy,
              }}
            >
              <div style={{ position: "relative", height: 110, width: "100%", opacity: headIn }}>
                <TornPaper padding="14px 26px" style={{ left: 30, top: 26, transform: "rotate(-2deg)" }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 12, whiteSpace: "nowrap" }}>
                    <span style={{ fontFamily: fonts.sans, fontWeight: 700, fontSize: 22, letterSpacing: 3 }}>RESPUESTA MENTOR</span>
                    <span style={{ fontFamily: fonts.script, fontWeight: 700, fontSize: 34, color: colors.teal }}>· Ana, CooWeb</span>
                  </div>
                </TornPaper>
              </div>
              <div style={{ fontFamily: fonts.sans, fontWeight: 900, fontSize: 64, lineHeight: 1, letterSpacing: -1.5, marginTop: 60, opacity: headIn }}>
                Equivocarse
                <br />
                es data.
              </div>
              <div style={{ position: "relative", display: "inline-block", marginTop: 18, opacity: scriptIn }}>
                <div style={{ fontFamily: fonts.script, fontWeight: 700, fontSize: 80, color: colors.teal, lineHeight: 1, transform: `rotate(-3deg) translateY(${(1 - scriptIn) * 12}px)` }}>70% basta</div>
                <BrushLine viewBox="0 0 600 40" d="M10 25 C 150 8, 400 10, 590 22" progress={underline} width={8} style={{ left: "-4%", width: "108%", bottom: -12, height: 30 }} />
              </div>
              <div style={{ fontFamily: fonts.sans, fontSize: 27, lineHeight: 1.35, marginTop: 40, opacity: subIn }}>
                Si te equivocas, iteras.
                <br />
                <b>Si no decides, no aprendes.</b>
              </div>
            </div>
          </div>
        </div>
        <Tape color="cream" width={180} rotate={3} style={{ left: (W - 180) / 2, top: CARD_TOP - 26 - (1 - enter) * 900 }} />

        {/* Minimal doodles, away from the face */}
        <div style={{ position: "absolute", right: 110, top: 240, opacity: doodles, transform: `scale(${0.6 + doodles * 0.4})` }}>
          <Sparkle size={56} />
        </div>
        <div style={{ position: "absolute", left: 60, top: 700, opacity: doodles, transform: "rotate(-20deg)" }}>
          <Arrow size={110} />
        </div>

        {/* The question */}
        <div
          style={{
            position: "absolute", top: CARD_TOP + CARD_H + 60, left: 100, width: W - 200, textAlign: "center",
            fontFamily: fonts.sans, fontWeight: 700, fontSize: 54, lineHeight: 1.12, color: colors.navy,
            opacity: questionIn, transform: `translateY(${(1 - questionIn) * 16}px)`,
          }}
        >
          ¿Y si me equivoco al decidir?
        </div>
      </Canvas>
      <CornerMark delay={5.2} />
    </AbsoluteFill>
  );
};
