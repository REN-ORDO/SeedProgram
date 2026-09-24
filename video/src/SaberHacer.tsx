import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { PaperBackground } from "./components/PaperBackground";
import { Polaroid } from "./components/Polaroid";
import { Tape } from "./components/Tape";
import { Arrow, Bulb, Circle, Circuit, DotGrid, Sparkle } from "./components/Doodles";
import { Blob } from "./components/OrganicBlobs";
import { BrushLine } from "./components/BrushLine";
import { TornPaper } from "./components/TornPaper";
import { colors, fonts, FPS } from "./tokens";

const s = (sec: number) => Math.round(sec * FPS);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Design canvas is 1080x1920; other aspect ratios scale it to fit height.
const W = 1080;
const H = 1920;

export const SaberHacer = () => {
  const frame = useCurrentFrame();
  const { fps, height, width } = useVideoConfig();
  const scale = Math.min(height / H, width / W);
  const sp = (from: number, damping = 12) => spring({ frame: frame - from, fps, config: { damping } });

  // Beat 1 (0–1.5s): polaroids slide in, ≠ pops.
  const leftIn = sp(0, 14);
  const rightIn = sp(s(0.2), 14);
  const neq = sp(s(0.5), 8);

  // Beat 2 (1.5–3.5s): doodles, brush line, dot grid, blobs.
  const beat2 = (d = 0) => interpolate(frame, [s(1.5) + d, s(2.3) + d], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const brush = interpolate(frame, [s(1.6), s(2.8)], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });

  // Beat 3 (3.5–6.5s): photos drop down, torn paper headline falls in.
  const shift = interpolate(frame, [s(3.5), s(4.1)], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const paper = sp(s(3.6), 13);
  const scriptIn = interpolate(frame, [s(4.2), s(4.8)], [0, 1], clamp);
  const underline = interpolate(frame, [s(4.6), s(5.3)], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const subIn = interpolate(frame, [s(5), s(5.5)], [0, 1], clamp);

  const photosY = 640 + shift * 400;
  const photoScale = 1 - shift * 0.14;

  return (
    <AbsoluteFill>
      <PaperBackground />
      <AbsoluteFill style={{ width: W, height: H, left: (width - W * scale) / 2, transform: `scale(${scale})`, transformOrigin: "top left" }}>
        {/* Dot grid, top-right empty corner */}
        <div style={{ position: "absolute", right: 50, top: 70, opacity: beat2() * 0.9 }}>
          <DotGrid />
        </div>

        {/* Organic blobs rising behind the right photo */}
        <Blob color={colors.mint} size={380} seed={0} style={{ right: -60, top: 1330 - beat2() * 180 + shift * 200, opacity: beat2() }} />
        <Blob color={colors.sky} size={300} seed={1} opacity={0.6} style={{ right: 180, top: 1500 - beat2(4) * 160 + shift * 180, opacity: beat2(4) }} />
        <Blob color={colors.softSky} size={220} seed={2} style={{ left: 40, top: 1560 - beat2(8) * 140 + shift * 120, opacity: beat2(8) }} />

        {/* Photos group */}
        <div style={{ position: "absolute", left: 0, top: photosY, width: W, height: 700, transform: `scale(${photoScale})`, transformOrigin: "center top" }}>
          <div style={{ position: "absolute", left: 40 - (1 - leftIn) * 700, top: 0 }}>
            <Polaroid width={400} rotate={-2 - (1 - leftIn) * 8} bw label="Estudio solo" />
            <Tape color="cream" width={160} rotate={-6} style={{ left: 130, top: -30 }} />
          </div>
          <div style={{ position: "absolute", left: 640 + (1 - rightIn) * 700, top: 40 }}>
            <Polaroid width={400} rotate={2 + (1 - rightIn) * 8} label="Colaboramos juntos" />
            <Tape color="teal" width={160} rotate={5} style={{ left: 120, top: -30 }} />
          </div>
          <div
            style={{
              position: "absolute", left: 0, width: W, top: 170, textAlign: "center",
              fontFamily: fonts.sans, fontWeight: 900, fontSize: 220, color: colors.navy, lineHeight: 1,
              transform: `scale(${neq})`, opacity: 1 - shift,
            }}
          >
            ≠
          </div>
          {/* Brush line linking both photos */}
          <BrushLine viewBox="0 0 1080 200" d="M140 40 C 300 190, 700 190, 900 20" progress={brush} style={{ left: 0, top: 560, width: W, height: 200 }} />
        </div>

        {/* Doodles drifting down on the left */}
        <div style={{ position: "absolute", left: 60, top: 470 + beat2() * 60 + shift * 350, opacity: beat2() }}>
          <Arrow />
        </div>
        <div style={{ position: "absolute", left: 30, top: 1380 + beat2(3) * 50 + shift * 120, opacity: beat2(3) }}>
          <Bulb />
        </div>
        <div style={{ position: "absolute", right: 70, top: 520 + beat2(6) * 40 + shift * 350, opacity: beat2(6) }}>
          <Sparkle />
        </div>
        <div style={{ position: "absolute", right: 50, top: 1480 + shift * 120, opacity: beat2(10) }}>
          <Circle />
        </div>

        {/* Torn paper headline */}
        <TornPaper style={{ left: 50, width: 980, top: -900 + paper * 1020, opacity: frame < s(3.5) ? 0 : 1, transform: `rotate(${-1.2 * paper}deg)` }}>
          <div style={{ textAlign: "center", color: colors.navy }}>
            <div style={{ fontFamily: fonts.sans, fontWeight: 900, fontSize: 150, lineHeight: 0.95, letterSpacing: -3 }}>SABER ≠</div>
            <div style={{ position: "relative", display: "inline-block", marginTop: 6 }}>
              <div style={{ fontFamily: fonts.script, fontWeight: 700, fontSize: 150, color: colors.teal, lineHeight: 1, whiteSpace: "nowrap", opacity: scriptIn, transform: `translateY(${(1 - scriptIn) * 20}px) rotate(-3deg)` }}>
                SABER HACER
              </div>
              <BrushLine viewBox="0 0 600 40" d="M10 25 C 150 8, 400 10, 590 22" progress={underline} width={10} style={{ left: "5%", width: "90%", bottom: -18, height: 40 }} />
            </div>
            <div style={{ fontFamily: fonts.sans, fontSize: 40, lineHeight: 1.35, marginTop: 44, opacity: subIn }}>
              La teoría abre la puerta.
              <br />
              <b>La acción te lleva lejos.</b>
            </div>
          </div>
        </TornPaper>

        {/* Endorsement: small, central safe zone */}
        <div style={{ position: "absolute", bottom: 90, width: W, display: "flex", flexDirection: "column", alignItems: "center", gap: 14, opacity: subIn }}>
          <div style={{ fontFamily: fonts.sans, fontWeight: 700, fontSize: 36, color: colors.navy, letterSpacing: 3 }}>Semillero by CooWeb</div>
          <div style={{ fontFamily: fonts.sans, fontSize: 26, color: colors.teal }}>Aprende · Colabora · Crece</div>
          {/* Isotipo PNG has white margins: crop to the blue circle (~860px of 1254px) */}
          <div style={{ width: 72, height: 72, borderRadius: "50%", overflow: "hidden", marginTop: 6, position: "relative" }}>
            <Img src={staticFile("logo-cooweb.png")} style={{ position: "absolute", width: 105, left: -16.5, top: -15 }} />
          </div>
        </div>

        {/* Circuit doodle bottom-left */}
        <div style={{ position: "absolute", left: 60, bottom: 250, opacity: beat2(12) * 0.8 * (1 - shift) }}>
          <Circuit />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
