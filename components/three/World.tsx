"use client";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { journey, smoothstep } from "@/lib/journey";
import { Ember, Hearth, Lamp, Table } from "./Props";
import { LeafMeal } from "./Food";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";

/* World layout along -Z. Each stop matches one chapter in lib/content.ts. */
const LAMP: [number, number, number] = [0, 0, 0];
const HEARTH: [number, number, number] = [0, 0, -25];
const LEAF: [number, number, number] = [0, 0, -45];
const TABLE: [number, number, number] = [0, 0, -60];

// camera position and look-at target for each chapter (7 stops, evenly spread over the scroll)
const CAM = [
  [0.35, 0.62, 1.45], // 1 lamp, close up
  [0.4, 2.2, 1.6], // 2 flame rises
  [-0.5, 5.8, -7], // 3 inside the spice air
  [1.2, 1.7, -21.6], // 4 the hearth
  [0, 2.05, -25.02], // 5 straight down into the pot
  [1.0, 2.4, -42.2], // 6 the leaf
  [2.4, 1.9, -57.2], // 7 the table
].map((p) => new THREE.Vector3(...p));
const LOOK = [
  [-0.32, 0.22, 0],
  [0.1, 4.2, -5],
  [0, 4.2, -18],
  [0, 0.7, -25],
  [0, 1.1, -25.0],
  [0.75, 0.1, -45],
  [-0.2, 0.95, -60.25],
].map((p) => new THREE.Vector3(...p));

const camCurve = new THREE.CatmullRomCurve3(CAM, false, "centripetal");
const lookCurve = new THREE.CatmullRomCurve3(LOOK, false, "centripetal");

function CameraRig({ washEl }: { washEl: HTMLElement | null }) {
  const { camera, size } = useThree();
  const look = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, dt) => {
    const k = journey.reducedMotion ? 1 : 1 - Math.pow(0.0015, dt);
    journey.progress += (journey.target - journey.progress) * k;
    const p = journey.progress;
    camCurve.getPoint(p, camera.position);
    lookCurve.getPoint(p, look);
    // portrait phones: frame the opening lamp in the upper middle, above the text
    const portrait = size.width / size.height < 0.8;
    if (portrait) {
      const h = 1 - smoothstep(0, 0.12, p);
      look.x += 0.5 * h;
      look.y -= 0.32 * h;
    }
    camera.lookAt(look);

    // turmeric wash: the screen fills with curry as we dive into the pot, then clears on the leaf
    if (washEl) {
      const w = 1 - Math.min(1, Math.abs(p - 0.745) / 0.055);
      washEl.style.opacity = String(Math.max(0, w));
    }
  });
  return null;
}

function Spices() {
  const groups = useMemo(() => {
    const kinds = [
      { n: 70, color: "#8a9a3c", geo: new THREE.SphereGeometry(1, 12, 8), s: [0.07, 0.11, 0.07] }, // cardamom
      { n: 120, color: "#1e1712", geo: new THREE.SphereGeometry(1, 8, 6), s: [0.035, 0.035, 0.035] }, // pepper
      { n: 45, color: "#8a4a22", geo: new THREE.CylinderGeometry(1, 1, 1, 10, 1), s: [0.04, 0.5, 0.04] }, // cinnamon quills
      { n: 40, color: "#a51d12", geo: new THREE.ConeGeometry(1, 1, 8), s: [0.05, 0.38, 0.05] }, // dried chilli
      { n: 70, color: "#2f6b3a", geo: new THREE.SphereGeometry(1, 8, 4), s: [0.09, 0.008, 0.035] }, // curry leaves
    ];
    return kinds.map((k) => {
      const data = Array.from({ length: k.n }, () => ({
        p: (() => {
          const v = new THREE.Vector3((Math.random() - 0.5) * 12, 1.2 + Math.random() * 8, -4 - Math.random() * 16);
          if (Math.abs(v.x) < 1.6) v.x = Math.sign(v.x || 1) * (1.6 + Math.random()); // keep the camera path clear
          return v;
        })(),
        r: new THREE.Euler(Math.random() * 6, Math.random() * 6, Math.random() * 6),
        spin: (Math.random() - 0.5) * 0.6,
        bob: Math.random() * 6,
      }));
      return { ...k, data };
    });
  }, []);

  const refs = useRef<(THREE.InstancedMesh | null)[]>([]);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }) => {
    const t = journey.reducedMotion ? 0 : clock.elapsedTime;
    groups.forEach((g, gi) => {
      const mesh = refs.current[gi];
      if (!mesh) return;
      g.data.forEach((d, i) => {
        dummy.position.set(d.p.x, d.p.y + Math.sin(t * 0.5 + d.bob) * 0.15, d.p.z);
        dummy.rotation.set(d.r.x + t * d.spin, d.r.y + t * d.spin * 0.7, d.r.z);
        dummy.scale.set(g.s[0], g.s[1], g.s[2]);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
    });
  });

  return (
    <>
      {groups.map((g, i) => (
        <instancedMesh key={i} ref={(m) => { refs.current[i] = m; }} args={[g.geo, undefined, g.n]} frustumCulled={false}>
          <meshStandardMaterial color={g.color} emissive={g.color} emissiveIntensity={0.35} roughness={0.6} side={THREE.DoubleSide} />
        </instancedMesh>
      ))}
    </>
  );
}

function Stars() {
  const geo = useMemo(() => {
    const n = 900;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const y = 8 + Math.random() * 40;
      const r = 40 + Math.random() * 40;
      pos.set([Math.cos(a) * r, y, Math.sin(a) * r - 30], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);
  return (
    <points geometry={geo}>
      <pointsMaterial color="#f1e3b8" size={0.12} sizeAttenuation transparent opacity={0.7} fog={false} />
    </points>
  );
}

export default function World({ washEl }: { washEl: HTMLElement | null }) {
  const { scene } = useThree();
  useLayoutEffect(() => {
    scene.background = new THREE.Color("#141a3a");
    scene.fog = new THREE.FogExp2("#141a3a", 0.045);
  }, [scene]);

  // ember follows a point just ahead of the camera; starts inside the first lamp, ends in the table lamp
  const lead = useMemo(() => new THREE.Vector3(), []);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const side = useMemo(() => new THREE.Vector3(), []);
  const up = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const lampFlame = useMemo(() => new THREE.Vector3(0.215, 0.21, 0), []);
  const tableFlame = useMemo(() => new THREE.Vector3(TABLE[0] - 0.2 + 0.215, 0.775 + 0.21, TABLE[2] - 0.25), []);
  const getEmber = (out: THREE.Vector3) => {
    const p = journey.progress;
    camCurve.getPoint(p, tmp);
    lookCurve.getPoint(p, lead);
    lead.lerp(tmp, 0.45);
    const dist = lead.distanceTo(tmp);
    side.subVectors(lead, tmp).normalize().cross(up).normalize();
    lead.addScaledVector(side, dist * 0.32).addScaledVector(up, dist * 0.16);
    out.copy(lampFlame).lerp(lead, smoothstep(0.0, 0.12, p));
    out.lerp(tableFlame, smoothstep(0.88, 0.97, p));
    // hidden at rest in the lamp, and once it has lit the table lamp
    return smoothstep(0.015, 0.08, p) * (1 - smoothstep(0.95, 0.985, p));
  };

  useEffect(() => () => { scene.fog = null; }, [scene]);
  const leafTarget = useMemo(() => new THREE.Object3D(), []);
  const tableTarget = useMemo(() => new THREE.Object3D(), []);

  return (
    <>
      <CameraRig washEl={washEl} />
      <ambientLight intensity={0.25} color="#6f74b8" />
      <hemisphereLight args={["#4a52a0", "#2a1a24", 0.6]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -30]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#2a2238" roughness={1} />
      </mesh>
      <Stars />
      <Lamp position={LAMP} />
      <Ember getPosition={getEmber} />
      <Spices />
      <pointLight position={[0, 7, -12]} intensity={14} color="#ffc070" distance={18} decay={1.2} />
      <Hearth position={HEARTH} />
      <LeafMeal position={LEAF} showAfter={0.6} />
      <spotLight position={[1.5, 4, -43.5]} angle={0.75} penumbra={0.8} intensity={30} color="#ffd9a0"
        distance={10} decay={1.4} castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0004} target={leafTarget} />
      <primitive object={leafTarget} position={[0, 0, -45]} />
      <spotLight position={[-0.6, 3.6, -59]} angle={0.7} penumbra={0.9} intensity={18} color="#ffc27a" distance={9} decay={1.4}
        castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0004} target={tableTarget} />
      <primitive object={tableTarget} position={[0, 0.75, -60]} />
      <ContactShadows position={[0, 0.012, -25]} scale={4} blur={2.2} opacity={0.75} far={1.5} frames={1} />
      {/* soft reflections for the glossy curries, clay and leaf (no HDRI download needed) */}
      <Environment resolution={64} frames={1} environmentIntensity={0.35}>
        <Lightformer form="ring" intensity={1.6} color="#ffb36b" scale={6} position={[3, 4, 2]} />
        <Lightformer form="rect" intensity={0.9} color="#7f88d6" scale={[10, 3, 1]} position={[-4, 3, -3]} />
        <Lightformer form="rect" intensity={0.4} color="#ffd9a0" scale={[6, 6, 1]} position={[0, -3, 0]} rotation-x={Math.PI / 2} />
      </Environment>
      <Table position={TABLE} />
    </>
  );
}
