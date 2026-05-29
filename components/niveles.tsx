"use client";

import { useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  useSpring,
  AnimatePresence,
  type MotionValue,
} from "framer-motion";
import { niveles } from "@/lib/data";

/* ── Palette ─────────────────────────────────────────────────── */
const STAGE_COLORS = [
  "#5EEAD4", "#2DD4BF", "#14B8A6", "#0D9488",
  "#38BDF8", "#7DD3FC", "#0369A1", "#BAE6FD", "#FBBF24",
];

/* ── Tree SVG constants (viewBox "0 0 280 460") ──────────────── */
const TC = "#6b4c2a";

const TRUNK_PATH =
  "M 140 430 C 138 415 142 395 140 372 C 138 345 143 315 140 280 " +
  "C 137 244 142 208 140 172 C 138 140 140 112 140 82";

const TRUNK_WIDTHS = [0, 2.5, 3.5, 5.5, 7, 9, 11, 12.5, 14];

const ROOTS = [
  { d: "M 140 388 C 120 402 100 410 82 420",  w: 2.8, op: 0.6  },
  { d: "M 140 388 C 160 402 180 410 198 420", w: 2.8, op: 0.6  },
  { d: "M 140 392 C 137 410 135 424 133 438", w: 2.2, op: 0.5  },
  { d: "M 140 385 C 120 392 104 398 88 404",  w: 1.8, op: 0.38 },
  { d: "M 140 385 C 160 392 176 398 192 404", w: 1.8, op: 0.38 },
  { d: "M 140 382 C 108 390 84 396 62 402",   w: 1.3, op: 0.25 },
  { d: "M 140 382 C 172 390 196 396 218 402", w: 1.3, op: 0.25 },
];

const BRANCHES = [
  { idx: 3, sw: 2.5, left: "M 140 318 Q 126 308 114 300", right: "M 140 318 Q 154 308 166 300" },
  { idx: 4, sw: 3.5, left: "M 140 278 Q 120 264 100 256",  right: "M 140 278 Q 160 264 180 256" },
  { idx: 5, sw: 6,   left: "M 140 268 Q 112 252 82 240",   right: "M 140 268 Q 168 252 198 240" },
  { idx: 6, sw: 5.5, left: "M 140 214 Q 106 198 70 184",   right: "M 140 214 Q 174 198 210 184" },
  { idx: 7, sw: 4.5, left: "M 140 168 Q 103 152 64 138",   right: "M 140 168 Q 177 152 216 138" },
  { idx: 8, sw: 3.5, left: "M 140 124 Q 96  108 54  94",   right: "M 140 124 Q 184 108 226 94"  },
  { idx: 6, sw: 2.5, left: "M 70 184 Q 54 170 40 158",     right: "M 210 184 Q 226 170 240 158" },
  { idx: 7, sw: 2,   left: "M 64 138 Q 47 124 34 112",     right: "M 216 138 Q 233 124 246 112" },
];

/* ── Organic leaf shapes (SVG path, origin at base, grows upward) */
const LEAF = {
  A: "M0,0 C-3,-2 -4,-9 0,-14 C4,-9 3,-2 0,0",
  B: "M0,0 C-5,-2 -7,-10 0,-16 C7,-10 5,-2 0,0",
  C: "M0,0 C-2,-1 -5,-9 -1,-15 C4,-10 3,-3 0,0",
  D: "M0,0 C2,-1 5,-9 1,-15 C-4,-10 -3,-3 0,0",
  E: "M0,0 C-2,-3 -2,-12 0,-18 C2,-12 2,-3 0,0",
} as const;
type LS = keyof typeof LEAF;

interface LF { lx: number; ly: number; rot: number; s: number; sh: LS; op?: number; dl?: number }
interface LC { idx: number; cx: number; cy: number; lf: LF[] }

const CLUSTERS: LC[] = [
  // Semilla (1)
  { idx: 1, cx: 140, cy: 358, lf: [
    { lx: 0,  ly: 0, rot: 0,   s: 0.55, sh: "A", op: 0.75 },
    { lx: -7, ly: 2, rot: -55, s: 0.50, sh: "C", op: 0.65, dl: 0.10 },
    { lx: 7,  ly: 2, rot: 55,  s: 0.50, sh: "D", op: 0.65, dl: 0.15 },
  ]},
  // Junior 1 (2)
  { idx: 2, cx: 140, cy: 310, lf: [
    { lx: 0,  ly: -2, rot: 0,   s: 0.80, sh: "A", op: 0.78 },
    { lx: -9, ly: 2,  rot: -40, s: 0.72, sh: "C", op: 0.72 },
    { lx: 9,  ly: 2,  rot: 40,  s: 0.72, sh: "D", op: 0.72 },
    { lx: -4, ly: 6,  rot: -75, s: 0.65, sh: "E", op: 0.65, dl: 0.10 },
    { lx: 4,  ly: 6,  rot: 75,  s: 0.65, sh: "E", op: 0.65, dl: 0.10 },
  ]},
  // Junior 2 (3) L
  { idx: 3, cx: 122, cy: 288, lf: [
    { lx: 0,   ly: 0,  rot: -22, s: 0.90, sh: "B", op: 0.78 },
    { lx: -10, ly: 4,  rot: -65, s: 0.80, sh: "C", op: 0.72 },
    { lx: 7,   ly: -2, rot: 5,   s: 0.85, sh: "A", op: 0.75, dl: 0.06 },
    { lx: -7,  ly: 9,  rot: -90, s: 0.70, sh: "E", op: 0.65, dl: 0.10 },
    { lx: 12,  ly: 7,  rot: 28,  s: 0.75, sh: "D", op: 0.68, dl: 0.12 },
  ]},
  // Junior 2 (3) R
  { idx: 3, cx: 158, cy: 288, lf: [
    { lx: 0,   ly: 0,  rot: 22,  s: 0.90, sh: "B", op: 0.78 },
    { lx: 10,  ly: 4,  rot: 65,  s: 0.80, sh: "D", op: 0.72 },
    { lx: -7,  ly: -2, rot: -5,  s: 0.85, sh: "A", op: 0.75, dl: 0.06 },
    { lx: 7,   ly: 9,  rot: 90,  s: 0.70, sh: "E", op: 0.65, dl: 0.10 },
    { lx: -12, ly: 7,  rot: -28, s: 0.75, sh: "C", op: 0.68, dl: 0.12 },
  ]},
  // Middle 1 (4) branch L
  { idx: 4, cx: 100, cy: 256, lf: [
    { lx: 0,   ly: 0,  rot: -30,  s: 1.05, sh: "B", op: 0.78 },
    { lx: -12, ly: 5,  rot: -75,  s: 0.92, sh: "C", op: 0.72 },
    { lx: 9,   ly: 3,  rot: -5,   s: 0.98, sh: "A", op: 0.75 },
    { lx: -7,  ly: 11, rot: -105, s: 0.85, sh: "E", op: 0.65, dl: 0.08 },
    { lx: 14,  ly: 8,  rot: 22,   s: 0.88, sh: "D", op: 0.70, dl: 0.10 },
    { lx: -18, ly: 14, rot: -130, s: 0.78, sh: "B", op: 0.60, dl: 0.14 },
  ]},
  // Middle 1 (4) branch R
  { idx: 4, cx: 180, cy: 256, lf: [
    { lx: 0,   ly: 0,  rot: 30,  s: 1.05, sh: "B", op: 0.78 },
    { lx: 12,  ly: 5,  rot: 75,  s: 0.92, sh: "D", op: 0.72 },
    { lx: -9,  ly: 3,  rot: 5,   s: 0.98, sh: "A", op: 0.75 },
    { lx: 7,   ly: 11, rot: 105, s: 0.85, sh: "E", op: 0.65, dl: 0.08 },
    { lx: -14, ly: 8,  rot: -22, s: 0.88, sh: "C", op: 0.70, dl: 0.10 },
    { lx: 18,  ly: 14, rot: 130, s: 0.78, sh: "B", op: 0.60, dl: 0.14 },
  ]},
  // Middle 1 (4) crown
  { idx: 4, cx: 140, cy: 244, lf: [
    { lx: 0,   ly: -3, rot: 5,   s: 1.15, sh: "B", op: 0.78 },
    { lx: -14, ly: 4,  rot: -32, s: 1.05, sh: "A", op: 0.75 },
    { lx: 14,  ly: 4,  rot: 32,  s: 1.05, sh: "A", op: 0.75 },
    { lx: -7,  ly: -5, rot: -15, s: 0.95, sh: "C", op: 0.70, dl: 0.06 },
    { lx: 7,   ly: -5, rot: 15,  s: 0.95, sh: "D", op: 0.70, dl: 0.06 },
    { lx: 0,   ly: 10, rot: 0,   s: 0.88, sh: "E", op: 0.65, dl: 0.10 },
    { lx: -20, ly: 9,  rot: -52, s: 0.85, sh: "B", op: 0.62, dl: 0.12 },
    { lx: 20,  ly: 9,  rot: 52,  s: 0.85, sh: "B", op: 0.62, dl: 0.12 },
  ]},
  // Middle 2 (5) branch L
  { idx: 5, cx: 82, cy: 240, lf: [
    { lx: 0,   ly: -2, rot: -35,  s: 1.15, sh: "B", op: 0.78 },
    { lx: -14, ly: 4,  rot: -78,  s: 1.00, sh: "C", op: 0.72 },
    { lx: 10,  ly: 2,  rot: -10,  s: 1.08, sh: "A", op: 0.76 },
    { lx: -9,  ly: 11, rot: -108, s: 0.92, sh: "E", op: 0.66, dl: 0.07 },
    { lx: 16,  ly: 8,  rot: 18,   s: 0.95, sh: "D", op: 0.70, dl: 0.09 },
    { lx: -18, ly: 14, rot: -135, s: 0.84, sh: "B", op: 0.60, dl: 0.13 },
    { lx: -5,  ly: 18, rot: -160, s: 0.78, sh: "A", op: 0.55, dl: 0.17 },
  ]},
  // Middle 2 (5) branch R
  { idx: 5, cx: 198, cy: 240, lf: [
    { lx: 0,   ly: -2, rot: 35,  s: 1.15, sh: "B", op: 0.78 },
    { lx: 14,  ly: 4,  rot: 78,  s: 1.00, sh: "D", op: 0.72 },
    { lx: -10, ly: 2,  rot: 10,  s: 1.08, sh: "A", op: 0.76 },
    { lx: 9,   ly: 11, rot: 108, s: 0.92, sh: "E", op: 0.66, dl: 0.07 },
    { lx: -16, ly: 8,  rot: -18, s: 0.95, sh: "C", op: 0.70, dl: 0.09 },
    { lx: 18,  ly: 14, rot: 135, s: 0.84, sh: "B", op: 0.60, dl: 0.13 },
    { lx: 5,   ly: 18, rot: 160, s: 0.78, sh: "A", op: 0.55, dl: 0.17 },
  ]},
  // Middle 2 (5) crown
  { idx: 5, cx: 140, cy: 208, lf: [
    { lx: 0,   ly: -4, rot: 3,   s: 1.30, sh: "B", op: 0.78 },
    { lx: -16, ly: 3,  rot: -28, s: 1.18, sh: "A", op: 0.75 },
    { lx: 16,  ly: 3,  rot: 28,  s: 1.18, sh: "A", op: 0.75 },
    { lx: -9,  ly: -7, rot: -12, s: 1.10, sh: "C", op: 0.70, dl: 0.05 },
    { lx: 9,   ly: -7, rot: 12,  s: 1.10, sh: "D", op: 0.70, dl: 0.05 },
    { lx: 0,   ly: 12, rot: 0,   s: 1.00, sh: "E", op: 0.64, dl: 0.09 },
    { lx: -22, ly: 8,  rot: -48, s: 0.95, sh: "B", op: 0.62, dl: 0.11 },
    { lx: 22,  ly: 8,  rot: 48,  s: 0.95, sh: "B", op: 0.62, dl: 0.11 },
    { lx: -12, ly: 16, rot: -65, s: 0.88, sh: "C", op: 0.58, dl: 0.15 },
    { lx: 12,  ly: 16, rot: 65,  s: 0.88, sh: "D", op: 0.58, dl: 0.15 },
  ]},
  // Senior 1 (6) branch L
  { idx: 6, cx: 68, cy: 185, lf: [
    { lx: 0,   ly: -2, rot: -40,  s: 1.25, sh: "B", op: 0.78 },
    { lx: -16, ly: 4,  rot: -82,  s: 1.10, sh: "C", op: 0.72 },
    { lx: 12,  ly: 2,  rot: -12,  s: 1.18, sh: "A", op: 0.76 },
    { lx: -10, ly: 12, rot: -115, s: 1.02, sh: "E", op: 0.66, dl: 0.06 },
    { lx: 18,  ly: 9,  rot: 15,   s: 1.05, sh: "D", op: 0.70, dl: 0.08 },
    { lx: -22, ly: 16, rot: -142, s: 0.92, sh: "B", op: 0.60, dl: 0.12 },
    { lx: 24,  ly: 16, rot: 44,   s: 0.90, sh: "C", op: 0.60, dl: 0.14 },
    { lx: -8,  ly: 22, rot: -165, s: 0.85, sh: "A", op: 0.55, dl: 0.17 },
  ]},
  // Senior 1 (6) branch R
  { idx: 6, cx: 212, cy: 185, lf: [
    { lx: 0,   ly: -2, rot: 40,  s: 1.25, sh: "B", op: 0.78 },
    { lx: 16,  ly: 4,  rot: 82,  s: 1.10, sh: "D", op: 0.72 },
    { lx: -12, ly: 2,  rot: 12,  s: 1.18, sh: "A", op: 0.76 },
    { lx: 10,  ly: 12, rot: 115, s: 1.02, sh: "E", op: 0.66, dl: 0.06 },
    { lx: -18, ly: 9,  rot: -15, s: 1.05, sh: "C", op: 0.70, dl: 0.08 },
    { lx: 22,  ly: 16, rot: 142, s: 0.92, sh: "B", op: 0.60, dl: 0.12 },
    { lx: -24, ly: 16, rot: -44, s: 0.90, sh: "D", op: 0.60, dl: 0.14 },
    { lx: 8,   ly: 22, rot: 165, s: 0.85, sh: "A", op: 0.55, dl: 0.17 },
  ]},
  // Senior 1 (6) crown
  { idx: 6, cx: 140, cy: 162, lf: [
    { lx: 0,   ly: -5, rot: 2,   s: 1.42, sh: "B", op: 0.78 },
    { lx: -18, ly: 2,  rot: -24, s: 1.28, sh: "A", op: 0.75 },
    { lx: 18,  ly: 2,  rot: 24,  s: 1.28, sh: "A", op: 0.75 },
    { lx: -10, ly: -8, rot: -10, s: 1.20, sh: "C", op: 0.70, dl: 0.04 },
    { lx: 10,  ly: -8, rot: 10,  s: 1.20, sh: "D", op: 0.70, dl: 0.04 },
    { lx: 0,   ly: 13, rot: 0,   s: 1.10, sh: "E", op: 0.64, dl: 0.08 },
    { lx: -25, ly: 7,  rot: -44, s: 1.05, sh: "B", op: 0.62, dl: 0.10 },
    { lx: 25,  ly: 7,  rot: 44,  s: 1.05, sh: "B", op: 0.62, dl: 0.10 },
    { lx: -15, ly: 18, rot: -62, s: 0.95, sh: "C", op: 0.58, dl: 0.14 },
    { lx: 15,  ly: 18, rot: 62,  s: 0.95, sh: "D", op: 0.58, dl: 0.14 },
    { lx: -5,  ly: 24, rot: -5,  s: 0.88, sh: "A", op: 0.52, dl: 0.18 },
    { lx: 5,   ly: 24, rot: 5,   s: 0.88, sh: "A", op: 0.52, dl: 0.18 },
  ]},
  // Senior 2 (7) branch L
  { idx: 7, cx: 62, cy: 138, lf: [
    { lx: 0,   ly: -3, rot: -45,  s: 1.35, sh: "B", op: 0.78 },
    { lx: -18, ly: 5,  rot: -88,  s: 1.20, sh: "C", op: 0.72 },
    { lx: 14,  ly: 2,  rot: -15,  s: 1.28, sh: "A", op: 0.76 },
    { lx: -12, ly: 14, rot: -120, s: 1.12, sh: "E", op: 0.66, dl: 0.05 },
    { lx: 20,  ly: 10, rot: 12,   s: 1.15, sh: "D", op: 0.70, dl: 0.07 },
    { lx: -25, ly: 18, rot: -148, s: 1.00, sh: "B", op: 0.60, dl: 0.11 },
    { lx: 28,  ly: 18, rot: 46,   s: 0.98, sh: "C", op: 0.60, dl: 0.13 },
    { lx: -8,  ly: 26, rot: -168, s: 0.92, sh: "A", op: 0.54, dl: 0.16 },
    { lx: 10,  ly: 26, rot: 162,  s: 0.90, sh: "D", op: 0.52, dl: 0.18 },
  ]},
  // Senior 2 (7) branch R
  { idx: 7, cx: 218, cy: 138, lf: [
    { lx: 0,   ly: -3, rot: 45,   s: 1.35, sh: "B", op: 0.78 },
    { lx: 18,  ly: 5,  rot: 88,   s: 1.20, sh: "D", op: 0.72 },
    { lx: -14, ly: 2,  rot: 15,   s: 1.28, sh: "A", op: 0.76 },
    { lx: 12,  ly: 14, rot: 120,  s: 1.12, sh: "E", op: 0.66, dl: 0.05 },
    { lx: -20, ly: 10, rot: -12,  s: 1.15, sh: "C", op: 0.70, dl: 0.07 },
    { lx: 25,  ly: 18, rot: 148,  s: 1.00, sh: "B", op: 0.60, dl: 0.11 },
    { lx: -28, ly: 18, rot: -46,  s: 0.98, sh: "D", op: 0.60, dl: 0.13 },
    { lx: 8,   ly: 26, rot: 168,  s: 0.92, sh: "A", op: 0.54, dl: 0.16 },
    { lx: -10, ly: 26, rot: -162, s: 0.90, sh: "C", op: 0.52, dl: 0.18 },
  ]},
  // Senior 2 (7) crown
  { idx: 7, cx: 140, cy: 118, lf: [
    { lx: 0,   ly: -6,  rot: 1,   s: 1.55, sh: "B", op: 0.78 },
    { lx: -20, ly: 1,   rot: -20, s: 1.40, sh: "A", op: 0.75 },
    { lx: 20,  ly: 1,   rot: 20,  s: 1.40, sh: "A", op: 0.75 },
    { lx: -12, ly: -10, rot: -8,  s: 1.30, sh: "C", op: 0.70, dl: 0.04 },
    { lx: 12,  ly: -10, rot: 8,   s: 1.30, sh: "D", op: 0.70, dl: 0.04 },
    { lx: 0,   ly: 15,  rot: 0,   s: 1.20, sh: "E", op: 0.64, dl: 0.07 },
    { lx: -28, ly: 5,   rot: -38, s: 1.15, sh: "B", op: 0.62, dl: 0.09 },
    { lx: 28,  ly: 5,   rot: 38,  s: 1.15, sh: "B", op: 0.62, dl: 0.09 },
    { lx: -18, ly: 20,  rot: -58, s: 1.05, sh: "C", op: 0.58, dl: 0.13 },
    { lx: 18,  ly: 20,  rot: 58,  s: 1.05, sh: "D", op: 0.58, dl: 0.13 },
    { lx: -8,  ly: 28,  rot: -8,  s: 0.96, sh: "A", op: 0.52, dl: 0.17 },
    { lx: 8,   ly: 28,  rot: 8,   s: 0.96, sh: "A", op: 0.52, dl: 0.17 },
    { lx: -32, ly: 16,  rot: -55, s: 0.88, sh: "E", op: 0.48, dl: 0.20 },
    { lx: 32,  ly: 16,  rot: 55,  s: 0.88, sh: "E", op: 0.48, dl: 0.20 },
  ]},
  // Director (8) branch L
  { idx: 8, cx: 52, cy: 94, lf: [
    { lx: 0,   ly: -3, rot: -50,  s: 1.45, sh: "B", op: 0.78 },
    { lx: -20, ly: 6,  rot: -95,  s: 1.28, sh: "C", op: 0.72 },
    { lx: 16,  ly: 2,  rot: -18,  s: 1.38, sh: "A", op: 0.76 },
    { lx: -14, ly: 16, rot: -128, s: 1.20, sh: "E", op: 0.66, dl: 0.04 },
    { lx: 22,  ly: 12, rot: 10,   s: 1.25, sh: "D", op: 0.70, dl: 0.06 },
    { lx: -28, ly: 20, rot: -155, s: 1.08, sh: "B", op: 0.60, dl: 0.10 },
    { lx: 30,  ly: 20, rot: 48,   s: 1.05, sh: "C", op: 0.60, dl: 0.12 },
    { lx: -10, ly: 30, rot: -172, s: 0.98, sh: "A", op: 0.52, dl: 0.16 },
    { lx: 12,  ly: 30, rot: 165,  s: 0.95, sh: "D", op: 0.50, dl: 0.18 },
  ]},
  // Director (8) branch R
  { idx: 8, cx: 228, cy: 94, lf: [
    { lx: 0,   ly: -3, rot: 50,   s: 1.45, sh: "B", op: 0.78 },
    { lx: 20,  ly: 6,  rot: 95,   s: 1.28, sh: "D", op: 0.72 },
    { lx: -16, ly: 2,  rot: 18,   s: 1.38, sh: "A", op: 0.76 },
    { lx: 14,  ly: 16, rot: 128,  s: 1.20, sh: "E", op: 0.66, dl: 0.04 },
    { lx: -22, ly: 12, rot: -10,  s: 1.25, sh: "C", op: 0.70, dl: 0.06 },
    { lx: 28,  ly: 20, rot: 155,  s: 1.08, sh: "B", op: 0.60, dl: 0.10 },
    { lx: -30, ly: 20, rot: -48,  s: 1.05, sh: "D", op: 0.60, dl: 0.12 },
    { lx: 10,  ly: 30, rot: 172,  s: 0.98, sh: "A", op: 0.52, dl: 0.16 },
    { lx: -12, ly: 30, rot: -165, s: 0.95, sh: "C", op: 0.50, dl: 0.18 },
  ]},
  // Director (8) crown
  { idx: 8, cx: 140, cy: 70, lf: [
    { lx: 0,   ly: -8,  rot: 0,   s: 1.70, sh: "B", op: 0.78 },
    { lx: -22, ly: 0,   rot: -18, s: 1.52, sh: "A", op: 0.75 },
    { lx: 22,  ly: 0,   rot: 18,  s: 1.52, sh: "A", op: 0.75 },
    { lx: -14, ly: -12, rot: -6,  s: 1.42, sh: "C", op: 0.70, dl: 0.03 },
    { lx: 14,  ly: -12, rot: 6,   s: 1.42, sh: "D", op: 0.70, dl: 0.03 },
    { lx: 0,   ly: 18,  rot: 0,   s: 1.30, sh: "E", op: 0.64, dl: 0.06 },
    { lx: -32, ly: 4,   rot: -34, s: 1.25, sh: "B", op: 0.62, dl: 0.08 },
    { lx: 32,  ly: 4,   rot: 34,  s: 1.25, sh: "B", op: 0.62, dl: 0.08 },
    { lx: -20, ly: 24,  rot: -52, s: 1.15, sh: "C", op: 0.58, dl: 0.12 },
    { lx: 20,  ly: 24,  rot: 52,  s: 1.15, sh: "D", op: 0.58, dl: 0.12 },
    { lx: -10, ly: 32,  rot: -10, s: 1.05, sh: "A", op: 0.52, dl: 0.16 },
    { lx: 10,  ly: 32,  rot: 10,  s: 1.05, sh: "A", op: 0.52, dl: 0.16 },
    { lx: -36, ly: 18,  rot: -50, s: 0.96, sh: "E", op: 0.47, dl: 0.19 },
    { lx: 36,  ly: 18,  rot: 50,  s: 0.96, sh: "E", op: 0.47, dl: 0.19 },
    { lx: 0,   ly: 40,  rot: 3,   s: 0.90, sh: "B", op: 0.42, dl: 0.22 },
  ]},
];

/* ── Tech nodes + edges ──────────────────────────────────────── */
const TECH_NODES = [
  { cx: 140, cy: 268, idx: 5, r: 2.8 },
  { cx: 82,  cy: 240, idx: 5, r: 2.2 },
  { cx: 198, cy: 240, idx: 5, r: 2.2 },
  { cx: 140, cy: 214, idx: 6, r: 2.8 },
  { cx: 70,  cy: 184, idx: 6, r: 2.2 },
  { cx: 210, cy: 184, idx: 6, r: 2.2 },
  { cx: 140, cy: 168, idx: 7, r: 2.8 },
  { cx: 64,  cy: 138, idx: 7, r: 2.2 },
  { cx: 216, cy: 138, idx: 7, r: 2.2 },
  { cx: 140, cy: 124, idx: 8, r: 2.8 },
  { cx: 54,  cy: 94,  idx: 8, r: 2.2 },
  { cx: 226, cy: 94,  idx: 8, r: 2.2 },
  { cx: 140, cy: 82,  idx: 8, r: 3.2 },
] as const;

const TECH_EDGES = [
  { a: 0, b: 1, idx: 5 }, { a: 0, b: 2, idx: 5 },
  { a: 0, b: 3, idx: 6 }, { a: 3, b: 4, idx: 6 }, { a: 3, b: 5, idx: 6 },
  { a: 3, b: 6, idx: 7 }, { a: 6, b: 7, idx: 7 }, { a: 6, b: 8, idx: 7 },
  { a: 6, b: 9, idx: 8 }, { a: 9, b: 10, idx: 8 }, { a: 9, b: 11, idx: 8 },
  { a: 9, b: 12, idx: 8 },
  { a: 1, b: 4,  idx: 6 }, { a: 2, b: 5,  idx: 6 },
  { a: 4, b: 7,  idx: 7 }, { a: 5, b: 8,  idx: 7 },
];

/* ── Fruits ──────────────────────────────────────────────────── */
const FRUITS = [
  { cx: 114, cy: 72, r: 7.5 },
  { cx: 166, cy: 65, r: 6.5 },
  { cx: 140, cy: 50, r: 8.5 },
  { cx: 84,  cy: 82, r: 5.5 },
  { cx: 196, cy: 80, r: 5.5 },
];

const FLOAT_SEEDS = [
  { x: 46,  dy: 140, delay: 0   },
  { x: 216, dy: 150, delay: 1.2 },
  { x: 28,  dy: 155, delay: 2.6 },
];

/* ── TreeSVG ──────────────────────────────────────────────────── */
function TreeSVG({ activeIdx, trunkLength, color }: {
  activeIdx: number;
  trunkLength: MotionValue<number>;
  color: string;
}) {
  const isDirector = activeIdx >= 8;

  return (
    <svg
      viewBox="0 0 280 460"
      className="h-full w-full max-h-[520px]"
      style={{ overflow: "visible" }}
      aria-hidden
    >
      <defs>
        <radialGradient id="nv2-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor={color} stopOpacity="0.20" />
          <stop offset="100%" stopColor={color} stopOpacity="0"    />
        </radialGradient>
        <linearGradient id="nv2-soil" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#7c4f28" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#3d2210" stopOpacity="0.05" />
        </linearGradient>
        <filter id="nv2-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="5" result="b" />
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="nv2-leaf" x="-15%" y="-15%" width="130%" height="130%">
          <feGaussianBlur stdDeviation="0.4" result="b" />
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Ambient halo */}
      <motion.ellipse
        cx={140} cy={230}
        fill="url(#nv2-halo)"
        initial={{ rx: 0, ry: 0 }}
        animate={{ rx: activeIdx >= 3 ? 128 : 0, ry: activeIdx >= 3 ? 168 : 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />

      {/* Ground */}
      <rect x={0} y={372} width={280} height={88} fill="url(#nv2-soil)" rx={4} />
      <line x1={12} y1={372} x2={268} y2={372} stroke="#8B5E3C" strokeWidth={1.5} strokeLinecap="round" opacity={0.4} />

      {/* Roots */}
      {ROOTS.map((r, i) => (
        <motion.path key={i} d={r.d}
          stroke={TC} strokeWidth={r.w} fill="none" strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: r.op }}
          transition={{ duration: 0.9, delay: i * 0.12 }}
        />
      ))}

      {/* Seed — Pre-Semilla only */}
      <motion.g
        animate={{ opacity: activeIdx === 0 ? 1 : 0 }}
        transition={{ duration: 0.4 }}
      >
        <ellipse cx={140} cy={415} rx={10} ry={14} fill={TC} opacity={0.85} />
        <ellipse cx={140} cy={412} rx={5}  ry={7}  fill="#a16207" opacity={0.5} />
        <ellipse cx={137} cy={409} rx={2}  ry={3.5} fill="rgba(255,255,255,0.28)" />
        <motion.ellipse cx={140} cy={415} rx={13} ry={17}
          fill="none" stroke={color} strokeWidth={1}
          animate={{ opacity: [0.6, 0], scale: [1, 1.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
          style={{ transformOrigin: "140px 415px" } as React.CSSProperties}
        />
      </motion.g>

      {/* Trunk */}
      <g filter={isDirector ? "url(#nv2-glow)" : undefined}>
        <motion.path d={TRUNK_PATH}
          stroke={TC} fill="none" strokeLinecap="round"
          style={{ pathLength: trunkLength }}
          animate={{ strokeWidth: activeIdx === 0 ? 0 : TRUNK_WIDTHS[activeIdx] }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
        <motion.path d={TRUNK_PATH}
          stroke="rgba(255,200,100,0.16)" fill="none" strokeLinecap="round"
          style={{ pathLength: trunkLength }}
          animate={{ strokeWidth: activeIdx === 0 ? 0 : Math.max(1.5, TRUNK_WIDTHS[activeIdx] * 0.28) }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </g>

      {/* Branches */}
      {BRANCHES.map((b, bi) =>
        (["left", "right"] as const).map((side, si) => (
          <motion.path key={`b${bi}${side}`}
            d={b[side]} stroke={TC} fill="none" strokeLinecap="round" strokeWidth={b.sw}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: activeIdx >= b.idx ? 1 : 0, opacity: activeIdx >= b.idx ? 1 : 0 }}
            transition={{ duration: 0.65, delay: si * 0.08, ease: "easeOut" }}
          />
        ))
      )}

      {/* Organic leaf clusters */}
      {CLUSTERS.map((cluster, ci) =>
        cluster.lf.map((lf, li) => (
          <g key={`c${ci}l${li}`}
            transform={`translate(${cluster.cx + lf.lx},${cluster.cy + lf.ly}) rotate(${lf.rot})`}
          >
            <motion.path
              d={LEAF[lf.sh]}
              fill={color}
              filter="url(#nv2-leaf)"
              style={{ transformOrigin: "0px 0px" }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale:   activeIdx >= cluster.idx ? lf.s          : 0,
                opacity: activeIdx >= cluster.idx ? (lf.op ?? 0.74) : 0,
              }}
              transition={{ type: "spring", stiffness: 200, damping: 18, delay: lf.dl ?? 0 }}
            />
          </g>
        ))
      )}

      {/* Tech network edges */}
      {TECH_EDGES.map((e, i) => {
        const a = TECH_NODES[e.a];
        const b = TECH_NODES[e.b];
        return (
          <motion.line key={`te${i}`}
            x1={a.cx} y1={a.cy} x2={b.cx} y2={b.cy}
            stroke={color} strokeWidth={0.75}
            initial={{ opacity: 0 }}
            animate={{ opacity: activeIdx >= e.idx ? 0.20 : 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
          />
        );
      })}

      {/* Tech nodes */}
      {TECH_NODES.map((n, i) => (
        <g key={`tn${i}`}>
          <motion.circle cx={n.cx} cy={n.cy}
            fill="none" stroke={color} strokeWidth={1}
            initial={{ r: 0, opacity: 0 }}
            animate={{ r: activeIdx >= n.idx ? n.r + 3 : 0, opacity: activeIdx >= n.idx ? 0.18 : 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          />
          <motion.circle cx={n.cx} cy={n.cy} fill={color}
            initial={{ r: 0, opacity: 0 }}
            animate={{ r: activeIdx >= n.idx ? n.r : 0, opacity: activeIdx >= n.idx ? 0.88 : 0 }}
            transition={{ duration: 0.35, delay: 0.10 }}
          />
        </g>
      ))}

      {/* Fruits — Director */}
      {FRUITS.map((f, i) => (
        <g key={`fr${i}`}>
          <motion.circle cx={f.cx} cy={f.cy}
            fill="#FBBF24" stroke="#78350F" strokeWidth={1.2}
            initial={{ r: 0 }}
            animate={{ r: activeIdx >= 8 ? f.r : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.30 + i * 0.08 }}
          />
          <motion.circle
            cx={f.cx - f.r * 0.30} cy={f.cy - f.r * 0.30}
            fill="rgba(255,255,255,0.38)"
            initial={{ r: 0 }}
            animate={{ r: activeIdx >= 8 ? f.r * 0.28 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.40 + i * 0.08 }}
          />
        </g>
      ))}

      {/* Floating seeds — Director */}
      {FLOAT_SEEDS.map((s, i) => (
        <motion.ellipse key={`fs${i}`} rx={3.5} ry={5.5} fill={color}
          animate={
            activeIdx >= 8
              ? { cx: [s.x, s.x + (i % 2 === 0 ? 14 : -14)], cy: [345, 345 - s.dy], opacity: [0.55, 0] }
              : { cx: s.x, cy: 345, opacity: 0 }
          }
          transition={{ duration: 4 + i * 0.6, repeat: activeIdx >= 8 ? Infinity : 0, delay: s.delay, ease: "easeOut" }}
        />
      ))}
    </svg>
  );
}

/* ── ProgressStem ────────────────────────────────────────────── */
function ProgressStem({ activeIdx, color }: { activeIdx: number; color: string }) {
  const TOTAL = niveles.length;
  const H = 380;

  return (
    <div
      className="absolute right-5 top-1/2 z-20 hidden -translate-y-1/2 md:block"
      style={{ height: "58vh" }}
    >
      <svg
        viewBox={`0 0 28 ${H}`}
        className="h-full w-7"
        preserveAspectRatio="xMidYMid meet"
        style={{ overflow: "visible" }}
      >
        {/* Ghost stem */}
        <line x1={14} y1={8} x2={14} y2={H - 8}
          stroke="rgba(255,255,255,0.08)" strokeWidth={1.5} />

        {/* Active fill */}
        <motion.line x1={14} y1={8} x2={14}
          stroke={color} strokeWidth={1.5} strokeLinecap="round"
          animate={{ y2: 8 + ((activeIdx + 0.5) / TOTAL) * (H - 16) }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />

        {/* Nodes */}
        {niveles.map((_, i) => {
          const y = 8 + (i / (TOTAL - 1)) * (H - 16);
          const active = i <= activeIdx;
          const current = i === activeIdx;
          return (
            <g key={i}>
              {current && (
                <motion.circle cx={14} cy={y} r={8} fill={color} opacity={0.14}
                  animate={{ r: [7, 10, 7] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
              <motion.circle cx={14} cy={y}
                fill={active ? color : "transparent"}
                stroke={active ? color : "rgba(255,255,255,0.18)"}
                strokeWidth={1.2}
                initial={{ r: current ? 4 : 2.8 }}
                animate={{ r: current ? 4 : 2.8 }}
                transition={{ duration: 0.25 }}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ── Ambient particles ───────────────────────────────────────── */
const PARTICLES = [
  { x: 7,  y: 72, dur: 12, delay: 0,   s: 3   },
  { x: 18, y: 65, dur: 15, delay: 2.5, s: 2.5 },
  { x: 12, y: 80, dur: 10, delay: 4.8, s: 4   },
  { x: 28, y: 55, dur: 13, delay: 1.2, s: 2.5 },
  { x: 4,  y: 60, dur: 16, delay: 3.4, s: 2.5 },
];

function AmbientParticles({ color, active }: { color: string; active: boolean }) {
  return (
    <>
      {PARTICLES.map((p, i) => (
        <motion.div key={i}
          className="pointer-events-none absolute rounded-full"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.s, height: p.s, background: color }}
          animate={active
            ? { y: [0, -62, 0], opacity: [0, 0.4, 0], scale: [0.8, 1.4, 0.8] }
            : { opacity: 0 }}
          transition={{ duration: p.dur, repeat: active ? Infinity : 0, delay: p.delay, ease: "easeInOut" }}
        />
      ))}
    </>
  );
}

/* ── LevelCard ───────────────────────────────────────────────── */
function LevelCard({ nivel, idx, color }: {
  nivel: (typeof niveles)[number];
  idx: number;
  color: string;
}) {
  const isDirector = idx === 8;
  const pct = Math.round(((idx + 1) / 9) * 100);

  return (
    <motion.article
      initial={{ opacity: 0, y: 28, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0,  filter: "blur(0px)"  }}
      exit={  { opacity: 0, y: -22, filter: "blur(8px)"  }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-2xl"
      style={{
        background: "rgba(8, 14, 28, 0.76)",
        backdropFilter: "blur(22px) saturate(160%)",
        WebkitBackdropFilter: "blur(22px) saturate(160%)",
        border: `1px solid ${color}28`,
        boxShadow: isDirector
          ? `0 0 0 1px ${color}20, 0 24px 64px rgba(251,191,36,0.10), 0 4px 24px rgba(0,0,0,0.45)`
          : `0 0 0 1px ${color}14, 0 20px 52px rgba(0,0,0,0.38), 0 4px 16px rgba(0,0,0,0.32)`,
      }}
    >
      {/* Top edge gradient */}
      <motion.div
        className="absolute inset-x-0 top-0 h-px"
        animate={{ background: `linear-gradient(90deg, transparent 0%, ${color} 50%, transparent 100%)` }}
        transition={{ duration: 0.4 }}
      />

      {/* Inner ambient glow */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-2xl"
        animate={{ background: `radial-gradient(ellipse at 12% 0%, ${color}14 0%, transparent 58%)` }}
        transition={{ duration: 0.6 }}
      />

      {/* Director shimmer */}
      {isDirector && (
        <motion.div
          className="pointer-events-none absolute inset-0"
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          style={{ background: "linear-gradient(135deg, transparent 25%, rgba(251,191,36,0.06) 50%, transparent 75%)" }}
        />
      )}

      <div className="relative px-6 pb-6 pt-5 md:px-7 md:pt-6 md:pb-7">

        {/* Header: badge + tags */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <motion.div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-mono text-sm font-black text-black"
            animate={{ background: color, boxShadow: `0 0 22px ${color}55` }}
            transition={{ duration: 0.4 }}
          >
            {nivel.num}
          </motion.div>

          <div className="flex flex-col items-end gap-1.5 pt-0.5">
            <motion.span
              className="rounded-full px-2.5 py-[3px] font-mono text-[10px] font-bold uppercase tracking-wider text-black"
              animate={{ background: color }}
              transition={{ duration: 0.4 }}
            >
              {nivel.leadership}
            </motion.span>
            <span className="font-mono text-[9.5px] uppercase tracking-[0.15em] text-white/32">
              {nivel.role}
            </span>
          </div>
        </div>

        {/* Name */}
        <h3 className="font-display text-[1.95rem] font-bold leading-[1.05] tracking-tight text-white">
          {nivel.name}
        </h3>

        {/* Divider */}
        <motion.div
          className="my-4 h-px opacity-20"
          animate={{ background: color }}
          transition={{ duration: 0.4 }}
        />

        {/* Description */}
        <p className="text-[13.5px] leading-relaxed text-white/58">
          {nivel.desc}
        </p>

        {/* Progress */}
        <div className="mt-5 space-y-2">
          <div className="flex justify-between font-mono text-[10px] font-semibold uppercase tracking-widest text-white/28">
            <span>Escalera</span>
            <motion.span animate={{ color }} transition={{ duration: 0.4 }}>
              {pct}%
            </motion.span>
          </div>
          <div className="relative h-[3px] overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full"
              animate={{ width: `${pct}%`, background: color, boxShadow: `0 0 8px ${color}99` }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>
      </div>
    </motion.article>
  );
}

/* ── Niveles ──────────────────────────────────────────────────── */
export function Niveles() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 80, damping: 25 });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setActiveIdx(Math.min(Math.floor(v * 9), 8));
  });

  const trunkLength       = useTransform(smoothProgress, [0, 1], [0.12, 1]);
  const scrollHintOpacity = useTransform(scrollYProgress, [0, 0.07], [1, 0]);

  const color = STAGE_COLORS[activeIdx];

  return (
    <section
      ref={sectionRef}
      id="niveles"
      aria-label="Hoja de ruta"
      style={{ height: "900vh" }}
    >
      <h2 className="sr-only">Hoja de ruta · Una escalera, nueve niveles</h2>

      <div className="sticky top-0 h-screen overflow-hidden">

        {/* ── Background ── */}
        <div className="absolute inset-0 -z-20" style={{ background: "#060d18" }} />

        <motion.div
          className="pointer-events-none absolute inset-0 -z-10"
          animate={{
            background: [
              `radial-gradient(ellipse 60% 80% at 28% 55%, ${color}18 0%, transparent 62%)`,
              `radial-gradient(ellipse 40% 55% at 70% 35%, #0369a118 0%, transparent 58%)`,
              `radial-gradient(ellipse 70% 28% at 50% 100%, #3a1a0516 0%, transparent 55%)`,
            ].join(", "),
          }}
          transition={{ duration: 1.0, ease: "easeInOut" }}
        />

        {/* Ambient particles */}
        <AmbientParticles color={color} active={activeIdx >= 4} />

        {/* ── Section label ── */}
        <div className="absolute left-5 top-5 z-20 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-white/28 md:left-8">
          <span className="font-bold text-white/50">02</span>
          <span className="h-px w-8 bg-white/18" />
          <span>Hoja de ruta</span>
        </div>

        {/* ── Progress stem ── */}
        <ProgressStem activeIdx={activeIdx} color={color} />

        {/* ── Main layout ── */}
        <div className="flex h-full flex-col items-center justify-center gap-6 px-5 py-14 md:flex-row md:gap-10 md:px-14 lg:gap-14 lg:px-20">

          {/* Tree */}
          <div className="flex w-full flex-1 items-center justify-center md:max-w-[300px]">
            <TreeSVG activeIdx={activeIdx} trunkLength={trunkLength} color={color} />
          </div>

          {/* Connector line */}
          <motion.div
            className="hidden shrink-0 self-center md:block"
            style={{ width: 1, height: "30%" }}
            animate={{ background: `linear-gradient(to bottom, transparent, ${color}2e, transparent)` }}
            transition={{ duration: 0.5 }}
          />

          {/* Card */}
          <div className="w-full max-w-sm shrink-0 md:max-w-[370px]">
            <AnimatePresence mode="wait">
              <LevelCard
                key={activeIdx}
                nivel={niveles[activeIdx]}
                idx={activeIdx}
                color={color}
              />
            </AnimatePresence>
          </div>
        </div>

        {/* ── Scroll hint ── */}
        <motion.div
          style={{ opacity: scrollHintOpacity }}
          className="pointer-events-none absolute bottom-7 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-white/28"
        >
          <span className="font-mono text-[10px] uppercase tracking-widest">Scroll</span>
          <motion.div
            className="h-7 w-px origin-top bg-current opacity-40"
            animate={{ scaleY: [0.15, 1, 0.15] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </div>
    </section>
  );
}
