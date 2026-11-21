// Shared scroll state between the DOM (Lenis) and the 3D scene.
// `target` is set from the page scroll; `progress` is the smoothed value the camera uses.
export const journey = {
  target: 0,
  progress: 0,
  reducedMotion: false,
};

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
