import type { ReactElement } from "react";

/**
 * Plantilla compartida de las imágenes Open Graph (next/og), en el estilo
 * "toon / neobrutalism" de la landing: fondo crema, borde negro grueso,
 * sombras duras, blobs orgánicos, pill y acento handwritten.
 * Intenta cargar las fuentes de marca (Space Grotesk + Caveat); si falla,
 * Satori usa la fuente por defecto sin romper el render.
 */

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png";

const INK = "#0f172a";
const CREAM = "#f8fafc";
const TEAL = "#14b8a6";
const TEAL_SOFT = "#5eead4";
const TEAL_STRONG = "#0d9488";
const SKY = "#38bdf8";

type OgFont = {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 500 | 600 | 700;
  style: "normal";
};

const FONT_TEXT =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzÁÉÍÓÚÑáéíóúñ0123456789·→.,!?'’()&%$@ ";

async function loadGoogleFont(family: string, weight: 400 | 500 | 600 | 700) {
  try {
    const url = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}:wght@${weight}&text=${encodeURIComponent(FONT_TEXT)}`;
    const css = await (await fetch(url)).text();
    const src = css.match(/src:\s*url\(([^)]+?)\)\s*format\('(?:truetype|opentype)'\)/);
    if (!src) return null;
    const data = await (await fetch(src[1])).arrayBuffer();
    return { name: family, data, weight, style: "normal" } satisfies OgFont;
  } catch {
    return null;
  }
}

/** Carga las fuentes de marca para la OG. Devuelve [] si no se pudieron cargar. */
export async function loadOgFonts(): Promise<OgFont[]> {
  const fonts = await Promise.all([
    loadGoogleFont("Space Grotesk", 700),
    loadGoogleFont("Caveat", 700),
    loadGoogleFont("Inter", 600),
  ]);
  return fonts.filter((f): f is OgFont => f !== null);
}

export function OgImage({
  title,
  accent,
  subtitle,
  eyebrow = "Programa Semilla · CooWeb",
  cta = "Postúlate →",
}: {
  title: string;
  accent?: string;
  subtitle?: string;
  eyebrow?: string;
  cta?: string;
}): ReactElement {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: CREAM,
        fontFamily: "Inter, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* blob teal arriba-izquierda */}
      <div
        style={{
          position: "absolute",
          top: -56,
          left: -44,
          width: 210,
          height: 180,
          background: TEAL_SOFT,
          border: `6px solid ${INK}`,
          borderRadius: "50%",
          boxShadow: `10px 10px 0 ${INK}`,
          display: "flex",
        }}
      />
      {/* hoja sky abajo-derecha */}
      <div
        style={{
          position: "absolute",
          bottom: -40,
          right: 70,
          width: 230,
          height: 150,
          background: SKY,
          border: `6px solid ${INK}`,
          borderRadius: "50%",
          boxShadow: `10px 10px 0 ${INK}`,
          transform: "rotate(-16deg)",
          display: "flex",
        }}
      />

      {/* eyebrow pill */}
      <div style={{ display: "flex" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "#ffffff",
            border: `3px solid ${INK}`,
            borderRadius: 999,
            padding: "10px 22px",
            boxShadow: `5px 5px 0 ${INK}`,
          }}
        >
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: 8,
              background: TEAL,
              border: `2px solid ${INK}`,
              display: "flex",
            }}
          />
          <div style={{ fontSize: 24, fontWeight: 700, color: INK, display: "flex" }}>
            {eyebrow}
          </div>
        </div>
      </div>

      {/* título + acento + subtítulo */}
      <div style={{ display: "flex", flexDirection: "column", zIndex: 1 }}>
        <div
          style={{
            fontFamily: "Space Grotesk, Inter, sans-serif",
            fontSize: 62,
            fontWeight: 700,
            color: INK,
            lineHeight: 1.04,
            letterSpacing: -1,
            maxWidth: 920,
            display: "flex",
          }}
        >
          {title}
        </div>
        {accent ? (
          <div
            style={{
              fontFamily: "Caveat, cursive",
              fontSize: 92,
              fontWeight: 700,
              color: TEAL_STRONG,
              lineHeight: 0.95,
              marginTop: 2,
              transform: "rotate(-2.5deg)",
              display: "flex",
            }}
          >
            {accent}
          </div>
        ) : null}
        {subtitle ? (
          <div
            style={{
              fontSize: 30,
              color: "#475569",
              marginTop: 22,
              maxWidth: 860,
              display: "flex",
            }}
          >
            {subtitle}
          </div>
        ) : null}
      </div>

      {/* footer: CTA */}
      <div style={{ display: "flex", zIndex: 1 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: TEAL,
            border: `3px solid ${INK}`,
            borderRadius: 999,
            padding: "14px 30px",
            boxShadow: `5px 5px 0 ${INK}`,
            fontSize: 26,
            fontWeight: 700,
            color: INK,
          }}
        >
          {cta}
        </div>
      </div>
    </div>
  );
}
