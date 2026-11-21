"use client";
import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { journey } from "@/lib/journey";
import { clayMaps, gravyBump, hopperMaps, leafMaps, matMaps, papadamMaps, seeded } from "./textures";

type V3 = [number, number, number];

/* A lumpy mound: a sphere pushed around by noise, with a flat base. */
function moundGeometry(seed: number, lumps = 0.18) {
  const g = new THREE.SphereGeometry(1, 48, 24);
  const r = seeded(seed);
  const waves = Array.from({ length: 6 }, () => [r() * 6 + 2, r() * 6, r() * 6 + 2, r() * 6]);
  const p = g.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    let d = 1;
    for (const [fx, px, fz, pz] of waves) d += Math.sin(v.x * fx + px) * Math.sin(v.z * fz + pz) * (lumps / waves.length);
    v.multiplyScalar(d);
    if (v.y < 0) v.y *= 0.05; // sit flat on the leaf
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
}

/* Many small pieces (rice grains, coconut, chopped leaves) scattered over a dome. */
function Scatter({
  count, seed, radius, height, geometry, colors, size, roughness = 0.7, rise = 0.6,
}: {
  count: number; seed: number; radius: [number, number]; height: number;
  geometry: THREE.BufferGeometry; colors: string[]; size: V3; roughness?: number; rise?: number;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = ref.current!;
    const r = seeded(seed);
    const o = new THREE.Object3D();
    const col = new THREE.Color();
    for (let i = 0; i < count; i++) {
      // uniform over an ellipse, height follows a dome, a few grains tumble lower
      const a = r() * Math.PI * 2;
      const d = Math.sqrt(r());
      const x = Math.cos(a) * d * radius[0];
      const z = Math.sin(a) * d * radius[1];
      const y = Math.sqrt(Math.max(0, 1 - d * d)) * height * (rise + (1 - rise) * r());
      o.position.set(x, y, z);
      o.rotation.set(r() * Math.PI, r() * Math.PI, r() * Math.PI);
      const s = 0.75 + r() * 0.5;
      o.scale.set(size[0] * s, size[1] * s, size[2] * s);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      m.setColorAt(i, col.set(colors[Math.floor(r() * colors.length)]));
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [count, seed, radius, height, size, colors, rise]);
  return (
    <instancedMesh ref={ref} args={[geometry, undefined, count]} castShadow>
      <meshStandardMaterial roughness={roughness} />
    </instancedMesh>
  );
}

const grain = new THREE.CapsuleGeometry(0.5, 1.6, 3, 6);
const flake = new THREE.BoxGeometry(1, 0.25, 1);
const bit = new THREE.IcosahedronGeometry(1, 0);
const cube = new THREE.BoxGeometry(1, 1, 1);

/* Red kekulu rice: a soft mound covered in individual grains. */
export function Rice({ position, grains = 3200 }: { position: V3; grains?: number }) {
  const mound = useMemo(() => moundGeometry(4, 0.08), []);
  return (
    <group position={position}>
      <mesh geometry={mound} scale={[0.5, 0.22, 0.4]} castShadow receiveShadow>
        <meshStandardMaterial color="#b4867a" roughness={0.9} />
      </mesh>
      <Scatter count={grains} seed={8} radius={[0.5, 0.4]} height={0.228} geometry={grain} size={[0.015, 0.015, 0.015]}
        colors={["#d2b2a3", "#c49a8a", "#b9877a", "#dcc3b6", "#ab7769"]} roughness={0.55} rise={0.95} />
    </group>
  );
}

/* A glossy curry: gravy mound plus chunks floating in it. */
function Curry({ position, gravy, chunk, chunks = 7, scale = [0.26, 0.09, 0.21] as V3, seed = 1, gloss = 0.28 }: {
  position: V3; gravy: string; chunk?: string; chunks?: number; scale?: V3; seed?: number; gloss?: number;
}) {
  const mound = useMemo(() => moundGeometry(seed, 0.25), [seed]);
  const bump = gravyBump();
  const pieces = useMemo(() => {
    const r = seeded(seed * 31);
    return Array.from({ length: chunks }, () => ({
      p: [(r() - 0.5) * scale[0] * 1.3, scale[1] * (0.6 + r() * 0.4), (r() - 0.5) * scale[2] * 1.3] as V3,
      rot: [r() * 3, r() * 3, r() * 3] as V3,
      s: 0.035 + r() * 0.035,
    }));
  }, [seed, chunks, scale]);
  return (
    <group position={position}>
      <mesh geometry={mound} scale={scale} castShadow receiveShadow>
        <meshPhysicalMaterial color={gravy} roughness={gloss} bumpMap={bump} bumpScale={0.6} clearcoat={0.6} clearcoatRoughness={0.25} />
      </mesh>
      {chunk && pieces.map((c, i) => (
        <mesh key={i} position={c.p} rotation={c.rot} scale={[c.s * 1.3, c.s, c.s]} castShadow>
          <dodecahedronGeometry args={[1, 1]} />
          <meshPhysicalMaterial color={chunk} roughness={0.45} clearcoat={0.4} />
        </mesh>
      ))}
    </group>
  );
}

function Papadam({ position, rotation }: { position: V3; rotation: V3 }) {
  const { map, bump } = papadamMaps();
  const geo = useMemo(() => {
    const g = new THREE.CircleGeometry(0.27, 40);
    const p = g.attributes.position as THREE.BufferAttribute;
    const r = seeded(2);
    for (let i = 1; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i);
      const k = 1 + (r() - 0.5) * 0.06;
      p.setXYZ(i, x * k, y * k, Math.sin(x * 9) * Math.cos(y * 7) * 0.025);
    }
    g.computeVertexNormals();
    return g;
  }, []);
  return (
    <mesh geometry={geo} position={position} rotation={rotation} castShadow>
      <meshStandardMaterial map={map} bumpMap={bump} bumpScale={1.5} roughness={0.7} side={THREE.DoubleSide} />
    </mesh>
  );
}

function FriedChilli({ position, rotation }: { position: V3; rotation: V3 }) {
  const geo = useMemo(() => {
    const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.12, 0.05, 0.02), new THREE.Vector3(0.26, 0.0, 0.06));
    return new THREE.TubeGeometry(curve, 16, 0.022, 8, false);
  }, []);
  return (
    <mesh geometry={geo} position={position} rotation={rotation} castShadow>
      <meshPhysicalMaterial color="#6e100b" roughness={0.3} clearcoat={0.8} />
    </mesh>
  );
}

/* Egg hopper (bittara appa): crisp lacy bowl with a soft egg in the middle. */
export function Hopper({ position, scale = 1 }: { position: V3; scale?: number }) {
  const { map, bump } = hopperMaps();
  const profile = useMemo(
    () => [[0, 0.0], [0.15, 0.005], [0.26, 0.03], [0.34, 0.08], [0.39, 0.15], [0.41, 0.2]].map(([x, y]) => new THREE.Vector2(x, y)),
    []
  );
  return (
    <group position={position} scale={scale}>
      <mesh castShadow receiveShadow>
        <latheGeometry args={[profile, 64]} />
        <meshStandardMaterial map={map} bumpMap={bump} bumpScale={2} roughness={0.65} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.012, 0]} scale={[0.15, 0.02, 0.13]}>
        <sphereGeometry args={[1, 32, 12]} />
        <meshPhysicalMaterial color="#f7f3ea" roughness={0.35} clearcoat={0.5} />
      </mesh>
      <mesh position={[0.01, 0.03, 0]} scale={[0.055, 0.03, 0.055]}>
        <sphereGeometry args={[1, 24, 12]} />
        <meshPhysicalMaterial color="#f2a516" roughness={0.15} clearcoat={1} />
      </mesh>
    </group>
  );
}

/* A small clay curry bowl (chatty) for the table. */
export function ClayBowl({ position, fill = "#7a2c14", scale = 1 }: { position: V3; fill?: string; scale?: number }) {
  const { map, bump } = clayMaps();
  const profile = useMemo(() => [[0, 0], [0.1, 0], [0.16, 0.04], [0.2, 0.1], [0.21, 0.13], [0.19, 0.13], [0.17, 0.1], [0.1, 0.04], [0, 0.035]].map(([x, y]) => new THREE.Vector2(x, y)), []);
  return (
    <group position={position} scale={scale}>
      <mesh castShadow receiveShadow>
        <latheGeometry args={[profile, 40]} />
        <meshStandardMaterial map={map} bumpMap={bump} bumpScale={1} roughness={0.85} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.175, 32]} />
        <meshPhysicalMaterial color={fill} roughness={0.25} clearcoat={0.8} bumpMap={gravyBump()} bumpScale={0.5} />
      </mesh>
    </group>
  );
}

/* Rice and five curries on banana leaf, on a woven mat. */
export function LeafMeal({ position, scale = 1, showAfter = 0, grains = 3200 }: { position: V3; scale?: number; showAfter?: number; grains?: number }) {
  const group = useRef<THREE.Group>(null);
  useFrame(() => {
    if (group.current) group.current.visible = journey.progress >= showAfter;
  });
  const leaf = leafMaps();
  const mat = matMaps();
  const leafGeo = useMemo(() => {
    const g = new THREE.PlaneGeometry(3.6, 1.7, 60, 20);
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i);
      const across = y / 0.85;
      p.setZ(i, across * across * 0.09 + Math.sin(x * 2.4) * 0.012);
    }
    g.computeVertexNormals();
    return g;
  }, []);

  return (
    <group ref={group} position={position} scale={scale}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]} receiveShadow>
        <planeGeometry args={[4.6, 2.8]} />
        <meshStandardMaterial map={mat.map} bumpMap={mat.bump} bumpScale={0.5} roughness={0.95} />
      </mesh>
      <mesh geometry={leafGeo} rotation={[-Math.PI / 2, 0, 0.08]} position={[0, 0.02, 0]} receiveShadow>
        <meshPhysicalMaterial map={leaf.map} alphaMap={leaf.alpha} alphaTest={0.5} bumpMap={leaf.bump} bumpScale={0.6}
          roughness={0.45} clearcoat={0.35} clearcoatRoughness={0.4} side={THREE.DoubleSide} />
      </mesh>

      <Rice position={[-0.2, 0.03, -0.05]} grains={grains} />
      {/* dhal: glossy turmeric yellow with mustard seeds */}
      <Curry position={[-0.78, 0.03, 0.38]} gravy="#d9a02a" seed={2} gloss={0.22} scale={[0.25, 0.07, 0.2]} />
      <group position={[-0.78, 0.03, 0.38]}>
        <Scatter count={40} seed={41} radius={[0.2, 0.15]} height={0.072} geometry={bit} size={[0.007, 0.007, 0.007]} colors={["#2a1a0e", "#8f1a10"]} rise={1} />
      </group>
      {/* chicken curry: dark roasted gravy with pieces */}
      <Curry position={[-0.12, 0.03, 0.5]} gravy="#6e2612" chunk="#8a4320" seed={3} scale={[0.27, 0.09, 0.2]} />
      {/* gotukola sambol: finely chopped greens with coconut */}
      <group position={[0.48, 0.03, 0.42]}>
        <Scatter count={420} seed={5} radius={[0.2, 0.16]} height={0.08} geometry={flake} size={[0.018, 0.012, 0.012]}
          colors={["#3f7a2c", "#2f6421", "#5a9a3c", "#4c8a33", "#ece4cf"]} rise={0.2} />
      </group>
      {/* pol sambol: grated coconut with chilli and lime */}
      <group position={[0.86, 0.03, 0.04]}>
        <Scatter count={360} seed={6} radius={[0.17, 0.15]} height={0.075} geometry={flake} size={[0.014, 0.008, 0.008]}
          colors={["#d3502a", "#e0683a", "#c8401f", "#f1e6d0", "#b5341a"]} rise={0.2} />
      </group>
      {/* beetroot curry: glossy cubes */}
      <group position={[0.5, 0.03, -0.42]}>
        <Scatter count={70} seed={7} radius={[0.17, 0.14]} height={0.06} geometry={cube} size={[0.035, 0.035, 0.035]}
          colors={["#5e1430", "#6e1b38", "#4f0f27"]} roughness={0.25} rise={0.3} />
      </group>
      <Papadam position={[-0.95, 0.12, -0.38]} rotation={[-Math.PI / 2 + 0.5, 0.2, 0.3]} />
      <FriedChilli position={[0.12, 0.05, -0.58]} rotation={[0, 0.6, 0]} />
      <FriedChilli position={[0.2, 0.05, -0.5]} rotation={[0, -0.4, 0]} />
    </group>
  );
}
