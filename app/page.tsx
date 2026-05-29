import { Batches } from "@/components/batches";
import { CTA } from "@/components/cta";
import { FAQ } from "@/components/faq";
import { Cultura } from "@/components/cultura";
import { PlantCursor } from "@/components/plant-cursor";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/hero";
import { LoadingScreen } from "@/components/loading-screen";
import { Nav } from "@/components/nav";
import { Niveles } from "@/components/niveles";
import { Pilares } from "@/components/pilares";
import { Plan } from "@/components/plan";
import { TestimonioSection } from "@/components/testimonio";

export default function Home() {
  return (
    <>
      <LoadingScreen />
      <PlantCursor />
      <Nav />
      <main className="relative">
        <Hero />
        <Pilares />
        <Niveles />
        <Plan />
        <TestimonioSection />
        <Cultura />
        <Batches />
        <CTA />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
