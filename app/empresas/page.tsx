import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { LoadingScreen } from "@/components/loading-screen";
import { EmpresasHero } from "@/components/empresas/empresas-hero";
import { EmpresasProblema } from "@/components/empresas/empresas-problema";
import { EmpresasModelo } from "@/components/empresas/empresas-modelo";
import { EmpresasAreas } from "@/components/empresas/empresas-areas";
import { EmpresasCelula } from "@/components/empresas/empresas-celula";
import { EmpresasBeneficio } from "@/components/empresas/empresas-beneficio";
import { EmpresasCTA } from "@/components/empresas/empresas-cta";
import { EmpresasFAQ } from "@/components/empresas/empresas-faq";

export default function EmpresasPage() {
  return (
    <div className="theme-empresas">
      <LoadingScreen />
      <Nav />
      <main className="relative">
        <EmpresasHero />
        <EmpresasProblema />
        <EmpresasModelo />
        <EmpresasAreas />
        <EmpresasCelula />
        <EmpresasBeneficio />
        <EmpresasCTA />
        <EmpresasFAQ />
      </main>
      <Footer />
    </div>
  );
}
