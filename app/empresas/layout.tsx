import type { Metadata } from "next";
import { PlantCursor } from "@/components/plant-cursor";

export const metadata: Metadata = {
  title: "Para empresas",
  description:
    "Conviértete en Empresa Patrocinadora del Semillero CooWeb: resuelve un reto técnico real de tu negocio mientras impulsas al próximo talento digital. Agenda un diagnóstico sin costo.",
  alternates: { canonical: "/empresas" },
  openGraph: {
    title: "Para empresas · Programa Semilla CooWeb",
    description:
      "Conviértete en Empresa Patrocinadora del Semillero CooWeb: resuelve un reto técnico real de tu negocio mientras impulsas al próximo talento digital.",
    url: "/empresas",
  },
  twitter: {
    title: "Para empresas · Programa Semilla CooWeb",
    description:
      "Conviértete en Empresa Patrocinadora: resuelve un reto técnico real e impulsa al próximo talento digital.",
  },
};

export default function EmpresasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PlantCursor />
      {children}
    </>
  );
}
