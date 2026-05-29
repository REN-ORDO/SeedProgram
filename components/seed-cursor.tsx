"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

type Variant = "default" | "hover";

export function SeedCursor() {
  const [enabled, setEnabled] = useState(false);
  const [variant, setVariant] = useState<Variant>("default");
  const [isClicking, setIsClicking] = useState(false);
  const [rippleKey, setRippleKey] = useState(0);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);
  const x = useSpring(mouseX, { stiffness: 350, damping: 28, mass: 0.5 });
  const y = useSpring(mouseY, { stiffness: 350, damping: 28, mass: 0.5 });

  const rafRef = useRef<number | null>(null);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    setEnabled(true);
    document.documentElement.classList.add("cursor-none");

    let lx = 0,
      ly = 0;

    const onMove = (e: MouseEvent) => {
      lx = e.clientX;
      ly = e.clientY;
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        mouseX.set(lx);
        mouseY.set(ly);
        rafRef.current = null;
      });
    };

    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      setVariant(
        t.closest(
          'a, button, [role="button"], input, select, textarea, label, summary, [data-cursor]'
        )
          ? "hover"
          : "default"
      );
    };

    const onDown = () => {
      setIsClicking(true);
      setRippleKey((n) => n + 1);
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
      clickTimerRef.current = setTimeout(() => setIsClicking(false), 150);
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
  }, [mouseX, mouseY]);

  if (!enabled) return null;

  const seedScale = isClicking ? 0.72 : variant === "hover" ? 1.32 : 1;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[9999] hidden md:block"
      style={{ x, y, translateX: "-50%", translateY: "-50%" }}
    >
      {/* Ripple on click */}
      {rippleKey > 0 && (
        <motion.div
          key={rippleKey}
          className="absolute rounded-full"
          style={{
            width: 28,
            height: 28,
            top: "50%",
            left: "50%",
            marginLeft: -14,
            marginTop: -14,
            border: "2.5px solid rgba(45, 212, 191, 0.65)",
          }}
          initial={{ scale: 0.9, opacity: 0.9 }}
          animate={{ scale: 2.6, opacity: 0 }}
          transition={{ duration: 0.42, ease: "easeOut" }}
        />
      )}

      {/* Seed SVG cursor */}
      <motion.svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        animate={{ scale: seedScale, rotate: -35 }}
        initial={{ scale: 1, rotate: -35 }}
        transition={{ type: "spring", stiffness: 420, damping: 22 }}
        style={{
          filter: "drop-shadow(0 2px 7px rgba(12, 74, 110, 0.55))",
          overflow: "visible",
        }}
      >
        {/* Seed body — ellipse gives the clean almond/seed shape */}
        <ellipse
          cx="14"
          cy="15"
          rx="5.5"
          ry="10"
          fill="#2DD4BF"
          stroke="#0C4A6E"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Sprout leaf — scales from the seed tip on hover */}
        <motion.g
          style={{ transformOrigin: "14px 5px" }}
          animate={{ scale: variant === "hover" ? 1 : 0 }}
          transition={{ type: "spring", stiffness: 460, damping: 22 }}
        >
          <path
            d="M 14 5 C 10 -1 5 0 8 4 C 10 7 13 7 14 5 Z"
            fill="#5EEAD4"
            stroke="#0C4A6E"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </motion.g>
      </motion.svg>
    </motion.div>
  );
}
