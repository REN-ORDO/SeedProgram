import type { ReactElement } from "react";

/**
 * Plantilla compartida para las imágenes Open Graph dinámicas (next/og).
 * Cada ruta con `opengraph-image.tsx` la reutiliza con su propio título/subtítulo.
 * Solo estilos inline (ImageResponse no soporta Tailwind). Sin caracteres
 * "¿/¡" en los textos: la fuente por defecto de @vercel/og no los cubre bien.
 */

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png";

export function OgImage({
  title,
  subtitle,
  eyebrow = "Programa Semilla · CooWeb",
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
}): ReactElement {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 76,
        background:
          "linear-gradient(135deg, #0c4a6e 0%, #083449 55%, #06222f 100%)",
        color: "#ffffff",
        fontFamily: "sans-serif",
        position: "relative",
      }}
    >
      {/* hoja decorativa */}
      <div
        style={{
          position: "absolute",
          top: -120,
          right: -90,
          width: 420,
          height: 420,
          display: "flex",
          background: "radial-gradient(circle at 30% 30%, rgba(45,212,191,0.22), transparent 62%)",
        }}
      />

      {/* eyebrow */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: 9,
            background: "#2dd4bf",
            display: "flex",
          }}
        />
        <div
          style={{
            fontSize: 26,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.6)",
            display: "flex",
          }}
        >
          {eyebrow}
        </div>
      </div>

      {/* título + subtítulo */}
      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        <div
          style={{
            fontSize: 76,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: -1.5,
            display: "flex",
            maxWidth: 1000,
          }}
        >
          {title}
        </div>
        {subtitle ? (
          <div
            style={{
              fontSize: 34,
              color: "#5eead4",
              display: "flex",
              maxWidth: 940,
            }}
          >
            {subtitle}
          </div>
        ) : null}
      </div>

      {/* footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 26,
          color: "rgba(255,255,255,0.55)",
        }}
      >
        <div style={{ display: "flex" }}>cooweb.co</div>
        <div style={{ display: "flex" }}>Barranquilla, Colombia</div>
      </div>
    </div>
  );
}
