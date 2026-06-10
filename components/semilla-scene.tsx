"use client";

/**
 * Escena 3D "De semilla a árbol" (modal de la sección Niveles).
 *
 * Timeline (segundos desde el montaje):
 *   0.55–1.50  caída de la semilla
 *   1.50–2.50  rebotes con squash & stretch + polvo
 *   2.50–4.20  la semilla se asienta y se entierra
 *   4.20–15.5  brote → tronco → ramas → copa (crecimiento escalonado)
 *   15.5+      idle: vaivén de viento + partículas
 *
 * El progreso se mapea a los 9 niveles vía STAGE_TIMES → onStage(index).
 * Todo el árbol es procedural y determinista (PRNG con semilla fija) para
 * que cada reproducción sea idéntica.
 */

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { STAGE_TIMES, T_END } from "@/lib/semilla-timeline";
import { playPop } from "@/lib/sound";

export { STAGE_TIMES };

/* ---------------------------------- paleta --------------------------------- */
// Solo familias documentadas: teal, sky/slate, neutros (CLAUDE.md §4).
const COLOR = {
  trunk: "#0c4a6e", // sky-900
  leaf: ["#2dd4bf", "#14b8a6", "#5eead4"], // teal 400/500/300
  leafDeep: "#0d9488", // teal-600
  seed: "#14b8a6",
  ground: "#0f172a", // slate-900
  mound: "#1e293b", // slate-800
  rock: "#1e293b",
  grass: "#0d9488",
  dust: "#e2e8f0", // slate-200
  glow: "#14b8a6",
  particleA: "#5eead4",
  particleB: "#7dd3fc", // sky-300
  outline: "#061521",
  // Dorados de las etapas finales (Senior 2 → Director) — aprobados por líder
  gold: ["#fde68a", "#fbbf24", "#f59e0b"], // amber 200/400/500
  goldGlow: "#fbbf24",
};

// Inicio de la transición dorada (Senior 2) y su duración por hoja.
const T_GOLD = 12.8;
const GOLD_STAGGER = 2.2;
const GOLD_DUR = 1.6;

/** Hash determinista 0..1 a partir de la posición de una hoja. */
function leafHash(x: number, z: number) {
  const s = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453;
  return s - Math.floor(s);
}

/* -------------------------------- utilidades ------------------------------- */

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
const easeOutBack = (x: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};

/** Material toon con 3 escalones de luz (look cel-shading). */
let _gradientMap: THREE.DataTexture | null = null;
function getGradientMap() {
  if (!_gradientMap) {
    _gradientMap = new THREE.DataTexture(
      new Uint8Array([70, 150, 255]),
      3,
      1,
      THREE.RedFormat
    );
    _gradientMap.minFilter = THREE.NearestFilter;
    _gradientMap.magFilter = THREE.NearestFilter;
    _gradientMap.needsUpdate = true;
  }
  return _gradientMap;
}

/* ----------------------------- interacción usuario -------------------------- */

type Interaction = {
  mouseX: number; // -1..1
  mouseY: number; // -1..1
  azOffset: number; // órbita acumulada por drag/swipe
  dragging: boolean;
  lastX: number;
};

type Burst = { x: number; z: number; start: number };

export type SemillaSceneApi = { seek: (t: number) => void };

/* ------------------------------ timeline global ----------------------------- */

const T_FALL_START = 0.55;
const T_IMPACT_1 = 1.5;
const T_SPROUT = 4.2;
const GRAVITY = 16;
const FALL_HEIGHT = 7.2;
const SEED_REST_Y = 0.16;

/** Altura de la semilla en el tiempo: caída + 2 rebotes analíticos. */
function seedHeight(t: number): number {
  if (t < T_FALL_START) return FALL_HEIGHT + SEED_REST_Y;
  const v0 = GRAVITY * Math.sqrt((2 * FALL_HEIGHT) / GRAVITY); // velocidad al impactar
  // Segmento 1: caída libre
  if (t < T_IMPACT_1) {
    const dt = t - T_FALL_START;
    return Math.max(SEED_REST_Y, FALL_HEIGHT + SEED_REST_Y - 0.5 * GRAVITY * dt * dt);
  }
  // Rebote 1
  const v1 = v0 * 0.38;
  const t2 = T_IMPACT_1 + (2 * v1) / GRAVITY;
  if (t < t2) {
    const dt = t - T_IMPACT_1;
    return SEED_REST_Y + v1 * dt - 0.5 * GRAVITY * dt * dt;
  }
  // Rebote 2
  const v2 = v1 * 0.32;
  const t3 = t2 + (2 * v2) / GRAVITY;
  if (t < t3) {
    const dt = t - t2;
    return SEED_REST_Y + v2 * dt - 0.5 * GRAVITY * dt * dt;
  }
  return SEED_REST_Y;
}

const IMPACTS = (() => {
  const v0 = GRAVITY * Math.sqrt((2 * FALL_HEIGHT) / GRAVITY);
  const v1 = v0 * 0.38;
  const i2 = T_IMPACT_1 + (2 * v1) / GRAVITY;
  const v2 = v1 * 0.32;
  const i3 = i2 + (2 * v2) / GRAVITY;
  return [
    { t: T_IMPACT_1, force: 1 },
    { t: i2, force: 0.45 },
    { t: i3, force: 0.18 },
  ];
})();

/** Pulso de squash alrededor de cada impacto (campana corta). */
function squashAmount(t: number): number {
  let s = 0;
  for (const imp of IMPACTS) {
    const d = (t - imp.t) / 0.13;
    if (d > -1 && d < 3) s += imp.force * Math.exp(-d * d) * 0.55;
  }
  return Math.min(0.6, s);
}

/* ----------------------------- árbol procedural ----------------------------- */

type TreeNode = {
  len: number;
  radius: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  birth: number; // segundo en que empieza a crecer
  growDur: number;
  swayPhase: number;
  depth: number;
  children: TreeNode[];
  leaves: { x: number; y: number; z: number; r: number; color: string; birth: number }[];
};

function buildTree(): TreeNode {
  const rnd = mulberry32(20260609);
  const leafColor = () => COLOR.leaf[Math.floor(rnd() * COLOR.leaf.length)];

  function makeLeaves(
    count: number,
    spread: number,
    birth: number,
    rMin = 0.26,
    rMax = 0.56
  ) {
    const leaves: TreeNode["leaves"] = [];
    for (let i = 0; i < count; i++) {
      leaves.push({
        x: (rnd() - 0.5) * spread,
        y: rnd() * spread * 0.8,
        z: (rnd() - 0.5) * spread,
        r: rMin + rnd() * (rMax - rMin),
        color: rnd() < 0.18 ? COLOR.leafDeep : leafColor(),
        birth: birth + rnd() * 0.9,
      });
    }
    return leaves;
  }

  /** Anillo de blobs a 360° — garantiza copa pareja por los costados. */
  function makeCanopy(
    count: number,
    radius: number,
    yBase: number,
    birth: number,
    rMin = 0.3,
    rMax = 0.66
  ) {
    const leaves: TreeNode["leaves"] = [];
    for (let i = 0; i < count; i++) {
      const ang = (i / count) * Math.PI * 2 + (rnd() - 0.5) * 0.5;
      const dist = radius * (0.7 + rnd() * 0.5);
      leaves.push({
        x: Math.cos(ang) * dist,
        y: yBase + (rnd() - 0.3) * 0.8,
        z: Math.sin(ang) * dist,
        r: rMin + rnd() * (rMax - rMin),
        color: rnd() < 0.18 ? COLOR.leafDeep : leafColor(),
        birth: birth + rnd() * 0.9,
      });
    }
    return leaves;
  }

  function branch(depth: number, len: number, radius: number, birth: number): TreeNode {
    const node: TreeNode = {
      len,
      radius,
      rotX: (rnd() - 0.5) * 0.5,
      rotY: rnd() * Math.PI * 2,
      rotZ: 0.55 + rnd() * 0.55, // inclinación respecto al padre
      birth,
      growDur: 1.3,
      swayPhase: rnd() * Math.PI * 2,
      depth,
      children: [],
      leaves: [],
    };
    if (depth < 2) {
      const kids = 2; // siempre 2 — estructura más densa, copa más llena
      for (let i = 0; i < kids; i++) {
        node.children.push(branch(depth + 1, len * 0.68, radius * 0.62, birth + 1.1 + rnd() * 0.5));
      }
    }
    if (depth >= 1) {
      node.leaves = makeLeaves(5 + Math.round(rnd() * 3), 0.78, birth + 1.0, 0.3, 0.62);
    }
    return node;
  }

  // Tronco: cadena de 4 segmentos con leve curvatura.
  let trunkLen = 1.55;
  let trunkRadius = 0.21;
  const root: TreeNode = {
    len: trunkLen,
    radius: trunkRadius,
    rotX: 0,
    rotY: 0,
    rotZ: 0,
    birth: T_SPROUT,
    growDur: 1.6,
    swayPhase: rnd() * Math.PI * 2,
    depth: 0,
    children: [],
    leaves: [],
  };
  let current = root;
  const segs: TreeNode[] = [root];
  for (let i = 1; i < 4; i++) {
    trunkLen *= 0.82;
    trunkRadius *= 0.74;
    const seg: TreeNode = {
      len: trunkLen,
      radius: trunkRadius,
      rotX: (rnd() - 0.5) * 0.22,
      rotY: (rnd() - 0.5) * 0.4,
      rotZ: (rnd() - 0.5) * 0.22,
      birth: T_SPROUT + i * 1.5,
      growDur: 1.5,
      swayPhase: rnd() * Math.PI * 2,
      depth: 0,
      children: [],
      leaves: [],
    };
    // Ramas laterales desde el segundo segmento hacia arriba
    const branches = i === 1 ? 1 : 2;
    for (let b = 0; b < branches; b++) {
      seg.children.push(
        branch(1, trunkLen * 0.85, trunkRadius * 0.6, T_SPROUT + 2.2 + i * 1.7 + rnd())
      );
    }
    current.children.push(seg);
    current = seg;
    segs.push(seg);
  }
  // Copa superior: masa central + anillo ancho 360° + tapa + bajo-copa.
  // Capas solapadas → silueta continua, sin huecos de tronco visibles.
  current.leaves = [
    ...makeLeaves(9, 1.05, STAGE_TIMES[8] - 0.9, 0.36, 0.8),
    ...makeCanopy(16, 1.5, 0.12, STAGE_TIMES[8] - 1.1, 0.34, 0.72),
    ...makeCanopy(8, 0.65, 1.0, STAGE_TIMES[8] - 0.7, 0.32, 0.64),
    ...makeCanopy(9, 1.25, -0.42, STAGE_TIMES[8] - 0.5, 0.3, 0.6),
  ];
  current.children.push(branch(1, trunkLen * 0.8, trunkRadius * 0.55, STAGE_TIMES[7]));
  current.children.push(branch(1, trunkLen * 0.72, trunkRadius * 0.5, STAGE_TIMES[6] + 0.4));
  // Anillos intermedios en el tronco — rellenan costados y media altura
  segs[2].leaves = makeCanopy(12, 1.35, 0.15, STAGE_TIMES[8] - 0.3, 0.3, 0.64);
  segs[1].leaves = makeCanopy(7, 0.95, 0.2, STAGE_TIMES[8] - 0.15, 0.26, 0.52);

  return root;
}

/* ------------------------------ geometrías base ----------------------------- */

let _geos: {
  branch: THREE.CylinderGeometry;
  leaf: THREE.IcosahedronGeometry;
  sphere: THREE.SphereGeometry;
  cone: THREE.ConeGeometry;
} | null = null;

function getGeos() {
  if (!_geos) {
    const branch = new THREE.CylinderGeometry(0.62, 1, 1, 7);
    branch.translate(0, 0.5, 0); // base en el origen → crece hacia arriba
    _geos = {
      branch,
      leaf: new THREE.IcosahedronGeometry(1, 0),
      sphere: new THREE.SphereGeometry(1, 18, 14),
      cone: new THREE.ConeGeometry(1, 1, 5),
    };
  }
  return _geos;
}

/* --------------------------------- Branch ---------------------------------- */

function Branch({ node, time }: { node: TreeNode; time: React.RefObject<number> }) {
  const group = useRef<THREE.Group>(null);
  const geos = getGeos();

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const t = time.current ?? 0;
    const p = clamp01((t - node.birth) / node.growDur);
    const s = p <= 0 ? 0.0001 : easeOutBack(p);
    g.scale.setScalar(Math.max(0.0001, s));
    // Vaivén de viento: más amplitud cuanto más arriba/delgada la rama
    const sway = 0.014 + node.depth * 0.012;
    g.rotation.z = node.rotZ + Math.sin(t * 1.15 + node.swayPhase) * sway;
    g.rotation.x = node.rotX + Math.cos(t * 0.9 + node.swayPhase) * sway * 0.6;
  });

  return (
    <group ref={group} rotation={[node.rotX, node.rotY, node.rotZ]} scale={0.0001}>
      <mesh geometry={geos.branch} scale={[node.radius, node.len, node.radius]}>
        <meshToonMaterial color={COLOR.trunk} gradientMap={getGradientMap()} />
      </mesh>
      {/* contorno tipo toon */}
      <mesh geometry={geos.branch} scale={[node.radius * 1.22, node.len * 1.03, node.radius * 1.22]}>
        <meshBasicMaterial color={COLOR.outline} side={THREE.BackSide} />
      </mesh>
      <group position={[0, node.len, 0]}>
        {node.children.map((child, i) => (
          <Branch key={i} node={child} time={time} />
        ))}
        {node.leaves.map((leaf, i) => (
          <LeafBlob key={`l${i}`} leaf={leaf} time={time} />
        ))}
      </group>
    </group>
  );
}

function LeafBlob({
  leaf,
  time,
}: {
  leaf: TreeNode["leaves"][number];
  time: React.RefObject<number>;
}) {
  const ref = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.MeshToonMaterial>(null);
  const geos = getGeos();

  // Color base + dorado destino (deterministas por hoja, estables entre replays)
  const goldenly = useMemo(() => {
    const h = leafHash(leaf.x, leaf.z);
    return {
      base: new THREE.Color(leaf.color),
      gold: new THREE.Color(COLOR.gold[Math.floor(h * COLOR.gold.length) % COLOR.gold.length]),
      start: T_GOLD + leafHash(leaf.z, leaf.x) * GOLD_STAGGER,
    };
  }, [leaf]);

  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    const t = time.current ?? 0;
    const p = clamp01((t - leaf.birth) / 0.7);
    const pop = p <= 0 ? 0.0001 : easeOutBack(p);
    const breathe = 1 + Math.sin(t * 1.6 + leaf.x * 9) * 0.035;
    g.scale.setScalar(Math.max(0.0001, pop * breathe));

    // Transición a dorado en las etapas finales (pura en t: el seek la respeta)
    if (matRef.current) {
      const gp = easeOutCubic(clamp01((t - goldenly.start) / GOLD_DUR));
      matRef.current.color.copy(goldenly.base).lerp(goldenly.gold, gp);
    }
  });

  return (
    <group ref={ref} position={[leaf.x, leaf.y, leaf.z]} scale={0.0001}>
      <mesh geometry={geos.leaf} scale={leaf.r}>
        <meshToonMaterial ref={matRef} color={leaf.color} gradientMap={getGradientMap()} />
      </mesh>
      <mesh geometry={geos.leaf} scale={leaf.r * 1.12}>
        <meshBasicMaterial color={COLOR.outline} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

/* ----------------------------------- Seed ----------------------------------- */

function Seed({ time }: { time: React.RefObject<number> }) {
  const ref = useRef<THREE.Group>(null);
  const geos = getGeos();

  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    const t = time.current ?? 0;
    const y = seedHeight(t);
    const squash = squashAmount(t);

    // Al brotar, la semilla se hunde y desaparece bajo el montículo
    const sink = clamp01((t - T_SPROUT + 0.3) / 1.0);
    const shrink = 1 - easeOutCubic(sink);

    g.position.y = y - sink * 0.45;
    g.scale.set(
      (1 + squash * 0.7) * Math.max(0.0001, shrink),
      (1 - squash) * Math.max(0.0001, shrink),
      (1 + squash * 0.7) * Math.max(0.0001, shrink)
    );

    // Giro mientras cae; al aterrizar se estabiliza con un meneo decreciente
    if (t < T_IMPACT_1) {
      g.rotation.z = t * 3.2;
      g.rotation.x = t * 1.1;
    } else {
      const wig = Math.exp(-(t - T_IMPACT_1) * 1.6) * Math.sin((t - T_IMPACT_1) * 9);
      g.rotation.z = THREE.MathUtils.damp(g.rotation.z, wig * 0.4, 6, 1 / 60);
      g.rotation.x = THREE.MathUtils.damp(g.rotation.x, 0, 6, 1 / 60);
    }
  });

  return (
    <group ref={ref} position={[0, FALL_HEIGHT, 0]}>
      <mesh geometry={geos.sphere} scale={[0.24, 0.32, 0.24]}>
        <meshToonMaterial color={COLOR.seed} gradientMap={getGradientMap()} />
      </mesh>
      <mesh geometry={geos.sphere} scale={[0.275, 0.355, 0.275]}>
        <meshBasicMaterial color={COLOR.outline} side={THREE.BackSide} />
      </mesh>
      {/* destello lateral */}
      <mesh geometry={geos.sphere} position={[0.08, 0.1, 0.14]} scale={0.05}>
        <meshBasicMaterial color="#bae6fd" />
      </mesh>
    </group>
  );
}

/* ----------------------------- polvo del impacto ---------------------------- */

const DUST = (() => {
  const rnd = mulberry32(777);
  return Array.from({ length: 9 }, (_, i) => {
    const ang = (i / 9) * Math.PI * 2 + rnd() * 0.5;
    return {
      dirX: Math.cos(ang),
      dirZ: Math.sin(ang),
      speed: 0.8 + rnd() * 0.9,
      size: 0.08 + rnd() * 0.09,
      delay: rnd() * 0.05,
    };
  });
})();

function DustPuff({ time }: { time: React.RefObject<number> }) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const geos = getGeos();

  useFrame(() => {
    const t = time.current ?? 0;
    const p = clamp01((t - T_IMPACT_1) / 0.75);
    DUST.forEach((d, i) => {
      const m = refs.current[i];
      if (!m) return;
      const q = clamp01(p - d.delay);
      const e = easeOutCubic(q);
      m.visible = q > 0 && q < 1;
      m.position.set(d.dirX * (0.25 + e * d.speed), 0.1 + e * 0.35, d.dirZ * (0.25 + e * d.speed));
      m.scale.setScalar(Math.max(0.0001, d.size * (1 - q)));
      (m.material as THREE.MeshBasicMaterial).opacity = 0.55 * (1 - q);
    });
  });

  return (
    <group>
      {DUST.map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          geometry={geos.sphere}
          visible={false}
        >
          <meshBasicMaterial color={COLOR.dust} transparent opacity={0} />
        </mesh>
      ))}
    </group>
  );
}

/* ------------------------------ suelo y entorno ----------------------------- */

function Environment({
  onGroundDown,
  time,
}: {
  onGroundDown: (e: ThreeEvent<PointerEvent>) => void;
  time: React.RefObject<number>;
}) {
  const geos = getGeos();
  const haloRef = useRef<THREE.MeshBasicMaterial>(null);
  const grassRefs = useRef<(THREE.Mesh | null)[]>([]);
  const grassMats = useRef<(THREE.MeshToonMaterial | null)[]>([]);
  const bushRefs = useRef<(THREE.Mesh | null)[]>([]);
  const bushMats = useRef<(THREE.MeshToonMaterial | null)[]>([]);
  const flowerRefs = useRef<(THREE.Group | null)[]>([]);
  const palette = useMemo(
    () => ({
      haloBase: new THREE.Color(COLOR.glow),
      haloGold: new THREE.Color(COLOR.goldGlow),
      grassBase: new THREE.Color(COLOR.grass),
      grassGold: new THREE.Color("#f59e0b"),
      gold: new THREE.Color(COLOR.goldGlow),
    }),
    []
  );

  // La vegetación brota irradiando desde el árbol: lo más cercano primero.
  const scenery = useMemo(() => {
    const rnd = mulberry32(4242);
    const ring = (min: number, max: number) => {
      const ang = rnd() * Math.PI * 2;
      const dist = min + rnd() * (max - min);
      return { x: Math.cos(ang) * dist, z: Math.sin(ang) * dist, dist };
    };
    const rocks = Array.from({ length: 7 }, () => {
      const p = ring(2.2, 7.2);
      return { x: p.x, z: p.z, s: 0.12 + rnd() * 0.3, rot: rnd() * Math.PI };
    });
    const grass = Array.from({ length: 90 }, () => {
      const p = ring(0.8, 7.3);
      return {
        x: p.x,
        z: p.z,
        h: 0.12 + rnd() * 0.24,
        lean: (rnd() - 0.5) * 0.5,
        phase: rnd() * Math.PI * 2,
        birth: T_SPROUT + 0.3 + (p.dist / 7.3) * 9.5 + rnd() * 1.2,
      };
    });
    const bushes = Array.from({ length: 12 }, () => {
      const p = ring(1.4, 6.6);
      return {
        x: p.x,
        z: p.z,
        s: 0.16 + rnd() * 0.2,
        color: COLOR.leaf[Math.floor(rnd() * COLOR.leaf.length)],
        phase: rnd() * Math.PI * 2,
        birth: T_SPROUT + 1.5 + (p.dist / 6.6) * 8 + rnd(),
      };
    });
    const flowerColors = ["#7dd3fc", "#5eead4", "#38bdf8"];
    const flowers = [
      // flores teal/sky durante el crecimiento
      ...Array.from({ length: 14 }, () => {
        const p = ring(1.2, 6.8);
        return {
          x: p.x,
          z: p.z,
          h: 0.2 + rnd() * 0.18,
          head: 0.05 + rnd() * 0.04,
          color: flowerColors[Math.floor(rnd() * flowerColors.length)],
          phase: rnd() * Math.PI * 2,
          birth: 8 + (p.dist / 6.8) * 6 + rnd(),
        };
      }),
      // florecimiento dorado en las etapas finales
      ...Array.from({ length: 8 }, () => {
        const p = ring(1.0, 5.8);
        return {
          x: p.x,
          z: p.z,
          h: 0.22 + rnd() * 0.2,
          head: 0.06 + rnd() * 0.05,
          color: rnd() < 0.5 ? "#fbbf24" : "#fde68a",
          phase: rnd() * Math.PI * 2,
          birth: T_GOLD + 0.4 + rnd() * 2.2,
        };
      }),
    ];
    return { rocks, grass, bushes, flowers };
  }, []);

  useFrame(() => {
    const t = time.current ?? 0;
    const gp = easeOutCubic(clamp01((t - T_GOLD) / 3));
    const m = haloRef.current;
    if (m) {
      m.color.copy(palette.haloBase).lerp(palette.haloGold, gp);
      m.opacity = 0.1 + gp * 0.07;
    }

    // Césped: brota con pop, se mece con el viento y se dora al final
    for (let i = 0; i < scenery.grass.length; i++) {
      const blade = scenery.grass[i];
      const mesh = grassRefs.current[i];
      const mat = grassMats.current[i];
      if (!mesh || !blade) continue;
      const pop = easeOutBack(clamp01((t - blade.birth) / 0.5));
      mesh.scale.set(
        Math.max(0.0001, 0.045 * pop),
        Math.max(0.0001, blade.h * pop),
        Math.max(0.0001, 0.045 * pop)
      );
      mesh.position.y = (blade.h * pop) / 2;
      mesh.rotation.z = blade.lean + Math.sin(t * 1.9 + blade.phase) * 0.07 * pop;
      if (mat) {
        const start = T_GOLD + leafHash(blade.x, blade.z) * GOLD_STAGGER;
        const p = easeOutCubic(clamp01((t - start) / GOLD_DUR));
        mat.color.copy(palette.grassBase).lerp(palette.grassGold, p);
      }
    }

    // Arbustos: pop + respiración + dorado
    for (let i = 0; i < scenery.bushes.length; i++) {
      const bush = scenery.bushes[i];
      const mesh = bushRefs.current[i];
      const mat = bushMats.current[i];
      if (!mesh || !bush) continue;
      const pop = easeOutBack(clamp01((t - bush.birth) / 0.6));
      const breathe = 1 + Math.sin(t * 1.5 + bush.phase) * 0.04;
      mesh.scale.setScalar(Math.max(0.0001, bush.s * pop * breathe));
      if (mat) {
        const start = T_GOLD + leafHash(bush.x, bush.z) * GOLD_STAGGER;
        const p = easeOutCubic(clamp01((t - start) / GOLD_DUR));
        mat.color.set(bush.color);
        mat.color.lerp(palette.gold, p);
      }
    }

    // Flores: brotan enteras y se mecen apenas
    for (let i = 0; i < scenery.flowers.length; i++) {
      const flower = scenery.flowers[i];
      const g = flowerRefs.current[i];
      if (!g || !flower) continue;
      const pop = easeOutBack(clamp01((t - flower.birth) / 0.7));
      g.scale.setScalar(Math.max(0.0001, pop));
      g.rotation.z = Math.sin(t * 1.6 + flower.phase) * 0.06 * pop;
    }
  });

  return (
    <group>
      {/* suelo (clickeable: genera chispas) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} onPointerDown={onGroundDown}>
        <circleGeometry args={[30, 48]} />
        <meshToonMaterial color={COLOR.ground} gradientMap={getGradientMap()} />
      </mesh>
      {/* halo de energía bajo el árbol (vira a dorado al final) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
        <circleGeometry args={[2.6, 40]} />
        <meshBasicMaterial ref={haloRef} color={COLOR.glow} transparent opacity={0.1} />
      </mesh>
      {/* montículo donde cae la semilla */}
      <mesh geometry={getGeos().sphere} position={[0, -0.08, 0]} scale={[0.85, 0.3, 0.85]}>
        <meshToonMaterial color={COLOR.mound} gradientMap={getGradientMap()} />
      </mesh>
      {scenery.rocks.map((r, i) => (
        <mesh
          key={`r${i}`}
          geometry={geos.leaf}
          position={[r.x, r.s * 0.5, r.z]}
          rotation={[0, r.rot, 0]}
          scale={r.s}
        >
          <meshToonMaterial color={COLOR.rock} gradientMap={getGradientMap()} />
        </mesh>
      ))}
      {scenery.grass.map((g, i) => (
        <mesh
          key={`g${i}`}
          ref={(el) => {
            grassRefs.current[i] = el;
          }}
          geometry={geos.cone}
          position={[g.x, 0, g.z]}
          scale={0.0001}
        >
          <meshToonMaterial
            ref={(el) => {
              grassMats.current[i] = el;
            }}
            color={COLOR.grass}
            gradientMap={getGradientMap()}
          />
        </mesh>
      ))}
      {scenery.bushes.map((b, i) => (
        <mesh
          key={`b${i}`}
          ref={(el) => {
            bushRefs.current[i] = el;
          }}
          geometry={geos.leaf}
          position={[b.x, b.s * 0.45, b.z]}
          scale={0.0001}
        >
          <meshToonMaterial
            ref={(el) => {
              bushMats.current[i] = el;
            }}
            color={b.color}
            gradientMap={getGradientMap()}
          />
        </mesh>
      ))}
      {scenery.flowers.map((f, i) => (
        <group
          key={`f${i}`}
          ref={(el) => {
            flowerRefs.current[i] = el;
          }}
          position={[f.x, 0, f.z]}
          scale={0.0001}
        >
          {/* tallo */}
          <mesh geometry={geos.cone} position={[0, f.h / 2, 0]} scale={[0.018, f.h, 0.018]}>
            <meshToonMaterial color={COLOR.grass} gradientMap={getGradientMap()} />
          </mesh>
          {/* cabeza */}
          <mesh geometry={geos.sphere} position={[0, f.h + f.head * 0.6, 0]} scale={f.head}>
            <meshToonMaterial color={f.color} gradientMap={getGradientMap()} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ------------------------------- partículas --------------------------------- */

const PARTICLE_COUNT = 42;

function Particles({ time }: { time: React.RefObject<number> }) {
  const ref = useRef<THREE.Points>(null);

  const { positions, colors, seeds } = useMemo(() => {
    const rnd = mulberry32(99);
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const seeds = new Float32Array(PARTICLE_COUNT * 2);
    const a = new THREE.Color(COLOR.particleA);
    const b = new THREE.Color(COLOR.particleB);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3] = (rnd() - 0.5) * 12;
      positions[i * 3 + 1] = rnd() * 6;
      positions[i * 3 + 2] = (rnd() - 0.5) * 10;
      const c = rnd() < 0.5 ? a : b;
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
      seeds[i * 2] = rnd() * Math.PI * 2;
      seeds[i * 2 + 1] = 0.15 + rnd() * 0.35;
    }
    return { positions, colors, seeds };
  }, []);

  useFrame(() => {
    const pts = ref.current;
    if (!pts) return;
    const t = time.current ?? 0;
    const attr = pts.geometry.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const phase = seeds[i * 2];
      const speed = seeds[i * 2 + 1];
      let y = positions[i * 3 + 1] + t * speed;
      y = y % 7;
      attr.setY(i, y);
      attr.setX(i, positions[i * 3] + Math.sin(t * 0.5 + phase) * 0.5);
    }
    attr.needsUpdate = true;
    const mat = pts.material as THREE.PointsMaterial;
    mat.opacity = 0.35 + Math.sin(t * 0.8) * 0.1;
    // Tinte cálido global de las partículas en las etapas doradas
    const gp = easeOutCubic(clamp01((t - T_GOLD) / 3));
    mat.color.setRGB(1, 1 - gp * 0.16, 1 - gp * 0.42);
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions.slice(), 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.07} vertexColors transparent opacity={0.4} depthWrite={false} />
    </points>
  );
}

/* ----------------------------- chispas al click ----------------------------- */

const BURST_DIRS = (() => {
  const rnd = mulberry32(555);
  return Array.from({ length: 7 }, (_, i) => {
    const ang = (i / 7) * Math.PI * 2 + rnd() * 0.6;
    return {
      x: Math.cos(ang) * (0.5 + rnd() * 0.6),
      y: 0.9 + rnd() * 1.1,
      z: Math.sin(ang) * (0.5 + rnd() * 0.6),
      s: 0.05 + rnd() * 0.05,
      teal: rnd() < 0.6,
    };
  });
})();

const BURST_POOL = 5;
const BURST_LIFE = 0.7;

function ClickBursts({
  bursts,
  time,
}: {
  bursts: React.RefObject<Burst[]>;
  time: React.RefObject<number>;
}) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const geos = getGeos();

  useFrame(() => {
    const t = time.current ?? 0;
    const list = bursts.current ?? [];
    for (let b = 0; b < BURST_POOL; b++) {
      const burst = list[b];
      for (let i = 0; i < BURST_DIRS.length; i++) {
        const m = refs.current[b * BURST_DIRS.length + i];
        if (!m) continue;
        const p = burst ? clamp01((t - burst.start) / BURST_LIFE) : 1;
        if (!burst || p >= 1) {
          m.visible = false;
          continue;
        }
        const d = BURST_DIRS[i];
        const e = easeOutCubic(p);
        m.visible = true;
        // sube y cae con una gravedad suave, encogiéndose
        m.position.set(
          burst.x + d.x * e,
          0.05 + d.y * e - 1.6 * p * p,
          burst.z + d.z * e
        );
        m.scale.setScalar(Math.max(0.0001, d.s * (1 - p)));
        (m.material as THREE.MeshBasicMaterial).opacity = 0.85 * (1 - p);
      }
    }
  });

  return (
    <group>
      {Array.from({ length: BURST_POOL }).map((_, b) =>
        BURST_DIRS.map((d, i) => (
          <mesh
            key={`${b}-${i}`}
            ref={(el) => {
              refs.current[b * BURST_DIRS.length + i] = el;
            }}
            geometry={geos.leaf}
            visible={false}
          >
            <meshBasicMaterial
              color={d.teal ? COLOR.particleA : COLOR.particleB}
              transparent
              opacity={0}
              depthWrite={false}
            />
          </mesh>
        ))
      )}
    </group>
  );
}

/* ------------------------------ cielo progresivo ---------------------------- */

const STAR_LAYERS = 3;
const STARS_PER_LAYER = 34;

function SkyLife({ time }: { time: React.RefObject<number> }) {
  const starMats = useRef<(THREE.PointsMaterial | null)[]>([]);
  const cloudRefs = useRef<(THREE.Group | null)[]>([]);
  const cloudMats = useRef<THREE.MeshToonMaterial[][]>([]);
  const horizonMat = useRef<THREE.MeshBasicMaterial>(null);
  const cometRefs = useRef<(THREE.Mesh | null)[]>([]);
  const geos = getGeos();

  const sky = useMemo(() => {
    const rnd = mulberry32(31416);
    // Estrellas en cúpula alta
    const starLayers = Array.from({ length: STAR_LAYERS }, () => {
      const positions = new Float32Array(STARS_PER_LAYER * 3);
      for (let i = 0; i < STARS_PER_LAYER; i++) {
        const ang = rnd() * Math.PI * 2;
        const radius = 18 + rnd() * 14;
        const y = 5 + rnd() * 13;
        positions[i * 3] = Math.cos(ang) * radius;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = Math.sin(ang) * radius;
      }
      return { positions, phase: rnd() * Math.PI * 2, speed: 0.6 + rnd() * 0.8 };
    });
    // Nubes: racimos de blobs aplanados orbitando lentísimo
    const clouds = Array.from({ length: 6 }, (_, i) => ({
      ang0: rnd() * Math.PI * 2,
      radius: 13 + rnd() * 7,
      y: 6.5 + rnd() * 4,
      drift: 0.008 + rnd() * 0.01,
      scale: 1 + rnd() * 0.9,
      birth: 6 + i * 1.15 + rnd() * 0.8,
      blobs: Array.from({ length: 3 + Math.round(rnd()) }, () => ({
        x: (rnd() - 0.5) * 2.4,
        y: (rnd() - 0.5) * 0.5,
        z: (rnd() - 0.5) * 1.2,
        r: 0.55 + rnd() * 0.5,
      })),
    }));
    return {
      starLayers,
      clouds,
      cloudBase: new THREE.Color("#0c4a6e"),
      cloudGold: new THREE.Color(COLOR.goldGlow),
      horizonBase: new THREE.Color(COLOR.glow),
      horizonGold: new THREE.Color(COLOR.goldGlow),
    };
  }, []);

  useFrame(() => {
    const t = time.current ?? 0;
    const growth = clamp01((t - 2) / 10); // el cielo "se enciende" con el árbol
    const gp = easeOutCubic(clamp01((t - T_GOLD) / 3));

    // Estrellas: aparecen progresivamente y titilan por capas
    for (let l = 0; l < STAR_LAYERS; l++) {
      const m = starMats.current[l];
      const layer = sky.starLayers[l];
      if (!m || !layer) continue;
      m.opacity = growth * (0.4 + 0.3 * Math.sin(t * layer.speed + layer.phase));
    }

    // Nubes: pop al nacer, deriva orbital lenta, tinte cálido al final
    for (let c = 0; c < sky.clouds.length; c++) {
      const cloud = sky.clouds[c];
      const g = cloudRefs.current[c];
      if (!g || !cloud) continue;
      const pop = easeOutBack(clamp01((t - cloud.birth) / 1.2));
      g.scale.setScalar(Math.max(0.0001, cloud.scale * pop));
      const ang = cloud.ang0 + t * cloud.drift;
      g.position.set(Math.cos(ang) * cloud.radius, cloud.y, Math.sin(ang) * cloud.radius);
      const mats = cloudMats.current[c] ?? [];
      for (const mat of mats) {
        mat.color.copy(sky.cloudBase).lerp(sky.cloudGold, gp * 0.35);
      }
    }

    // Banda de horizonte: gana presencia con el crecimiento, dorada al final
    if (horizonMat.current) {
      horizonMat.current.color
        .copy(sky.horizonBase)
        .lerp(sky.horizonGold, gp);
      horizonMat.current.opacity = 0.04 + growth * 0.04 + gp * 0.07;
    }

    // Cometa: solo en idle (post-crecimiento), cruza el cielo cada ~9s
    const idle = t - T_END;
    const cycle = idle > 0 ? idle % 9 : -1;
    const visible = cycle >= 0 && cycle < 1.5;
    const p = visible ? cycle / 1.5 : 0;
    const fade = visible ? Math.sin(Math.PI * p) : 0;
    for (let i = 0; i < cometRefs.current.length; i++) {
      const m = cometRefs.current[i];
      if (!m) continue;
      const k = i * 0.035;
      const q = Math.max(0, p - k);
      m.visible = visible;
      if (!visible) continue;
      m.position.set(-18 + q * 32, 12 - q * 4.5, -14 - q * 3);
      m.scale.setScalar(Math.max(0.0001, (0.09 - i * 0.013) * fade));
      (m.material as THREE.MeshBasicMaterial).opacity = fade * (1 - i * 0.16);
    }
  });

  return (
    <group>
      {sky.starLayers.map((layer, l) => (
        <points key={`stars${l}`}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[layer.positions, 3]} />
          </bufferGeometry>
          <pointsMaterial
            ref={(el) => {
              starMats.current[l] = el;
            }}
            size={0.09}
            color={l === 1 ? "#5eead4" : "#bae6fd"}
            transparent
            opacity={0}
            depthWrite={false}
          />
        </points>
      ))}

      {sky.clouds.map((cloud, c) => (
        <group
          key={`cloud${c}`}
          ref={(el) => {
            cloudRefs.current[c] = el;
          }}
          scale={0.0001}
        >
          {cloud.blobs.map((b, i) => (
            <mesh
              key={i}
              geometry={geos.leaf}
              position={[b.x, b.y, b.z]}
              scale={[b.r, b.r * 0.5, b.r]}
            >
              <meshToonMaterial
                ref={(el) => {
                  if (!el) return;
                  (cloudMats.current[c] ??= [])[i] = el;
                }}
                color="#0c4a6e"
                gradientMap={getGradientMap()}
              />
            </mesh>
          ))}
        </group>
      ))}

      {/* banda de glow en el horizonte — envuelve 360°, funciona con la órbita */}
      <mesh position={[0, 2.2, 0]}>
        <cylinderGeometry args={[27, 27, 5.5, 36, 1, true]} />
        <meshBasicMaterial
          ref={horizonMat}
          color={COLOR.glow}
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* cometa con estela */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh
          key={`comet${i}`}
          ref={(el) => {
            cometRefs.current[i] = el;
          }}
          geometry={geos.sphere}
          visible={false}
        >
          <meshBasicMaterial
            color={i === 0 ? "#bae6fd" : "#5eead4"}
            transparent
            opacity={0}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ------------------------------- luz dorada --------------------------------- */

function GoldenGlow({ time }: { time: React.RefObject<number> }) {
  const light = useRef<THREE.PointLight>(null);
  useFrame(() => {
    const l = light.current;
    if (!l) return;
    const t = time.current ?? 0;
    const gp = easeOutCubic(clamp01((t - T_GOLD) / 3));
    // Respira levemente una vez encendida
    l.intensity = gp * (24 + Math.sin(t * 1.4) * 4);
  });
  return (
    <pointLight ref={light} position={[3.5, 5.5, 3]} color={COLOR.goldGlow} intensity={0} />
  );
}

/* --------------------------------- cámara ----------------------------------- */

function CameraRig({
  time,
  interaction,
}: {
  time: React.RefObject<number>;
  interaction: React.RefObject<Interaction>;
}) {
  const { camera } = useThree();
  const target = useRef(new THREE.Vector3(0, 1.2, 0));

  useFrame(() => {
    const t = time.current ?? 0;
    const it = interaction.current;
    const mx = it?.mouseX ?? 0;
    const my = it?.mouseY ?? 0;
    const desired = new THREE.Vector3();
    const look = new THREE.Vector3();

    if (t < 2.6) {
      // Sigue levemente la caída + parallax sutil del mouse
      const y = seedHeight(t);
      desired.set(0.4 + mx * 0.5, 1.9 + y * 0.22 - my * 0.35, 8.2);
      look.set(0, 0.6 + y * 0.3, 0);
    } else {
      // Se aleja y sube con el árbol; órbita lenta + drag/swipe del usuario
      const growth = clamp01((t - T_SPROUT) / 10.5);
      const h = easeOutCubic(growth) * 4.6;
      const az = 0.05 + t * 0.022 + (it?.azOffset ?? 0) + mx * 0.12;
      const r = 8.2 + h * 1.05;
      desired.set(Math.sin(az) * r, 2.1 + h * 0.55 - my * 0.6, Math.cos(az) * r);
      look.set(0, 0.7 + h * 0.48, 0);
    }

    camera.position.lerp(desired, 0.035);
    target.current.lerp(look, 0.05);
    camera.lookAt(target.current);
  });

  return null;
}

/* ------------------------------ escena interna ------------------------------ */

function SceneContent({
  onStage,
  onComplete,
  timeOffset,
  seekRef,
  interaction,
  bursts,
}: {
  onStage?: (index: number) => void;
  onComplete?: () => void;
  timeOffset: number;
  seekRef: React.RefObject<number | null>;
  interaction: React.RefObject<Interaction>;
  bursts: React.RefObject<Burst[]>;
}) {
  const time = useRef(0);
  const start = useRef<number | null>(null);
  const lastStage = useRef(-1);
  const completed = useRef(false);
  const tree = useMemo(() => buildTree(), []);

  useFrame(({ clock }) => {
    if (start.current === null) start.current = clock.elapsedTime;
    // Salto directo a un punto del timeline (navegación entre niveles)
    if (seekRef.current !== null && seekRef.current !== undefined) {
      start.current = clock.elapsedTime - seekRef.current;
      seekRef.current = null;
    }
    time.current = clock.elapsedTime - start.current + timeOffset;

    if (!completed.current && time.current >= T_END) {
      completed.current = true;
      onComplete?.();
    }

    if (onStage) {
      let stage = 0;
      for (let i = 0; i < STAGE_TIMES.length; i++) {
        if (time.current >= STAGE_TIMES[i]) stage = i;
      }
      if (stage !== lastStage.current) {
        lastStage.current = stage;
        onStage(stage);
      }
    }
  });

  const onGroundDown = (e: ThreeEvent<PointerEvent>) => {
    const list = bursts.current ?? [];
    list.push({ x: e.point.x, z: e.point.z, start: time.current });
    if (list.length > BURST_POOL) list.shift();
  };

  return (
    <>
      <ambientLight color="#bae6fd" intensity={0.65} />
      <directionalLight position={[4, 9, 6]} intensity={1.5} color="#ffffff" />
      <pointLight position={[-5, 3, -4]} intensity={28} color="#2dd4bf" />

      <CameraRig time={time} interaction={interaction} />
      <GoldenGlow time={time} />
      <SkyLife time={time} />
      <Environment onGroundDown={onGroundDown} time={time} />
      <Seed time={time} />
      <DustPuff time={time} />
      <group position={[0, 0, 0]}>
        <Branch node={tree} time={time} />
      </group>
      <Particles time={time} />
      <ClickBursts bursts={bursts} time={time} />
      <WarmFog time={time} />
    </>
  );
}

/** Niebla que pasa de azul profundo a un tono cálido en la fase dorada. */
function WarmFog({ time }: { time: React.RefObject<number> }) {
  const ref = useRef<THREE.Fog>(null);
  const colors = useMemo(
    () => ({ base: new THREE.Color("#07283a"), warm: new THREE.Color("#2e2a18") }),
    []
  );
  useFrame(() => {
    if (!ref.current) return;
    const t = time.current ?? 0;
    const gp = easeOutCubic(clamp01((t - T_GOLD) / 3));
    ref.current.color.copy(colors.base).lerp(colors.warm, gp * 0.6);
  });
  return <fog ref={ref} attach="fog" args={["#07283a", 14, 34]} />;
}

/* ------------------------------- export público ----------------------------- */

export function SemillaScene({
  onStage,
  onComplete,
  apiRef,
  className,
}: {
  onStage?: (index: number) => void;
  onComplete?: () => void;
  apiRef?: React.MutableRefObject<SemillaSceneApi | null>;
  className?: string;
}) {
  // Con prefers-reduced-motion saltamos directo al árbol adulto.
  const timeOffset = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? 20
        : 0,
    []
  );

  const seekRef = useRef<number | null>(null);
  const interaction = useRef<Interaction>({
    mouseX: 0,
    mouseY: 0,
    azOffset: 0,
    dragging: false,
    lastX: 0,
  });
  const bursts = useRef<Burst[]>([]);

  useEffect(() => {
    if (!apiRef) return;
    apiRef.current = {
      seek: (t: number) => {
        seekRef.current = t;
      },
    };
    return () => {
      apiRef.current = null;
    };
  }, [apiRef]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const it = interaction.current;
    it.dragging = true;
    it.lastX = e.clientX;
    e.currentTarget.setPointerCapture(e.pointerId);
    playPop();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const it = interaction.current;
    const rect = e.currentTarget.getBoundingClientRect();
    it.mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    it.mouseY = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    if (it.dragging) {
      it.azOffset += (e.clientX - it.lastX) * 0.0055;
      it.lastX = e.clientX;
    }
  };

  const endDrag = () => {
    interaction.current.dragging = false;
  };

  return (
    <div
      className={className}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerLeave={endDrag}
      // sin cursor propio: hereda cursor:none y manda el PlantCursor de la
      // landing; data-cursor activa su variante hover (semilla grande) aquí.
      // data-sound-skip: la escena maneja sus propios pops (evita duplicar).
      data-cursor="Explora"
      data-sound-skip
      style={{ touchAction: "none" }}
    >
      <Canvas
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 2]}
        camera={{ position: [0.4, 2.4, 8.2], fov: 42, near: 0.1, far: 60 }}
        style={{ background: "transparent" }}
      >
        <SceneContent
          onStage={onStage}
          onComplete={onComplete}
          timeOffset={timeOffset}
          seekRef={seekRef}
          interaction={interaction}
          bursts={bursts}
        />
      </Canvas>
    </div>
  );
}
