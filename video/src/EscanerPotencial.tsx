import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { PaperBackground } from "./components/PaperBackground";
import { Canvas } from "./components/Canvas";
import { Polaroid } from "./components/Polaroid";
import { Tape } from "./components/Tape";
import { Blob } from "./components/OrganicBlobs";
import { BrushLine } from "./components/BrushLine";
import { TornPaper } from "./components/TornPaper";
import { CornerMark } from "./components/Isotipo";
import { Sparkle } from "./components/Doodles";
import { ChaosNotebook, ClearBoard } from "./components/ChaosBoard";
import { colors, fonts, FPS } from "./tokens";

const s = (sec: number) => Math.round(sec * FPS);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Design canvas is 1080x1350 (feed); 9:16 centres it on the same paper.
const W = 1080;
const H = 1350;
const POLA_W = 620;
const PHOTO_H = POLA_W * 1.12;
const POLA_H = POLA_W * 0.05 + PHOTO_H + POLA_W * 0.16;

export const EscanerPotencial = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = (from: number, damping = 12) => spring({ frame: frame - from, fps, config: { damping } });

  // Beat 1 (0–1.5s): the chaos. Polaroid drops in, label appears.
  const enter = sp(0, 13);
  const labelIn = interpolate(frame, [s(0.4), s(0.8)], [0, 1], clamp);

  // Beat 2 (1.5–3.0s): teal scanner sweeps down in 1.2s, revealing colour + order.
  const scan = interpolate(frame, [s(1.5), s(2.7)], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const scanning = frame >= s(1.5) && frame <= s(2.9);
  const trail = interpolate(frame, [s(1.5), s(1.7), s(2.8), s(3.4)], [0, 1, 1, 0], clamp);

  // Beat 3 (3.0–5.0s): clarity. Stamp pops 0→1.2→1, polaroid bounces.
  const stamp = interpolate(frame, [s(3), s(3.25), s(3.5)], [0, 1.2, 1], { ...clamp, easing: Easing.out(Easing.quad) });
  const bounce = interpolate(frame, [s(3), s(3.15), s(3.35), s(3.55)], [1, 1.05, 0.98, 1], clamp);
  const clear = frame >= s(3);

  // Beat 4 (3.5–4.2s): small torn paper lands on top; polaroid stays the hero. 4.2–6.5s holds still.
  const shift = interpolate(frame, [s(3.5), s(4.1)], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const paper = sp(s(3.5), 12);
  const scriptIn = interpolate(frame, [s(3.7), s(4.0)], [0, 1], clamp);
  const underline = interpolate(frame, [s(3.8), s(4.2)], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const subIn = interpolate(frame, [s(3.9), s(4.2)], [0, 1], clamp);

  const polaTop = (H - POLA_H) / 2 + 30 - (1 - enter) * 900 + shift * 190;
  const polaScale = bounce * (1 - shift * 0.13);

  return (
    <AbsoluteFill>
      <PaperBackground />
      <Canvas width={W} height={H}>
        {/* Subtle organic blocks */}
        <Blob color={colors.mint} size={340} seed={0} opacity={0.5} style={{ left: -90, top: 900 - enter * 60 }} />
        <Blob color={colors.softSky} size={300} seed={1} opacity={0.6} style={{ right: -70, top: 140 + enter * 30 }} />
        <div style={{ position: "absolute", right: 120, top: 1040, opacity: interpolate(frame, [s(3.1), s(3.5)], [0, 1], clamp) }}>
          <Sparkle size={56} />
        </div>

        {/* Polaroid group */}
        <div
          style={{
            position: "absolute",
            left: (W - POLA_W) / 2,
            top: polaTop,
            width: POLA_W,
            height: POLA_H,
            transform: `scale(${polaScale}) rotate(${-3 - (1 - enter) * 9}deg)`,
            transformOrigin: "center top",
          }}
        >
          <div
            style={{
              position: "absolute", top: -70, width: POLA_W, textAlign: "center",
              fontFamily: fonts.sans, fontSize: 30, letterSpacing: 6, opacity: labelIn * (1 - shift),
              color: clear ? colors.teal : colors.navy, fontWeight: clear ? 700 : 400,
            }}
          >
            {clear ? "IDEA CON FORMA" : "IDEA SIN FORMA"}
          </div>

          <Polaroid width={POLA_W} rotate={0}>
            <div style={{ position: "absolute", inset: 0, filter: "grayscale(1) blur(1.6px)" }}>
              <ChaosNotebook />
            </div>
            <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 0 ${(1 - scan) * 100}% 0)` }}>
              <ClearBoard />
            </div>
            {/* Faint mint trail left behind by the scanner */}
            <div
              style={{
                position: "absolute", left: 0, right: 0, top: 0, height: scan * PHOTO_H, opacity: trail,
                background: "linear-gradient(to bottom, rgba(94,234,212,0) 40%, rgba(94,234,212,0.28))",
              }}
            />
            <div style={{ position: "absolute", left: 14, top: 10, fontFamily: fonts.sans, fontSize: 18, color: "#64748B" }}>foto real · placeholder</div>
          </Polaroid>
          <Tape color="cream" width={190} rotate={-4} style={{ left: (POLA_W - 190) / 2, top: -26 }} />

          {/* Scanner line: extends past the frame, glows softly */}
          {scanning && (
            <div
              style={{
                position: "absolute", left: -40, width: POLA_W + 80, height: 5, borderRadius: 3,
                top: POLA_W * 0.05 + scan * PHOTO_H - 2, background: colors.teal,
                boxShadow: `0 0 14px 4px rgba(20,184,166,0.55), 0 0 36px 10px rgba(94,234,212,0.35)`,
              }}
            />
          )}

          {/* Stamp */}
          <div
            style={{
              position: "absolute", right: -46, bottom: 58, transform: `rotate(-7deg) scale(${stamp})`,
              background: colors.navy, color: colors.white, fontFamily: fonts.sans, fontWeight: 700, fontSize: 30,
              letterSpacing: 2, padding: "16px 26px", borderRadius: 10, boxShadow: "6px 7px 0 rgba(20,184,166,0.9)",
              whiteSpace: "nowrap",
            }}
          >
            ✓ TALENTO EXTRAÍDO
          </div>
        </div>

        {/* Torn paper headline: small, top, taped-by-hand tilt */}
        <TornPaper
          padding="44px 40px"
          shadow="drop-shadow(10px 10px 0 #0F172A)"
          style={{ left: (W - W * 0.78) / 2, width: W * 0.78, top: H * 0.08 - (1 - paper) * 500, opacity: frame < s(3.5) ? 0 : 1, transform: `rotate(-1.5deg)` }}
        >
          <div style={{ textAlign: "center", color: colors.navy }}>
            <div style={{ fontFamily: fonts.sans, fontWeight: 900, fontSize: 96, lineHeight: 0.95, letterSpacing: -2 }}>POTENCIAL</div>
            <div style={{ position: "relative", display: "inline-block", marginTop: 2 }}>
              <div style={{ fontFamily: fonts.script, fontWeight: 700, fontSize: 84, color: colors.teal, lineHeight: 1, whiteSpace: "nowrap", opacity: scriptIn, transform: `translateY(${(1 - scriptIn) * 12}px) rotate(-3deg)` }}>
                VISIBLE
              </div>
              <BrushLine viewBox="0 0 600 40" d="M10 25 C 150 8, 400 10, 590 22" progress={underline} width={6} style={{ left: "-4%", width: "108%", bottom: -10, height: 30 }} />
            </div>
            <div style={{ fontFamily: fonts.sans, fontSize: 26, lineHeight: 1.3, marginTop: 22, opacity: subIn }}>
              No es falta de talento, <b>es falta de oportunidades.</b>
            </div>
          </div>
        </TornPaper>
      </Canvas>
      <CornerMark delay={4.2} />
    </AbsoluteFill>
  );
};
