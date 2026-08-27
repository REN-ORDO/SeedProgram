"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Nav } from "@/components/nav";
import { empresaHero, empresaProblema } from "@/lib/data";

const PIPELINE_STAGES = ["Reto empresarial", "Diagnóstico", "Célula desarrollo", "Solución medible"];

export function EmpresasHero() {
  const reduce = useReducedMotion();
  const [before, after] = empresaHero.title.split(empresaHero.highlight);
  return (
    <section
      id="inicio"
      aria-label="Empresas patrocinadoras"
      className="empresas-hero relative overflow-hidden px-4 pb-16 pt-16 md:px-10 md:pb-24 md:pt-24"
    >
      <div className="empresas-window relative mx-auto max-w-7xl">
        <Nav variant="empresas" />
        <div className="empresas-window__body relative grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="max-w-2xl">
            <motion.p
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="empresas-eyebrow"
            >
              {empresaHero.eyebrow}
            </motion.p>
            <motion.h1
              initial={reduce ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="mt-6 text-balance font-display text-4xl font-bold leading-[1.04] tracking-tight sm:text-5xl md:text-7xl"
            >
              {before}
              <span className="text-[var(--empresas-accent)]">{empresaHero.highlight}</span>
              {after}
            </motion.h1>
            <motion.p
              initial={reduce ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
              className="mt-7 max-w-xl text-lg leading-relaxed text-[var(--empresas-muted)] md:text-xl"
            >
              {empresaHero.subtitle}
            </motion.p>
            <div className="mt-10 flex flex-wrap gap-4">
              <a href="/postular?rol=empresa" data-cursor="Diagnóstico" className="empresas-button empresas-button--primary">
                {empresaHero.ctaPrimary}
                <ArrowRight size={16} />
              </a>
              <a href="#modelo" data-cursor="Ver" className="empresas-button empresas-button--secondary">
                {empresaHero.ctaSecondary}
                <span aria-hidden>↓</span>
              </a>
            </div>
          </div>
          <div className="empresas-pipeline" aria-label="Pipeline de solución">
            {PIPELINE_STAGES.map((stage, index) => (
              <div className="empresas-pipeline__stage" key={stage}>
                <span className="empresas-pipeline__number">0{index + 1}</span>
                <span>{stage}</span>
                <ArrowRight aria-hidden size={16} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <motion.p
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.24 }}
        className="empresas-hero__remate mx-auto mt-12 max-w-2xl text-center font-display text-xl font-semibold leading-snug text-[var(--empresas-accent)] md:mt-16 md:text-2xl"
      >
        {empresaProblema.title}
      </motion.p>
    </section>
  );
}