import { ImageResponse } from "next/og";
import { OgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-image";

export const alt = "Postulate al Programa Semilla CooWeb";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return new ImageResponse(
    OgImage({
      eyebrow: "Postulacion · CooWeb",
      title: "Postulate al Programa Semilla.",
      subtitle: "Tu proximo paso en tecnologia empieza aqui.",
    }),
    { ...OG_SIZE },
  );
}
