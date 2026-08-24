// 3D Carousel position engine for the gallery's Carousel view mode.
// Geometry is locked to docs/3d-carousel reference spec — Center/Near/Mid/Far/
// Hidden tiers by signed distance from the active card. Do not tweak these
// numbers without a new design request; see the spec's "Final Rule".

export interface CarouselState {
  translateXPct: number;
  rotateYDeg: number;
  scale: number;
  opacity: number;
  brightness: number;
  zIndex: number;
  pointerEvents: "auto" | "none";
}

export function getCarouselState(distance: number): CarouselState {
  const dir = Math.sign(distance);
  const abs = Math.abs(distance);

  if (abs === 0) {
    return { translateXPct: 0, rotateYDeg: 0, scale: 1, opacity: 1, brightness: 1, zIndex: 30, pointerEvents: "auto" };
  }
  if (abs === 1) {
    return { translateXPct: dir * 56, rotateYDeg: dir * -34, scale: 0.74, opacity: 0.9, brightness: 0.72, zIndex: 26, pointerEvents: "auto" };
  }
  if (abs === 2) {
    return { translateXPct: dir * 94, rotateYDeg: dir * -45, scale: 0.6, opacity: 0.55, brightness: 0.5, zIndex: 22, pointerEvents: "auto" };
  }
  if (abs === 3) {
    return { translateXPct: dir * 120, rotateYDeg: dir * -52, scale: 0.52, opacity: 0.3, brightness: 0.5, zIndex: 18, pointerEvents: "auto" };
  }
  // Hidden — same geometry as Far, just invisible and inert.
  return { translateXPct: dir * 120, rotateYDeg: dir * -52, scale: 0.52, opacity: 0, brightness: 0.5, zIndex: 14, pointerEvents: "none" };
}

/** Shortest signed distance from `index` to `activeIndex` among `count`
 * items, wrapping around so the carousel loops in both directions. */
export function shortestDistance(index: number, activeIndex: number, count: number): number {
  let d = index - activeIndex;
  if (d > count / 2) d -= count;
  if (d < -count / 2) d += count;
  return d;
}
