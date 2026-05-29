import type { Metadata } from "next";
import { PlantCursor } from "@/components/plant-cursor";

export const metadata: Metadata = {
  title: "Para empresas · Programa Semilla CooWeb",
  description:
    "Conviértete en Empresa Patrocinadora del Semillero CooWeb: resuelve un reto técnico real de tu negocio mientras impulsas al próximo talento digital. Agenda un diagnóstico sin costo.",
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
