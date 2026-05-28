"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

type Variant = "default" | "hover";

export function PlantCursor() {
  const [enabled, setEnabled] = useState(false);
  const [variant, setVariant] = useState<Variant>("default");
  const [isClicking, setIsClicking] = useState(false);
  const [rippleKey, setRippleKey] = useState(0);

  const dotX = useMotionValue(-200);
  const dotY = useMotionValue(-200);

  const plantX = useSpring(dotX, { stiffness: 160, damping: 20, mass: 0.8 });
  const plantY = useSpring(dotY, { stiffness: 160, damping: 20, mass: 0.8 });

  const rafRef = useRef<number | null>(null);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    setEnabled(true);
    document.documentElement.classList.add("cursor-none");

    let lx = 0, ly = 0;

    const onMove = (e: MouseEvent) => {
      lx = e.clientX;
      ly = e.clientY;
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        dotX.set(lx);
        dotY.set(ly);
        rafRef.current = null;
      });
    };

    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      setVariant(
        t.closest('a, button, [role="button"], input, select, textarea, label, summary, [data-cursor]')
          ? "hover"
          : "default"
      );
    };

    const onDown = () => {
      setIsClicking(true);
      setRippleKey((n) => n + 1);
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
      clickTimerRef.current = setTimeout(() => setIsClicking(false), 160);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    window.addEventListener("mousedown", onDown);

    return () => {
      document.documentElement.classList.remove("cursor-none");
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mousedown", onDown);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    };
  }, [dotX, dotY]);

  if (!enabled) return null;

  const plantScale = isClicking ? 0.76 : variant === "hover" ? 1.28 : 1;

  const glowFilter =
    variant === "hover"
      ? "drop-shadow(0 0 8px rgba(45,212,191,0.6)) drop-shadow(0 2px 5px rgba(12,74,110,0.35))"
      : "drop-shadow(0 2px 8px rgba(12,74,110,0.45))";

  return (
    <>
      {/* Plantica — sigue el dot con lag, anclada por la base de la semilla */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed hidden md:block"
        style={{
          zIndex: 9998,
          // left/top bake the offset: center X (-26) y seed-base Y (-40)
          left: -26,
          top: -40,
          x: plantX,
          y: plantY,
        }}
      >
        <motion.img
          src="/img-cursor.png"
          alt=""
          width={52}
          height={52}
          draggable={false}
          animate={{ scale: plantScale }}
          initial={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 430, damping: 22 }}
          style={{
            display: "block",
            filter: glowFilter,
            userSelect: "none",
          }}
        />
      </motion.div>

      {/* Dot — cursor exacto */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed hidden md:block"
        style={{
          zIndex: 9999,
          left: -3,
          top: -3,
          x: dotX,
          y: dotY,
        }}
      >
        {rippleKey > 0 && (
          <motion.div
            key={rippleKey}
            style={{
              position: "absolute",
              width: 22,
              height: 22,
              top: -8,
              left: -8,
              border: "2px solid rgba(45,212,191,0.65)",
              borderRadius: "50%",
            }}
            initial={{ scale: 0.8, opacity: 0.9 }}
            animate={{ scale: 3.2, opacity: 0 }}
            transition={{ duration: 0.44, ease: "easeOut" }}
          />
        )}

        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            backgroundColor: "#2DD4BF",
            border: "1.5px solid #0C4A6E",
            boxShadow: "0 0 6px rgba(45,212,191,0.75)",
          }}
        />
      </motion.div>
    </>
  );
}
