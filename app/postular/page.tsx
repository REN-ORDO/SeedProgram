import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ApplicationForm } from "@/components/application-form";

export const metadata: Metadata = {
  title: "Postúlate · Programa Semilla CooWeb",
  description:
    "Únete al Programa Semilla. Si eres aspirante, postúlate al próximo batch. Si eres empresa, apadrina un talento y soluciona un reto real con IA.",
};

export default function PostularPage() {
  return (
    <main className="relative min-h-dvh px-5 pb-24 pt-28 md:px-8 md:pt-32">
      {/* Decoraciones de fondo (mismo lenguaje que el home) */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full border-2 border-[var(--color-ink)] bg-[var(--color-bg-sky)] opacity-90 shadow-[10px_10px_0_var(--color-ink)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-32 -left-16 h-48 w-48 rounded-[30%_70%_70%_30%/30%_30%_70%_70%] border-2 border-[var(--color-ink)] bg-[var(--color-bg-teal)] opacity-90 shadow-[6px_6px_0_var(--color-ink)]"
      />

      <div className="relative mx-auto max-w-2xl">
        {/* Back link */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-display text-sm font-semibold text-[var(--color-fg-muted)] transition-colors hover:text-[var(--color-ink)]"
          >
            <ArrowLeft size={16} />
            Volver al inicio
          </Link>
        </div>

        {/* Header */}
        <header className="mb-10 text-center">
          <span
            className="inline-flex items-center gap-2 rounded-full border-2 border-[var(--color-ink)] bg-[var(--color-accent-soft)] px-4 py-1.5 font-display text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-ink)] shadow-[3px_3px_0_var(--color-ink)]"
            style={{ transform: "rotate(-2deg)" }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-ink)]" />
            Postulaciones abiertas
          </span>

          <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight text-[var(--color-heading)] sm:text-5xl">
            Únete al{" "}
            <span className="relative inline-block text-[var(--color-ink)]">
              ecosistema
              <span
                aria-hidden
                className="absolute -bottom-1 left-0 right-0 -z-10 h-3 bg-[var(--color-bg-sky)]"
                style={{ transform: "skewX(-6deg)" }}
              />
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-md text-[15px] text-[var(--color-fg-muted)] sm:text-base">
            Conectamos talento joven con empresas que construyen el futuro con
            inteligencia artificial.
          </p>
        </header>

        <ApplicationForm />
      </div>
    </main>
  );
}
