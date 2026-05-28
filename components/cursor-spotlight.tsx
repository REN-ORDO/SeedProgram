"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

type Variant = "default" | "interactive" | "text";

export function CursorSpotlight() {
  const [enabled, setEnabled] = useState(false);
  const [variant, setVariant] = useState<Variant>("default");
  const [label, setLabel] = useState<string | null>(null);

  const dotX = useMotionValue(-100);
  const dotY = useMotionValue(-100);
  const ringX = useSpring(dotX, { stiffness: 380, damping: 28, mass: 0.6 });
  const ringY = useSpring(dotY, { stiffness: 380, damping: 28, mass: 0.6 });
  const spotX = useSpring(dotX, { stiffness: 120, damping: 18, mass: 1 });
  const spotY = useSpring(dotY, { stiffness: 120, damping: 18, mass: 1 });

  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const isCoarse = window.matchMedia("(pointer: coarse)").matches;
    if (isCoarse) return;
    setEnabled(true);

    document.documentElement.classList.add("cursor-none");

    let lastX = 0;
    let lastY = 0;

    const onMove = (e: MouseEvent) => {
      lastX = e.clientX;
      lastY = e.clientY;
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        dotX.set(lastX);
        dotY.set(lastY);
        rafRef.current = null;
      });
    };

    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const interactive = target.closest('a, button, [role="button"], summary, [data-cursor]');
      if (interactive) {
        const cursorLabel = interactive.getAttribute("data-cursor");
        if (cursorLabel) {
          setVariant("text");
          setLabel(cursorLabel);
        } else {
          setVariant("interactive");
          setLabel(null);
        }
      } else if (target.closest("h1, h2, h3, p, li, summary, code, label, blockquote")) {
        setVariant("text");
        setLabel(null);
      } else {
        setVariant("default");
        setLabel(null);
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });

    return () => {
      document.documentElement.classList.remove("cursor-none");
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [dotX, dotY]);

  if (!enabled) return null;

  const ringSize = variant === "interactive" ? 56 : variant === "text" ? 4 : 36;
  const dotSize = variant === "interactive" ? 0 : variant === "text" ? 24 : 6;

  return (
    <>
      <motion.div aria-hidden className="pointer-events-none fixed inset-0 z-[1] hidden md:block">
        <motion.div
          className="absolute"
          style={{
            x: spotX,
            y: spotY,
            translateX: "-50%",
            translateY: "-50%",
            width: 480,
            height: 480,
            borderRadius: "50%",
            background: "radial-gradient(circle, color-mix(in srgb, var(--color-accent) 14%, transparent), transparent 60%)",
          }}
        />
      </motion.div>

      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[100] hidden md:block"
        style={{ x: ringX, y: ringY, translateX: "-50%", translateY: "-50%" }}
      >
        <motion.div
          animate={{
            width: ringSize,
            height: ringSize,
            borderColor:
              variant === "interactive"
                ? "rgba(20, 184, 166, 1)"
                : "rgba(148, 163, 184, 0.5)",
            backgroundColor:
              variant === "interactive"
                ? "rgba(20, 184, 166, 0.14)"
                : "rgba(20, 184, 166, 0)",
          }}
          transition={{ type: "spring", stiffness: 380, damping: 26 }}
          className="flex items-center justify-center rounded-full border backdrop-blur-[2px]"
        >
          {label && (
            <motion.span
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[--color-bg]"
            >
              {label}
            </motion.span>
          )}
        </motion.div>
      </motion.div>

      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[101] hidden md:block"
        style={{ x: dotX, y: dotY, translateX: "-50%", translateY: "-50%" }}
      >
        <motion.div
          animate={{
            width: dotSize,
            height: dotSize,
            backgroundColor:
              variant === "text"
                ? "rgba(20, 184, 166, 0.22)"
                : "rgba(20, 184, 166, 1)",
          }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="rounded-full"
          style={{ mixBlendMode: variant === "default" ? "difference" : "normal" }}
        />
      </motion.div>
    </>
  );
}
