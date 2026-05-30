import { ImageResponse } from "next/og";
import { OgImage, loadOgFonts, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-image";

export const alt = "Para empresas — Patrocina talento digital en el Semillero CooWeb";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  const fonts = await loadOgFonts();
  return new ImageResponse(
    OgImage({
      eyebrow: "Para empresas · CooWeb",
      title: "Resuelve un reto técnico real",
      accent: "e impulsa talento.",
      subtitle: "Conviértete en Empresa Patrocinadora del Semillero CooWeb.",
      cta: "Agenda tu diagnóstico →",
    }),
    { ...OG_SIZE, ...(fonts.length ? { fonts } : {}) },
  );
}
