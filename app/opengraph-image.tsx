import { ImageResponse } from "next/og";
import { OgImage, loadOgFonts, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-image";

export const alt = "Programa Semilla · CooWeb — Tecnología, liderazgo y propósito social";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  const fonts = await loadOgFonts();
  return new ImageResponse(
    OgImage({
      title: "Aquí no solo creces profesionalmente,",
      accent: "creces como persona.",
      subtitle: "Encontramos talento donde otros no miran.",
      cta: "Postúlate al Batch 10 →",
    }),
    { ...OG_SIZE, ...(fonts.length ? { fonts } : {}) },
  );
}
