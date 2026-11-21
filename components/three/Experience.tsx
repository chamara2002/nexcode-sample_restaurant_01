"use client";
import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";
import World from "./World";

export default function Experience() {
  const [wash, setWash] = useState<HTMLElement | null>(null);
  const [mobile, setMobile] = useState(false);
  useEffect(() => setMobile(window.matchMedia("(max-width: 760px)").matches), []);

  return (
    <>
      <div className="scene" aria-hidden="true">
        <Canvas
          shadows
          dpr={mobile ? [1, 1.5] : [1, 2]}
          camera={{ fov: mobile ? 60 : 45, near: 0.05, far: 200, position: [0.55, 0.42, 1.1] }}
          gl={{ antialias: !mobile, powerPreference: "high-performance" }}
        >
          <Suspense fallback={null}>
            <World washEl={wash} />
          </Suspense>
        </Canvas>
      </div>
      <div ref={setWash} className="wash" aria-hidden="true" />
    </>
  );
}
