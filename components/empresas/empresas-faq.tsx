"use client";

import { useState } from "react";
import { ChevronDown, ArrowRight, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal } from "@/components/reveal";

const cardBgs = ["#E0F2FE", "#F0F9FF", "#BAE6FD", "#E0F2FE", "#F0F9FF", "#BAE6FD", "#E0F2FE", "#F0F9FF"];

const faqs = [
  {
    id: 1,
    q: "¿Qué recibe mi empresa a cambio?",
    a: "Tu empresa obtiene una solución técnica real (web, automatización, MVP o soporte) ejecutada por una dupla Semilla + mentor Senior. Resuelves un problema interno a una fracción del costo de mercado.",
  },
  {
    id: 2,
    q: "¿Cuánto tiempo dura un proyecto?",
    a: "El ciclo base es de 4 semanas de ejecución. Proyectos más complejos pueden extenderse hasta 3 meses, siempre con un mentor Senior supervisando cada entrega.",
  },
  {
    id: 3,
    q: "¿Qué tipo de problemas técnicos resuelven?",
    a: "Presencia digital (webs y landing pages), automatización de procesos, MVPs y prototipos funcionales, y soporte de mantenimiento en plataformas existentes.",
  },
  {
    id: 4,
    q: "¿Cómo se garantiza la calidad?",
    a: "Cada proyecto lo respalda una dupla: un Semilla en formación y un mentor Senior de CooWeb. El mentor hace code review, valida entregas y es el responsable técnico ante la empresa.",
  },
  {
    id: 5,
    q: "¿Los cupos son limitados?",
    a: "Sí. Por ciclo aceptamos un número reducido de empresas patrocinadoras para garantizar acompañamiento Senior real en cada proyecto. Agenda tu diagnóstico antes de que se cierren los cupos.",
  },
  {
    id: 6,
    q: "¿Podemos contratar a un Semilla después?",
    a: "Sí. Si identificas talento durante el proyecto, puedes iniciar un proceso de vinculación directamente con CooWeb. Muchos de nuestros egresados ya trabajan con empresas que los conocieron como patrocinadores.",
  },
  {
    id: 7,
    q: "¿Qué pasa si el resultado no cumple expectativas?",
    a: "La sesión de diagnóstico inicial alinea el alcance con lo que el equipo puede entregar. Si durante el proyecto hay desvíos, el mentor Senior ajusta el plan. Trabajamos con entregables intermedios para que no haya sorpresas al final.",
  },
  {
    id: 8,
    q: "¿El diagnóstico inicial tiene algún costo?",
    a: "No. La sesión de diagnóstico de 15 minutos es completamente gratuita. Evaluamos tu reto técnico y te presentamos los planes de patrocinio disponibles sin ningún compromiso.",
  },
];

function AccordionCard({
  faq,
  open,
  onToggle,
  index,
}: {
  faq: (typeof faqs)[0];
  open: boolean;
  onToggle: () => void;
  index: number;
}) {
  const rotate = (index % 2 === 0 ? -1 : 1) * 0.6;
  return (
    <div
      onClick={onToggle}
      role="button"
      aria-expanded={open}
      className="toon-card cursor-pointer p-4"
      style={{
        background: cardBgs[index % cardBgs.length],
        transform: `rotate(${rotate}deg)`,
        transition: "transform 0.2s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.45, color: "var(--color-ink)" }}>
          {faq.q}
        </span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.22, ease: "easeInOut" }}
          style={{ flexShrink: 0, marginTop: 2 }}
        >
          <ChevronDown size={14} style={{ color: "var(--color-accent)" }} />
        </motion.div>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.26, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: "hidden" }}
          >
            <p style={{ paddingTop: 10, fontSize: 13, lineHeight: 1.65, color: "var(--color-ink)" }}>
              {faq.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function EmpresasFAQ() {
  const [openId, setOpenId] = useState<number | null>(null);
  const toggle = (id: number) => setOpenId((prev) => (prev === id ? null : id));

  return (
    <section
      aria-label="Preguntas frecuentes para empresas"
      style={{
        position: "relative",
        overflow: "hidden",
        background: "var(--color-bg)",
        borderTop: "1px solid #E4E8EE",
      }}
      className="py-16 md:py-20"
    >
      {/* Hojas decorativas */}
      <motion.div
        aria-hidden
        style={{ position: "absolute", top: 32, left: -20, width: 80, height: 80, opacity: 0.06, pointerEvents: "none" }}
        animate={{ y: [-8, 8, -8], rotate: [-5, 5, -5] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg viewBox="0 0 64 64" width="100%" height="100%" style={{ transform: "rotate(-22deg)" }}>
          <path d="M8 56 C 8 28, 28 8, 56 8 C 56 36, 36 56, 8 56 Z" fill="#0ea5e9" />
        </svg>
      </motion.div>
      <motion.div
        aria-hidden
        style={{ position: "absolute", bottom: 40, right: -16, width: 68, height: 68, opacity: 0.05, pointerEvents: "none", filter: "blur(1.5px)" }}
        animate={{ y: [6, -6, 6], rotate: [7, -7, 7] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      >
        <svg viewBox="0 0 64 64" width="100%" height="100%" style={{ transform: "rotate(38deg)" }}>
          <path d="M32 6 C 50 14, 56 32, 42 52 C 30 60, 14 56, 10 38 C 8 22, 18 10, 32 6 Z" fill="#7dd3fc" />
        </svg>
      </motion.div>

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="flex flex-col gap-12 md:flex-row md:items-start md:gap-10 lg:gap-14">

          {/* Col 1: Título */}
          <Reveal className="shrink-0 md:w-56 lg:w-64">
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-accent-strong)", marginBottom: 20, opacity: 0.8 }}>
              FAQ
            </p>
            <h2 className="font-display font-bold leading-tight" style={{ fontSize: "clamp(1.9rem, 3vw, 2.6rem)", color: "var(--color-ink)" }}>
              Resolvemos
              <br />
              <span
                className="font-handwritten"
                style={{ color: "var(--color-accent-strong)", fontSize: "1.1em", display: "inline-block", transform: "rotate(-2deg)", transformOrigin: "left center" }}
              >
                tus dudas
              </span>
            </h2>
            <p style={{ marginTop: 20, fontSize: 13, lineHeight: 1.7, color: "var(--color-ink)" }}>
              Todo lo que necesitas saber antes de vincular tu empresa al Programa SEMILLA.
            </p>
          </Reveal>

          {/* Col 2: Acordeón */}
          <Reveal delay={0.08} className="min-w-0 flex-1">
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {faqs.map((faq, i) => (
                <AccordionCard
                  key={faq.id}
                  faq={faq}
                  index={i}
                  open={openId === faq.id}
                  onToggle={() => toggle(faq.id)}
                />
              ))}
            </div>
          </Reveal>

          {/* Col 3: Tarjeta de contacto */}
          <Reveal delay={0.16} className="shrink-0 self-start md:w-60 md:self-center lg:w-64">
            <div
              className="toon-card p-6"
              style={{ background: "#BAE6FD", color: "var(--color-ink)", transform: "rotate(1deg)" }}
            >
              <span
                className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-[--color-ink] shadow-[3px_3px_0_var(--color-ink)]"
                style={{ background: "#ffffff" }}
              >
                <Mail size={20} style={{ color: "var(--color-ink)" }} />
              </span>

              <h3 className="font-display font-bold leading-tight" style={{ fontSize: 17, marginTop: 20, marginBottom: 8 }}>
                ¿Tienes más preguntas?
              </h3>

              <p style={{ fontSize: 13, lineHeight: 1.65, color: "rgba(15,23,42,0.75)", marginBottom: 24 }}>
                Agenda un diagnóstico gratuito de 15 minutos con nuestro equipo.
              </p>

              <a
                href="/postular?rol=empresa"
                className="group inline-flex items-center gap-1.5 text-sm font-bold transition-opacity hover:opacity-70"
                style={{ color: "var(--color-ink)" }}
              >
                Solicitar diagnóstico
                <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
              </a>
            </div>
          </Reveal>

        </div>
      </div>
    </section>
  );
}
