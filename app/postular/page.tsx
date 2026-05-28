"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { ApplicationForm } from "@/components/application-form";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function PostularPage() {
  const reduce = useReducedMotion();

  return (
    <main className="relative min-h-dvh px-5 pb-24 pt-28 md:px-8 md:pt-32">
      {/* Decoración 1: blob sky arriba-derecha con floater */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0, scale: 0.6, rotate: -8 }}
        animate={
          reduce
            ? { opacity: 0.9 }
            : {
                opacity: 0.9,
                scale: 1,
                rotate: 0,
                y: [0, -14, 0],
                x: [0, 6, 0],
              }
        }
        transition={
          reduce
            ? { duration: 0.4 }
            : {
                opacity: { duration: 0.6, ease: EASE },
                scale: { duration: 0.6, ease: EASE },
                rotate: { duration: 0.6, ease: EASE },
                y: { duration: 7.2, repeat: Infinity, ease: "easeInOut" },
                x: { duration: 9.4, repeat: Infinity, ease: "easeInOut" },
              }
        }
        className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full border-2 border-[var(--color-ink)] bg-[var(--color-bg-sky)] shadow-[10px_10px_0_var(--color-ink)]"
      />

      {/* Decoración 2: blob teal abajo-izquierda con floater */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0, scale: 0.6, rotate: 12 }}
        animate={
          reduce
            ? { opacity: 0.9 }
            : {
                opacity: 0.9,
                scale: 1,
                y: [0, 12, 0],
                rotate: [0, -4, 4, 0],
              }
        }
        transition={
          reduce
            ? { duration: 0.4 }
            : {
                opacity: { duration: 0.6, ease: EASE, delay: 0.1 },
                scale: { duration: 0.6, ease: EASE, delay: 0.1 },
                y: { duration: 6.4, repeat: Infinity, ease: "easeInOut", delay: 0.8 },
                rotate: { duration: 8.2, repeat: Infinity, ease: "easeInOut" },
              }
        }
        className="pointer-events-none absolute bottom-32 -left-16 h-48 w-48 rounded-[30%_70%_70%_30%/30%_30%_70%_70%] border-2 border-[var(--color-ink)] bg-[var(--color-bg-teal)] shadow-[6px_6px_0_var(--color-ink)]"
      />

      {/* Decoración 3: estrella amarilla rotando */}
      {!reduce && (
        <motion.svg
          aria-hidden
          viewBox="0 0 24 24"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1, rotate: 360 }}
          transition={{
            opacity: { duration: 0.5, ease: EASE, delay: 0.4 },
            scale: { type: "spring", stiffness: 200, damping: 12, delay: 0.4 },
            rotate: { duration: 22, repeat: Infinity, ease: "linear" },
          }}
          className="pointer-events-none absolute right-6 top-44 h-10 w-10 md:right-12 md:top-52"
        >
          <path
            d="M12 2 L14.5 9.5 L22 12 L14.5 14.5 L12 22 L9.5 14.5 L2 12 L9.5 9.5 Z"
            fill="#fbbf24"
            stroke="#0f172a"
            strokeWidth={1.6}
            strokeLinejoin="round"
          />
        </motion.svg>
      )}

      <div className="relative mx-auto max-w-2xl">
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="mb-8"
        >
          <Link
            href="/"
            className="group inline-flex items-center gap-2 font-display text-sm font-semibold text-[var(--color-fg-muted)] transition-colors hover:text-[var(--color-ink)]"
          >
            <motion.span
              animate={{ x: [0, -3, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="inline-flex"
            >
              <ArrowLeft size={16} />
            </motion.span>
            Volver al inicio
          </Link>
        </motion.div>

        {/* Header */}
        <header className="mb-10 text-center">
          <motion.span
            initial={{ opacity: 0, y: -10, rotate: -8 }}
            animate={{ opacity: 1, y: 0, rotate: -2 }}
            transition={{ duration: 0.55, ease: EASE, delay: 0.1 }}
            className="inline-flex items-center gap-2 rounded-full border-2 border-[var(--color-ink)] bg-[var(--color-accent-soft)] px-4 py-1.5 font-display text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-ink)] shadow-[3px_3px_0_var(--color-ink)]"
          >
            <motion.span
              className="h-1.5 w-1.5 rounded-full bg-[var(--color-ink)]"
              animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            />
            Postulaciones abiertas
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.2 }}
            className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight text-[var(--color-heading)] sm:text-5xl"
          >
            Únete al{" "}
            <span className="relative inline-block text-[var(--color-ink)]">
              ecosistema
              <motion.span
                aria-hidden
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.6, ease: EASE, delay: 0.6 }}
                className="absolute -bottom-1 left-0 right-0 -z-10 h-3 origin-left bg-[var(--color-bg-sky)]"
                style={{ transform: "skewX(-6deg)" }}
              />
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: EASE, delay: 0.35 }}
            className="mx-auto mt-4 max-w-md text-[15px] text-[var(--color-fg-muted)] sm:text-base"
          >
            Conectamos talento joven con empresas que construyen el futuro con
            inteligencia artificial.
          </motion.p>
        </header>

        <ApplicationForm />
      </div>
    </main>
  );
}
