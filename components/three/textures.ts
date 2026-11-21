import * as THREE from "three";

/* Realistic surface textures painted in code (no image downloads).
   Each returns colour + bump (and sometimes alpha) maps for MeshStandardMaterial. */

// ── tiny seeded value-noise + fbm ─────────────────────────────
function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}
function makeNoise(seed = 1) {
  const r = rng(seed);
  const N = 256;
  const perm = new Uint8Array(N * 2);
  const vals = new Float32Array(N);
  for (let i = 0; i < N; i++) { perm[i] = i; vals[i] = r(); }
  for (let i = N - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [perm[i], perm[j]] = [perm[j], perm[i]]; }
  for (let i = 0; i < N; i++) perm[i + N] = perm[i];
  const h = (x: number, y: number) => vals[perm[(perm[x & 255] + y) & 511] & 255];
  const s = (t: number) => t * t * (3 - 2 * t);
  const noise = (x: number, y: number) => {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = x - xi, yf = y - yi;
    const a = h(xi, yi), b = h(xi + 1, yi), c = h(xi, yi + 1), d = h(xi + 1, yi + 1);
    const u = s(xf), v = s(yf);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };
  // tileable in x when period is given (for lathe wrap-around)
  const fbm = (x: number, y: number, oct = 5, period = 0) => {
    let sum = 0, amp = 0.5, f = 1;
    for (let i = 0; i < oct; i++) {
      if (period) {
        const p = period * f;
        const xx = x * f, yy = y * f;
        const t = (xx % p) / p;
        sum += amp * (noise(xx % p, yy) * (1 - t) + noise((xx % p) - p, yy) * t);
      } else sum += amp * noise(x * f, y * f);
      amp *= 0.5; f *= 2;
    }
    return sum;
  };
  return { noise, fbm, rand: r };
}

type Painter = (u: number, v: number, x: number, y: number) => [number, number, number, number?];

function paint(size: number, fn: Painter, color = true) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(size, size);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const [r, g, b, a = 1] = fn(x / size, 1 - y / size, x, y);
      const i = (y * size + x) * 4;
      img.data[i] = r * 255; img.data[i + 1] = g * 255; img.data[i + 2] = b * 255; img.data[i + 3] = a * 255;
    }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 4;
  return tex;
}

const mix = (a: number[], b: number[], t: number) => a.map((v, i) => v + (b[i] - v) * t) as [number, number, number];
const hex = (h: string) => { const c = new THREE.Color(h); return [c.r, c.g, c.b]; };
const sat = (t: number) => Math.min(1, Math.max(0, t));

const cache = new Map<string, unknown>();
function memo<T>(key: string, make: () => T): T {
  if (!cache.has(key)) cache.set(key, make());
  return cache.get(key) as T;
}

/* Fired clay (hatti / pahana). Lathe UVs: u = around, v = bottom → rim. */
export const clayMaps = () =>
  memo("clay", () => {
    const n = makeNoise(7);
    const base = hex("#9a5534"), light = hex("#b8714a"), dark = hex("#6d3520"), soot = hex("#1e1410");
    const map = paint(512, (u, v) => {
      const m = n.fbm(u * 8, v * 8, 5, 8);
      const streak = n.fbm(u * 40, v * 3, 3, 40);
      let c = mix(dark, light, sat(m * 1.4 - 0.15));
      c = mix(c, base, 0.35);
      c = mix(c, dark, sat(streak - 0.55) * 0.8);
      // soot from the wood fire, patchy, climbing up from the base
      const sootAmt = sat((0.42 - v + (n.fbm(u * 6, v * 4, 4, 6) - 0.5) * 0.35) * 3.2);
      c = mix(c, soot, sootAmt * 0.92);
      const speck = n.noise(u * 300, v * 300) > 0.93 ? 0.75 : 1;
      return [c[0] * speck, c[1] * speck, c[2] * speck];
    });
    const bump = paint(512, (u, v) => {
      const b = n.fbm(u * 60, v * 60, 4, 60) * 0.6 + n.fbm(u * 6, v * 30, 3, 6) * 0.4;
      // faint throwing rings from the potter's wheel
      const ring = 0.5 + 0.5 * Math.sin(v * 220 + n.noise(u * 10, v * 10) * 3);
      const g = b * 0.8 + ring * 0.2;
      return [g, g, g];
    }, false);
    return { map, bump };
  });

/* Stained wooden table top. */
export const woodMaps = () =>
  memo("wood", () => {
    const n = makeNoise(11);
    const a = hex("#4a2414"), b = hex("#6e3a20"), c2 = hex("#341709");
    const map = paint(512, (u, v) => {
      const warp = n.fbm(u * 2, v * 6, 4) * 6;
      const ring = 0.5 + 0.5 * Math.sin((v * 28 + warp) * Math.PI);
      const fine = n.noise(u * 200, v * 8);
      let c = mix(a, b, ring * 0.7 + fine * 0.3);
      c = mix(c, c2, sat(n.fbm(u * 3, v * 3) - 0.55) * 1.5);
      return c;
    });
    const bump = paint(512, (u, v) => {
      const g = 0.5 + 0.5 * Math.sin((v * 28 + n.fbm(u * 2, v * 6, 4) * 6) * Math.PI) * 0.6 + n.noise(u * 300, v * 10) * 0.2;
      return [g, g, g];
    }, false);
    map.repeat.set(1, 1);
    return { map, bump };
  });

/* Rough granite for the three hearth stones. */
export const stoneMaps = () =>
  memo("stone", () => {
    const n = makeNoise(3);
    const map = paint(256, (u, v) => {
      const m = n.fbm(u * 10, v * 10);
      const g = 0.18 + m * 0.22 + (n.noise(u * 120, v * 120) > 0.85 ? 0.12 : 0);
      return [g * 1.05, g, g * 0.95];
    });
    const bump = paint(256, (u, v) => { const g = n.fbm(u * 24, v * 24); return [g, g, g]; }, false);
    return { map, bump };
  });

/* Banana leaf with veins and a midrib; alpha gives the torn leaf outline. */
export const leafMaps = () =>
  memo("leaf", () => {
    const n = makeNoise(5);
    const deep = hex("#2f6b2c"), bright = hex("#5fa046"), rib = hex("#c9d68e"), dry = hex("#9a9446");
    const map = paint(1024, (u, v) => {
      const across = Math.abs(v - 0.5) * 2;
      const veins = Math.pow(Math.abs(Math.sin((u + across * 0.16) * 260)), 18);
      let c = mix(bright, deep, across * 0.7 + n.fbm(u * 4, v * 4) * 0.3);
      c = mix(c, c.map((x) => x * 1.3) as [number, number, number], veins * 0.6);
      c = mix(c, rib, sat(1 - across / 0.04));
      c = mix(c, dry, sat(n.fbm(u * 3, v * 9) - 0.68) * 2);
      return c;
    });
    const alpha = paint(512, (u, v) => {
      const across = Math.abs(v - 0.5) * 2;
      const ends = sat(u / 0.05) * sat((1 - u) / 0.05);
      // soft, uneven edge like a real cut leaf
      const edge = 0.9 + (n.fbm(u * 18, 2.5, 3) - 0.5) * 0.14;
      const a = across < Math.min(ends, edge) ? 1 : 0;
      return [a, a, a];
    }, false);
    const bump = paint(512, (u, v) => { const across = Math.abs(v - 0.5) * 2; const g = 0.5 + Math.pow(Math.abs(Math.sin((u + across * 0.16) * 260)), 12) * 0.5; return [g, g, g]; }, false);
    return { map, alpha, bump };
  });

/* Woven reed mat (pedura) with a red border band. */
export const matMaps = () =>
  memo("mat", () => {
    const n = makeNoise(9);
    const a = hex("#c9a66a"), b = hex("#9c7b4a"), red = hex("#8e2318");
    const map = paint(512, (u, v) => {
      const gx = u * 96, gy = v * 62;
      const over = (Math.floor(gx) + Math.floor(gy)) % 2;
      const strand = over ? Math.sin((gx % 1) * Math.PI) : Math.sin((gy % 1) * Math.PI);
      let c = mix(b, a, strand * 0.8 + n.noise(u * 90, v * 90) * 0.2);
      const band = (v > 0.07 && v < 0.12) || (v > 0.88 && v < 0.93);
      if (band) c = mix(c, red, 0.75);
      return c;
    });
    const bump = paint(512, (u, v) => {
      const gx = u * 96, gy = v * 62;
      const over = (Math.floor(gx) + Math.floor(gy)) % 2;
      const g = over ? Math.sin((gx % 1) * Math.PI) : Math.sin((gy % 1) * Math.PI) * 0.6;
      return [g, g, g];
    }, false);
    return { map, bump };
  });

/* Fried papadam: pale gold with blistered bubbles. */
export const papadamMaps = () =>
  memo("papadam", () => {
    const n = makeNoise(13);
    const map = paint(512, (u, v) => {
      const bub = n.fbm(u * 40, v * 40, 3);
      return mix(hex("#f3e2ad"), hex("#cf9f55"), sat((bub - 0.5) * 2.2) * 0.8 + n.fbm(u * 5, v * 5) * 0.15);
    });
    const bump = paint(512, (u, v) => { const g = Math.pow(n.fbm(u * 40, v * 40, 3), 2); return [g, g, g]; }, false);
    return { map, bump };
  });

/* Egg hopper: lacy, crisp golden edge fading to soft white centre. Lathe v = centre → rim. */
export const hopperMaps = () =>
  memo("hopper", () => {
    const n = makeNoise(17);
    const map = paint(512, (u, v) => {
      const lace = n.fbm(u * 50, v * 25, 4, 50);
      const brown = sat((v - 0.45) * 2.2) + (lace - 0.5) * 0.6;
      return mix(hex("#f4ead2"), hex("#b5732c"), sat(brown));
    });
    const bump = paint(512, (u, v) => { const g = n.fbm(u * 80, v * 40, 3, 80); return [g, g, g]; }, false);
    return { map, bump };
  });

/* Small bumpy texture for curries and gravies. */
export const gravyBump = () =>
  memo("gravy", () => {
    const n = makeNoise(21);
    return paint(256, (u, v) => { const g = n.fbm(u * 16, v * 16); return [g, g, g]; }, false);
  });

/* Deterministic random for placing grains and chunks. */
export const seeded = (seed: number) => makeNoise(seed).rand;
