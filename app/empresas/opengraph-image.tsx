import { ImageResponse } from "next/og";
import { OgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-image";

export const alt = "Para empresas — Patrocina talento digital en el Semillero CooWeb";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return new ImageResponse(
    OgImage({
      eyebrow: "Para empresas · CooWeb",
      title: "Conviertete en Empresa Patrocinadora.",
      subtitle: "Resuelve un reto real e impulsa al proximo talento digital.",
    }),
    { ...OG_SIZE },
  );
}
