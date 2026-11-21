"use client";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import * as THREE from "three";
import { journey, smoothstep } from "@/lib/journey";
import { makeCurryMaterial, makeFireMaterial, makeFlameMaterial, makeGlowMaterial } from "./shaders";
import { clayMaps, stoneMaps, woodMaps } from "./textures";
import { ClayBowl, Hopper, LeafMeal } from "./Food";

const CLAY = "#7a4026";

/* ── Clay oil lamp (pahana) ───────────────────────────────── */
export function Lamp({
  position,
  litFrom,
  litTo,
}: {
  position: [number, number, number];
  litFrom?: number; // journey progress at which this lamp starts to light (omit = always lit)
  litTo?: number;
}) {
  const flame = useMemo(() => makeFlameMaterial(), []);
  const glow = useMemo(() => makeGlowMaterial("#ffb347", 0.9), []);
  const flameRef = useRef<THREE.Group>(null);
  const light = useRef<THREE.PointLight>(null);
  const clay = clayMaps();

  const profile = useMemo(
    () =>
      [
        [0, 0],
        [0.07, 0.0],
        [0.09, 0.02],
        [0.1, 0.04],
        [0.16, 0.07],
        [0.22, 0.1],
        [0.24, 0.14],
        [0.21, 0.15],
        [0.15, 0.12],
        [0.0, 0.11],
      ].map(([x, y]) => new THREE.Vector2(x, y)),
    []
  );

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const lit = litFrom === undefined ? 1 : smoothstep(litFrom, litTo ?? litFrom + 0.05, journey.progress);
    flame.uniforms.uTime.value = t;
    flame.uniforms.uLit.value = lit;
    glow.uniforms.uStrength.value = 0.9 * lit;
    const flicker = journey.reducedMotion ? 1 : 0.85 + Math.sin(t * 13) * 0.05 + Math.sin(t * 7.3) * 0.08;
    if (flameRef.current) flameRef.current.scale.setScalar(Math.max(0.001, lit) * flicker);
    if (light.current) light.current.intensity = 2.2 * lit * flicker;
  });

  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <latheGeometry args={[profile, 40]} />
        <meshStandardMaterial map={clay.map} bumpMap={clay.bump} bumpScale={1.2} roughness={0.85} side={THREE.DoubleSide} />
      </mesh>
      {/* oil */}
      <mesh position={[0, 0.125, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.17, 32]} />
        <meshStandardMaterial color="#3a2408" roughness={0.15} metalness={0.2} />
      </mesh>
      {/* wick on the spout */}
      <mesh position={[0.2, 0.15, 0]} rotation={[0, 0, -0.6]}>
        <cylinderGeometry args={[0.008, 0.01, 0.06, 6]} />
        <meshStandardMaterial color="#2a1a10" />
      </mesh>
      <group ref={flameRef} position={[0.215, 0.18, 0]}>
        <mesh material={flame} scale={[0.035, 0.09, 0.035]} position={[0, 0.03, 0]}>
          <sphereGeometry args={[1, 24, 24]} />
        </mesh>
        <Billboard>
          <mesh material={glow} scale={0.55}>
            <planeGeometry />
          </mesh>
        </Billboard>
      </group>
      <pointLight ref={light} position={[0.215, 0.3, 0]} color="#ffa040" distance={6} decay={1.6} />
    </group>
  );
}

/* ── Hearth: three stones, firewood, fire and the clay pot ── */
export function Hearth({ position }: { position: [number, number, number] }) {
  const fire = useMemo(() => makeFireMaterial(), []);
  const curry = useMemo(() => makeCurryMaterial(), []);
  const light = useRef<THREE.PointLight>(null);
  const clay = clayMaps();
  const stone = stoneMaps();
  const wood = woodMaps();

  const fireGeo = useMemo(() => {
    const n = 260;
    const pos = new Float32Array(n * 3);
    const seed = new Float32Array(n);
    const speed = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = Math.random() * 0.32;
      pos.set([Math.cos(a) * r, 0.05, Math.sin(a) * r], i * 3);
      seed[i] = Math.random();
      speed[i] = 0.6 + Math.random() * 0.9;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    g.setAttribute("aSpeed", new THREE.BufferAttribute(speed, 1));
    return g;
  }, []);

  const potProfile = useMemo(
    () =>
      [
        [0.0, 0.0],
        [0.3, 0.02],
        [0.55, 0.13],
        [0.7, 0.34],
        [0.68, 0.58],
        [0.56, 0.75],
        [0.5, 0.82],
        [0.56, 0.88],
        [0.6, 0.93],
        [0.54, 0.95],
        [0.49, 0.9],
        [0.46, 0.84],
        [0.5, 0.76],
        [0.63, 0.58],
      ].map(([x, y]) => new THREE.Vector2(x, y)),
    []
  );

  useFrame(({ clock, gl }) => {
    const t = clock.elapsedTime;
    // the guiding flame lights the hearth as it arrives
    const lit = smoothstep(0.38, 0.5, journey.progress);
    fire.uniforms.uTime.value = t;
    fire.uniforms.uIntensity.value = lit;
    fire.uniforms.uPixel.value = gl.getPixelRatio() * 4;
    curry.uniforms.uTime.value = journey.reducedMotion ? 0 : t;
    if (light.current) light.current.intensity = (6 + Math.sin(t * 9) * 0.8) * lit;
  });

  return (
    <group position={position}>
      {/* three hearth stones (lip gal) */}
      {[0, 1, 2].map((i) => {
        const a = (i / 3) * Math.PI * 2 + 0.4;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.55, 0.16, Math.sin(a) * 0.55]} rotation={[0.3 * i, a, 0.2]} scale={[0.26, 0.22, 0.24]} castShadow>
            <dodecahedronGeometry args={[1, 1]} />
            <meshStandardMaterial map={stone.map} bumpMap={stone.bump} bumpScale={3} roughness={0.95} />
          </mesh>
        );
      })}
      {/* firewood */}
      {[-0.5, 0.3, 1.2].map((r, i) => (
        <mesh key={i} position={[Math.cos(r) * 0.55, 0.06, Math.sin(r) * 0.55]} rotation={[0, -r, Math.PI / 2 - 0.15]}>
          <cylinderGeometry args={[0.05, 0.06, 0.9, 9]} />
          <meshStandardMaterial bumpMap={stone.bump} bumpScale={4} color="#3b2618" roughness={1} />
        </mesh>
      ))}
      <points geometry={fireGeo} material={fire} />
      <pointLight ref={light} position={[0, 0.35, 0]} color="#ff7a1a" distance={9} decay={1.5} />
      {/* soft warm fill so the clay texture reads */}
      <pointLight position={[1.6, 1.9, 1.8]} intensity={5 } color="#ffb070" distance={6} decay={1.3} />

      {/* clay pot (hatti) */}
      <group position={[0, 0.32, 0]}>
        <mesh castShadow receiveShadow>
          <latheGeometry args={[potProfile, 64]} />
          <meshStandardMaterial map={clay.map} bumpMap={clay.bump} bumpScale={1.5} roughness={0.88} side={THREE.DoubleSide} />
        </mesh>
        <mesh material={curry} position={[0, 0.8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.5, 48]} />
        </mesh>
      </group>
    </group>
  );
}

/* ── The guest table at the end of the journey ───────────── */
export function Table({ position }: { position: [number, number, number] }) {
  const wood = woodMaps();
  return (
    <group position={position}>
      <mesh position={[0, 0.74, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.2, 0.07, 1.5]} />
        <meshStandardMaterial map={wood.map} bumpMap={wood.bump} bumpScale={0.8} roughness={0.55} />
      </mesh>
      {[
        [-1.45, -0.6],
        [1.45, -0.6],
        [-1.45, 0.6],
        [1.45, 0.6],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.37, z]}>
          <boxGeometry args={[0.08, 0.74, 0.08]} />
          <meshStandardMaterial map={wood.map} color="#9a8070" />
        </mesh>
      ))}
      <LeafMeal position={[-0.9, 0.78, 0.05]} scale={0.28} showAfter={0.84} grains={700} />
      <LeafMeal position={[0.9, 0.78, 0.05]} scale={0.28} showAfter={0.84} grains={700} />
      <Hopper position={[0.12, 0.78, 0.42]} scale={0.42} />
      <Hopper position={[0.42, 0.78, 0.5]} scale={0.42} />
      <ClayBowl position={[0.35, 0.775, -0.35]} fill="#6e2612" scale={0.9} />
      <ClayBowl position={[-0.5, 0.775, -0.45]} fill="#d9a02a" scale={0.75} />
      <Lamp position={[-0.2, 0.775, -0.25]} litFrom={0.9} litTo={0.97} />
    </group>
  );
}

/* ── The guiding ember: leaves the first lamp and leads the camera ── */
export function Ember({ getPosition }: { getPosition: (out: THREE.Vector3) => number }) {
  const ref = useRef<THREE.Group>(null);
  const glow = useMemo(() => makeGlowMaterial("#ffaa33", 1), []);
  const light = useRef<THREE.PointLight>(null);
  const v = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock }) => {
    const vis = getPosition(v);
    const t = clock.elapsedTime;
    if (!journey.reducedMotion) v.y += Math.sin(t * 2.1) * 0.04;
    ref.current?.position.copy(v);
    const pulse = 1 + Math.sin(t * 11) * 0.08;
    ref.current?.scale.setScalar(Math.max(0.001, vis) * pulse);
    if (light.current) light.current.intensity = 3 * vis;
  });

  return (
    <group ref={ref}>
      <Billboard>
        <mesh material={glow} scale={0.32}>
          <planeGeometry />
        </mesh>
      </Billboard>
      <pointLight ref={light} color="#ffb04a" distance={7} decay={1.4} />
    </group>
  );
}
