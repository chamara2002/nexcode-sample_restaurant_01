import * as THREE from "three";

// Soft additive glow used for flames and the guiding ember (drawn on a camera-facing plane).
export function makeGlowMaterial(color: string, strength = 1) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: new THREE.Color(color) }, uStrength: { value: strength } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uStrength;
      varying vec2 vUv;
      void main() {
        float d = length(vUv - 0.5) * 2.0;
        float core = smoothstep(0.35, 0.0, d);
        float halo = pow(max(0.0, 1.0 - d), 3.0);
        vec3 col = mix(uColor, vec3(1.0, 0.95, 0.8), core);
        gl_FragColor = vec4(col, (halo * 0.6 + core) * uStrength);
      }`,
  });
}

// Teardrop flame body: bright core, orange edges, flickers with time.
export function makeFlameMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uLit: { value: 1 } },
    vertexShader: /* glsl */ `
      uniform float uTime;
      varying vec3 vNormal;
      varying float vY;
      void main() {
        vec3 p = position;
        vY = p.y;
        // taper to a point and sway near the tip
        float tip = smoothstep(-0.2, 1.0, p.y);
        p.xz *= mix(1.0, 0.15, tip);
        p.x += sin(uTime * 7.0 + p.y * 3.0) * 0.12 * tip;
        p.z += cos(uTime * 5.3) * 0.08 * tip;
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform float uLit;
      varying vec3 vNormal;
      varying float vY;
      void main() {
        float facing = abs(vNormal.z);
        vec3 core = vec3(1.0, 0.93, 0.7);
        vec3 edge = vec3(0.98, 0.45, 0.08);
        vec3 col = mix(edge, core, pow(facing, 2.0) * (1.0 - smoothstep(0.2, 1.0, vY)));
        float a = pow(facing, 1.5) * uLit;
        gl_FragColor = vec4(col, a);
      }`,
  });
}

// Rising fire particles for the hearth.
export function makeFireMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uIntensity: { value: 0 }, uPixel: { value: 1 } },
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uIntensity;
      uniform float uPixel;
      attribute float aSeed;
      attribute float aSpeed;
      varying float vLife;
      void main() {
        float life = fract(uTime * aSpeed + aSeed);
        vLife = life;
        vec3 p = position;
        float h = life * 1.1 * (0.4 + 0.6 * uIntensity);
        p.xz *= (1.0 - life * 0.8);
        p.x += sin(uTime * 3.0 + aSeed * 20.0) * 0.06 * life;
        p.y += h;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = (90.0 * (1.0 - life) + 20.0) * uIntensity * uPixel / -mv.z;
      }`,
    fragmentShader: /* glsl */ `
      varying float vLife;
      void main() {
        float d = length(gl_PointCoord - 0.5) * 2.0;
        float a = smoothstep(1.0, 0.0, d);
        vec3 col = mix(vec3(1.0, 0.85, 0.4), vec3(0.85, 0.15, 0.05), vLife);
        gl_FragColor = vec4(col, a * (1.0 - vLife) * 0.9);
      }`,
  });
}

// Curry surface inside the clay pot: slowly swirling turmeric, chilli oil and coconut milk.
export function makeCurryMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      varying vec2 vUv;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float noise(vec2 p) {
        vec2 i = floor(p), f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
      }
      float fbm(vec2 p) { float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.0; a *= 0.5; } return v; }
      void main() {
        vec2 c = vUv - 0.5;
        float r = length(c);
        float ang = atan(c.y, c.x) + uTime * 0.25 + r * 6.0;
        vec2 sw = vec2(cos(ang), sin(ang)) * r * 4.0;
        float n = fbm(sw + uTime * 0.1);
        vec3 turmeric = vec3(0.86, 0.55, 0.08);
        vec3 chilli = vec3(0.62, 0.16, 0.06);
        vec3 coconut = vec3(0.95, 0.86, 0.62);
        vec3 col = mix(chilli, turmeric, smoothstep(0.3, 0.7, n));
        col = mix(col, coconut, smoothstep(0.68, 0.8, fbm(sw * 1.7 - uTime * 0.05)) * 0.6);
        // oil droplets
        float oil = smoothstep(0.82, 0.9, noise(vUv * 30.0 + uTime * 0.2));
        col += vec3(0.35, 0.18, 0.0) * oil;
        col *= 1.0 - smoothstep(0.38, 0.5, r) * 0.6;
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
}

// Banana leaf: veins running out from a pale midrib.
export function makeLeafMaterial() {
  return new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vec3 p = position;
        float across = uv.y - 0.5;
        p.z += abs(across) * abs(across) * 0.6; // edges curl up
        p.z += sin(uv.x * 9.0) * 0.015;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        float across = abs(vUv.y - 0.5) * 2.0;
        // leaf outline: rounded ends
        float ends = smoothstep(0.0, 0.06, vUv.x) * smoothstep(1.0, 0.94, vUv.x);
        if (across > ends) discard;
        float veins = smoothstep(0.88, 1.0, abs(sin((vUv.x + across * 0.18) * 140.0)));
        vec3 deep = vec3(0.10, 0.30, 0.13);
        vec3 bright = vec3(0.22, 0.48, 0.20);
        vec3 col = mix(bright, deep, across * 0.8);
        col = mix(col, col * 1.25, veins * 0.5);
        float rib = smoothstep(0.035, 0.0, across);
        col = mix(col, vec3(0.62, 0.72, 0.42), rib);
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
}

// Woven reed mat (pedura) under the leaf.
export function makeMatMaterial() {
  return new THREE.ShaderMaterial({
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vec2 g = vUv * vec2(22.0, 14.0);
        float wx = smoothstep(0.35, 0.65, fract(g.x)) * (1.0 - smoothstep(0.85, 1.0, fract(g.x)));
        float wy = smoothstep(0.35, 0.65, fract(g.y)) * (1.0 - smoothstep(0.85, 1.0, fract(g.y)));
        float weave = abs(wx - wy);
        float strand = abs(sin(g.x * 3.14159)) * abs(sin(g.y * 3.14159));
        vec3 a = vec3(0.55, 0.42, 0.24);
        vec3 b = vec3(0.42, 0.30, 0.16);
        vec3 col = mix(a, b, weave) * (0.75 + strand * 0.25);
        // woven red border band, as on village mats
        float band = step(0.06, vUv.y) * step(vUv.y, 0.1) + step(0.9, vUv.y) * step(vUv.y, 0.94);
        col = mix(col, vec3(0.55, 0.12, 0.08), band * 0.8);
        float edge = smoothstep(0.0, 0.03, min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y)));
        gl_FragColor = vec4(col * edge, 1.0);
      }`,
  });
}
