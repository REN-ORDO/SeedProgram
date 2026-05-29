"use client";

import { useState } from "react";
import { ChevronDown, ArrowRight, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal } from "@/components/reveal";

/* ── Tokens de color ──────────────────────────────────────────────
   Estos tokens replican la paleta de la referencia visual:
   fondo general muy claro, cards en gris suave, card de contacto
   blanco puro, texto oscuro y acento turquesa SEMILLA.           */
const C = {
  bg:          "#F7F8FA",       // fondo general — gris muy suave
  cardClosed:  "#F2F4F7",       // card FAQ cerrada — gris claro
  cardOpen:    "#FFFFFF",       // card FAQ abierta — blanco
  cardContact: "#FFFFFF",       // tarjeta contacto — blanco puro
  border:      "#E4E8EE",       // borde sutil
  borderOpen:  "rgba(45,212,191,0.38)", // borde teal al abrir
  textPrimary: "#0D1B2A",       // texto principal — azul oscuro casi negro
  textSecondary:"#64748B",      // texto secundario — slate
  textMuted:   "#94A3B8",       // texto muted
  teal:        "#2DD4BF",       // acento turquesa SEMILLA
  tealDark:    "#0D9488",       // turquesa para badge/label
  shadow:      "0 2px 8px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
  shadowContact:"0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)",
};

const faqs = [
  {
    id: 1,
    q: "¿Tiene algún costo participar?",
    a: "Ninguno. El Programa SEMILLA no tiene costo de inscripción. Además, desde el primer día recibes compensación económica, mentoría senior y acompañamiento continuo.",
  },
  {
    id: 2,
    q: "¿Necesito experiencia previa?",
    a: "No. Seleccionamos por motivación y actitud, no por credenciales académicas. Si tienes ganas genuinas de aprender y construir, cumples el requisito más importante.",
  },
  {
    id: 3,
    q: "¿Es remoto o presencial?",
    a: "El programa opera desde Barranquilla, Colombia. Combinamos sesiones presenciales con actividades virtuales según la etapa del proceso.",
  },
  {
    id: 4,
    q: "¿Cuántas horas debo dedicar?",
    a: "El programa base dura 4 semanas con dedicación de tiempo completo. Después, el compromiso se ajusta al nivel y las responsabilidades que vayas asumiendo.",
  },
  {
    id: 5,
    q: "¿Qué pasa después de las 4 semanas?",
    a: "El proceso continúa con evaluaciones cada 3 meses: puedes ascender de nivel, recibir un ciclo de refuerzo, o cerrar el proceso si no hay alineación con el equipo.",
  },
  {
    id: 6,
    q: "¿Quién puede aplicar?",
    a: "Jóvenes entre 17 y 25 años con interés genuino en tecnología. No necesitas título universitario ni experiencia formal. Buscamos talento donde otros no miran.",
  },
  {
    id: 7,
    q: "¿Recibo certificado?",
    a: "Sí. Al completar cada fase recibes reconocimiento formal de tu nivel. El Batch 8 ya integró certificación oficial vinculada a proyectos reales del ecosistema CooWeb.",
  },
  {
    id: 8,
    q: "¿Hay posibilidad de vinculación laboral?",
    a: "Sí. Quienes demuestran compromiso y crecimiento técnico tienen posibilidades concretas de vinculación al equipo CooWeb o a sus proyectos activos.",
  },
];

function AccordionCard({
  faq,
  open,
  onToggle,
}: {
  faq: (typeof faqs)[0];
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      onClick={onToggle}
      role="button"
      aria-expanded={open}
      style={{
        borderRadius: 16,
        border: `1px solid ${open ? C.borderOpen : C.border}`,
        background: open ? C.cardOpen : C.cardClosed,
        cursor: "pointer",
        transition: "border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease",
        boxShadow: open ? C.shadow : "none",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
          padding: "12px 14px",
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            lineHeight: 1.45,
            color: C.textPrimary,
            transition: "color 0.2s",
          }}
        >
          {faq.q}
        </span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.22, ease: "easeInOut" }}
          style={{ flexShrink: 0, marginTop: 2 }}
        >
          <ChevronDown size={14} style={{ color: C.teal }} />
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
            <p
              style={{
                padding: "0 14px 12px",
                fontSize: 13,
                lineHeight: 1.65,
                color: C.textSecondary,
              }}
            >
              {faq.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQ() {
  const [openId, setOpenId] = useState<number | null>(null);
  const toggle = (id: number) =>
    setOpenId((prev) => (prev === id ? null : id));

  return (
    <section
      aria-label="Preguntas frecuentes"
      style={{
        position: "relative",
        overflow: "hidden",
        background: C.bg,
        borderTop: `1px solid ${C.border}`,
      }}
      className="py-16 md:py-20"
    >
      {/* Decorative leaves — muy sutiles sobre fondo claro */}
      <motion.div
        aria-hidden
        style={{
          position: "absolute", top: 32, left: -20,
          width: 80, height: 80, opacity: 0.06, pointerEvents: "none",
        }}
        animate={{ y: [-8, 8, -8], rotate: [-5, 5, -5] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg viewBox="0 0 64 64" width="100%" height="100%" style={{ transform: "rotate(-22deg)" }}>
          <path d="M8 56 C 8 28, 28 8, 56 8 C 56 36, 36 56, 8 56 Z" fill={C.teal} />
        </svg>
      </motion.div>
      <motion.div
        aria-hidden
        style={{
          position: "absolute", bottom: 40, right: -16,
          width: 68, height: 68, opacity: 0.05, pointerEvents: "none", filter: "blur(1.5px)",
        }}
        animate={{ y: [6, -6, 6], rotate: [7, -7, 7] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      >
        <svg viewBox="0 0 64 64" width="100%" height="100%" style={{ transform: "rotate(38deg)" }}>
          <path d="M32 6 C 50 14, 56 32, 42 52 C 30 60, 14 56, 10 38 C 8 22, 18 10, 32 6 Z" fill="#38BDF8" />
        </svg>
      </motion.div>

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="flex flex-col gap-12 md:flex-row md:items-start md:gap-10 lg:gap-14">

          {/* ── Col 1: Título ───────────────────────────────────── */}
          <Reveal className="shrink-0 md:w-56 lg:w-64">
            <p
              style={{
                fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
                textTransform: "uppercase", color: C.tealDark,
                marginBottom: 20, opacity: 0.8,
              }}
            >
              FAQ
            </p>
            <h2
              className="font-display font-bold leading-tight"
              style={{ fontSize: "clamp(1.9rem, 3vw, 2.6rem)", color: C.textPrimary }}
            >
              Resolvemos
              <br />
              <span
                className="font-handwritten"
                style={{
                  color: C.teal,
                  fontSize: "1.1em",
                  display: "inline-block",
                  transform: "rotate(-2deg)",
                  transformOrigin: "left center",
                }}
              >
                tus dudas
              </span>
            </h2>
            <p
              style={{
                marginTop: 20,
                fontSize: 13,
                lineHeight: 1.7,
                color: C.textMuted,
              }}
            >
              Todo lo que necesitas saber antes de aplicar al Programa SEMILLA.
            </p>
          </Reveal>

          {/* ── Col 2: Acordeón — 2 columnas ────────────────────── */}
          <Reveal delay={0.08} className="min-w-0 flex-1">
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {faqs.map((faq) => (
                <AccordionCard
                  key={faq.id}
                  faq={faq}
                  open={openId === faq.id}
                  onToggle={() => toggle(faq.id)}
                />
              ))}
            </div>
          </Reveal>

          {/* ── Col 3: Tarjeta de contacto — blanco puro ────────── */}
          <Reveal delay={0.16} className="shrink-0 self-start md:w-60 md:self-center lg:w-64">
            <div
              style={{
                borderRadius: 20,
                border: `1px solid ${C.border}`,
                background: C.cardContact,
                padding: "28px 24px",
                boxShadow: C.shadowContact,
              }}
            >
              {/* Ícono */}
              <div
                style={{
                  width: 44, height: 44, borderRadius: "50%",
                  background: `rgba(45,212,191,0.10)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 20,
                }}
              >
                <Mail size={18} style={{ color: C.teal }} />
              </div>

              <h3
                style={{
                  fontSize: 15, fontWeight: 700,
                  color: C.textPrimary, marginBottom: 8, lineHeight: 1.35,
                }}
              >
                ¿No encontraste tu respuesta?
              </h3>

              <p
                style={{
                  fontSize: 13, lineHeight: 1.65,
                  color: C.textSecondary, marginBottom: 24,
                }}
              >
                Nuestro equipo estará encantado de ayudarte.
              </p>

              <a
                href="/postular"
                className="group inline-flex items-center gap-1.5 text-sm font-semibold transition-opacity hover:opacity-70"
                style={{ color: C.teal }}
              >
                Contactar al equipo
                <ArrowRight
                  size={14}
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </a>
            </div>
          </Reveal>

        </div>
      </div>
    </section>
  );
}
