import type { Metadata } from "next";
import { PlantCursor } from "@/components/plant-cursor";

export const metadata: Metadata = {
  title: "Postúlate · Programa Semilla CooWeb",
  description:
    "Únete al Programa Semilla. Si eres aspirante, postúlate al próximo batch. Si eres empresa, apadrina un talento y soluciona un reto real con IA.",
};

export default function PostularLayout({
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
