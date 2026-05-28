"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Monogram } from "@/components/monogram";

const LEAVES = [
  { x: 30, y: 30, color: "#5EEAD4", delay: 0.6, rotate: -25 },
  { x: 70, y: 28, color: "#38BDF8", delay: 0.8, rotate: 18 },
  { x: 20, y: 60, color: "#BAE6FD", delay: 1.0, rotate: -12 },
  { x: 80, y: 62, color: "#2DD4BF", delay: 1.2, rotate: 22 },
  { x: 50, y: 18, color: "#7DD3FC", delay: 1.4, rotate: 0 },
];

export function LoadingScreen() {
  const [hidden, setHidden] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) {
      setHidden(true);
      return;
    }
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => {
      setHidden(true);
      document.body.style.overflow = "";
    }, 2400);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = "";
    };
  }, [reduce]);

  return (
    <AnimatePresence>
      {!hidden && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center"
          style={{ background: "var(--color-bg)" }}
          aria-hidden
        >
          <div className="relative h-[320px] w-[320px]">
            {/* Center seed */}
            <motion.svg
              viewBox="0 0 64 64"
              className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2"
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <path
                d="M32 6 C 50 14, 56 32, 42 52 C 30 60, 14 56, 10 38 C 8 22, 18 10, 32 6 Z"
                fill="#14B8A6"
                stroke="#0F172A"
                strokeWidth={3}
              />
              <path
                d="M30 18 C 26 26, 26 36, 32 46"
                fill="none"
                stroke="#0F172A"
                strokeWidth={2.5}
                strokeLinecap="round"
              />
            </motion.svg>

            {/* Orbiting leaves */}
            {LEAVES.map((l, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  duration: 0.5,
                  delay: l.delay,
                  ease: [0.34, 1.56, 0.64, 1],
                }}
                style={{
                  position: "absolute",
                  left: `${l.x}%`,
                  top: `${l.y}%`,
                  transform: `translate(-50%, -50%) rotate(${l.rotate}deg)`,
                }}
              >
                <svg viewBox="0 0 64 64" className="h-12 w-12">
                  <path
                    d="M8 56 C 8 28, 28 8, 56 8 C 56 36, 36 56, 8 56 Z"
                    fill={l.color}
                    stroke="#0F172A"
                    strokeWidth={3}
                  />
                </svg>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex items-center gap-3"
          >
            <Monogram size={48} />
            <div className="flex flex-col leading-none">
              <span className="font-display text-2xl font-bold text-[--color-ink]">
                CooWeb
              </span>
              <span className="mt-1 text-[10px] uppercase tracking-[0.3em] text-[--color-fg-subtle]">
                Programa Semilla
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 flex gap-2"
          >
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="h-2.5 w-2.5 rounded-full border-2 border-[--color-ink]"
                style={{ background: "var(--color-accent)" }}
                animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.18,
                  ease: "easeInOut",
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
