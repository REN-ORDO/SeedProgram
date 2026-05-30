import { ImageResponse } from "next/og";
import { OgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-image";

export const alt = "Programa Semilla · CooWeb — Tecnología, liderazgo y propósito social";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return new ImageResponse(
    OgImage({
      title: "Encontramos talento donde otros no miran.",
      subtitle: "Tecnología, liderazgo y propósito social.",
    }),
    { ...OG_SIZE },
  );
}
