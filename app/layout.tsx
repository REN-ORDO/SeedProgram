import type { Metadata, Viewport } from "next";
import { Inter, Fraunces, JetBrains_Mono, Manrope, Plus_Jakarta_Sans, Space_Grotesk, Caveat } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  style: ["normal", "italic"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "700", "800"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "700", "800"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://semillero.cooweb.co/";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Programa Semilla CooWeb · Tecnología, liderazgo y propósito",
    template: "%s · Programa Semilla CooWeb",
  },
  description:
    "Encontramos talento donde otros no miran. Programa de formación en tecnología, liderazgo y propósito social con mentoría senior 1:1.",
  applicationName: "Programa Semilla",
  keywords: [
    "Programa Semilla",
    "CooWeb",
    "Barranquilla",
    "Desarrollo de software",
    "Mentoría",
    "Liderazgo",
    "Tecnología",
    "Talento joven",
    "Bootcamp",
  ],
  authors: [{ name: "CooWeb" }],
  creator: "CooWeb",
  publisher: "CooWeb",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Programa Semilla CooWeb · Tecnología, liderazgo y propósito",
    description:
      "Encontramos talento donde otros no miran: jóvenes que crecen como desarrolladores con mentoría senior 1:1, liderazgo y propósito social.",
    url: SITE_URL,
    siteName: "Programa Semilla · CooWeb",
    locale: "es_CO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Programa Semilla CooWeb · Tecnología, liderazgo y propósito",
    description:
      "Encontramos talento donde otros no miran: jóvenes que crecen como desarrolladores con mentoría senior 1:1, liderazgo y propósito social.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#0c4a6e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${fraunces.variable} ${jetbrains.variable} ${manrope.variable} ${jakarta.variable} ${spaceGrotesk.variable} ${caveat.variable} theme-toon`}
      suppressHydrationWarning
    >
      <head>
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=satoshi@700,900&f[]=cabinet-grotesk@800,900&display=swap"
        />
      </head>
      <body className="grain">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
