import { ImageResponse } from "next/og";
import { OgImage, loadOgFonts, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-image";

export const alt = "Postúlate al Programa Semilla CooWeb";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  const fonts = await loadOgFonts();
  return new ImageResponse(
    OgImage({
      eyebrow: "Postulación · CooWeb",
      title: "Tu próximo paso en tecnología",
      accent: "empieza aquí.",
      subtitle: "Postúlate al próximo batch o apadrina un talento.",
      cta: "Aplica ahora →",
    }),
    { ...OG_SIZE, ...(fonts.length ? { fonts } : {}) },
  );
}
