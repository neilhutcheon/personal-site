// Pure disc-golf flight model used by the interactive fairway.
// Coordinates are SVG units in a 600x320 top-down fairway; the disc flies toward +x.

export type Point = { x: number; y: number };

export type Flight = {
  start: Point;
  cp1: Point;
  cp2: Point;
  end: Point;
};

export type ThrowResult = "chains" | "circle" | "fairway" | "rough";

export const FAIRWAY = { width: 600, height: 320 } as const;
export const TEE: Point = { x: 44, y: 180 };
export const BASKET: Point = { x: 536, y: 112 };

/** Feet per SVG unit, so the tee-to-basket hole plays roughly 300 ft. */
export const FEET_PER_UNIT = 0.6;
export const CHAINS_RADIUS = 16;
export const CIRCLE_RADIUS = 55;

export const POWER_RANGE = { min: 0, max: 100 } as const;
export const ANGLE_RANGE = { min: -40, max: 40 } as const;

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/**
 * Build a cubic Bézier flight path.
 *
 * @param power 0–100, maps to carry distance.
 * @param angle -40 (hard hyzer) … +40 (hard anhyzer), in degrees of release angle.
 * @param jitter small random lateral wobble in SVG units (0 for deterministic flights).
 */
export function computeFlight(power: number, angle: number, jitter = 0): Flight {
  const p = clamp(power, POWER_RANGE.min, POWER_RANGE.max);
  const a = clamp(angle, ANGLE_RANGE.min, ANGLE_RANGE.max);

  const distance = 180 + p * 4.3;
  // Reason: a right-hand backhand naturally fades left (-y) at the end of its flight,
  // so a neutral release still finishes slightly left; anhyzer pushes it right (+y).
  const fade = -12 - p * 0.08;
  const lateral = a * 2.2 + fade + jitter;

  // Anhyzer releases turn out early before fading; hyzer releases hook late.
  const earlyTurn = a > 0 ? a * 1.4 : a * 0.3;

  const start = { ...TEE };
  const end = { x: start.x + distance, y: start.y + lateral };
  const cp1 = { x: start.x + distance * 0.35, y: start.y + earlyTurn * 0.6 };
  const cp2 = { x: start.x + distance * 0.72, y: start.y + earlyTurn + lateral * 0.35 };

  return { start, cp1, cp2, end };
}

/** Point on the flight path at t ∈ [0, 1]. */
export function pointOnFlight(f: Flight, t: number): Point {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return {
    x: a * f.start.x + b * f.cp1.x + c * f.cp2.x + d * f.end.x,
    y: a * f.start.y + b * f.cp1.y + c * f.cp2.y + d * f.end.y,
  };
}

/** The first `t` fraction of a flight as its own cubic (de Casteljau split), used for the aim line. */
export function truncateFlight(f: Flight, t: number): Flight {
  const lerp = (a: Point, b: Point, k: number): Point => ({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k });
  const k = Math.min(1, Math.max(0, t));
  const ab = lerp(f.start, f.cp1, k);
  const bc = lerp(f.cp1, f.cp2, k);
  const cd = lerp(f.cp2, f.end, k);
  const abc = lerp(ab, bc, k);
  const bcd = lerp(bc, cd, k);
  return { start: f.start, cp1: ab, cp2: abc, end: lerp(abc, bcd, k) };
}

export function flightToPath(f: Flight): string {
  const r = (n: number) => n.toFixed(1);
  return `M${r(f.start.x)} ${r(f.start.y)} C${r(f.cp1.x)} ${r(f.cp1.y)} ${r(f.cp2.x)} ${r(f.cp2.y)} ${r(f.end.x)} ${r(f.end.y)}`;
}

export function scoreThrow(end: Point): { result: ThrowResult; feetFromBasket: number } {
  const dist = Math.hypot(end.x - BASKET.x, end.y - BASKET.y);
  const feetFromBasket = Math.round(dist * FEET_PER_UNIT);

  if (dist <= CHAINS_RADIUS) return { result: "chains", feetFromBasket: 0 };
  if (dist <= CIRCLE_RADIUS) return { result: "circle", feetFromBasket };

  const outOfBounds = end.y < 18 || end.y > FAIRWAY.height - 18 || end.x > FAIRWAY.width - 8;
  return { result: outOfBounds ? "rough" : "fairway", feetFromBasket };
}
