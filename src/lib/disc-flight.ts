// Pure disc-golf flight model used by the interactive fairway.
// Coordinates are SVG units in a 600x320 top-down fairway; the disc flies toward +x.

export type Point = { x: number; y: number };

export type Flight = {
  start: Point;
  cp1: Point;
  cp2: Point;
  end: Point;
};

export type ThrowResult = "chains" | "circle" | "fairway" | "rough" | "tree";

export type Tree = { x: number; y: number; r: number };
export type TreeHit = { t: number; point: Point; tree: number };

export const FAIRWAY = { width: 600, height: 320 } as const;
export const TEE: Point = { x: 44, y: 180 };
export const BASKET: Point = { x: 536, y: 112 };

/**
 * Tree canopies, in fairway units. The edge trees frame the hole; the cluster in the
 * middle sits squarely on the straight tee-to-basket line, so a flat throw at default
 * power will hit wood. Going around requires shaping a hyzer or anhyzer and dialing
 * power, and a guardian tree short of the basket punishes the lazy low-side approach.
 */
export const TREES: readonly Tree[] = [
  // Edge trees along the top and bottom of the fairway.
  { x: 90, y: 36, r: 20 }, { x: 150, y: 22, r: 16 }, { x: 230, y: 40, r: 22 }, { x: 330, y: 26, r: 18 }, { x: 420, y: 44, r: 20 },
  { x: 120, y: 300, r: 22 }, { x: 210, y: 286, r: 16 }, { x: 300, y: 304, r: 20 }, { x: 390, y: 290, r: 18 }, { x: 470, y: 302, r: 22 }, { x: 580, y: 250, r: 20 },
  // Mid-fairway cluster on the direct line.
  { x: 262, y: 152, r: 22 }, { x: 292, y: 188, r: 16 }, { x: 232, y: 186, r: 13 },
  // Guardian short of the basket.
  { x: 462, y: 158, r: 20 },
];

/** How close the disc's center can pass to a canopy edge before it's a hit. */
const DISC_RADIUS = 5;

/** Feet per SVG unit, so the tee-to-basket hole plays roughly 300 ft. */
export const FEET_PER_UNIT = 0.6;
export const CHAINS_RADIUS = 16;
export const CIRCLE_RADIUS = 55;

export const POWER_RANGE = { min: 0, max: 100 } as const;
export const ANGLE_RANGE = { min: -40, max: 40 } as const;
export const PAR = 3;

/** Inset from the fairway edge that a lie is pulled back to after going out of bounds. */
const IN_BOUNDS = { x: 12, y: 26 } as const;

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/**
 * Build a cubic Bézier flight path from a lie, aimed at a target.
 *
 * The player always squares up to the basket, so "forward" is the lie→target
 * direction and hyzer/anhyzer push the disc across that line.
 *
 * @param power 0–100, maps to carry distance.
 * @param angle -40 (hard hyzer) … +40 (hard anhyzer), in degrees of release angle.
 * @param jitter small random lateral wobble in SVG units (0 for deterministic flights).
 * @param from where the disc is thrown from; defaults to the tee.
 * @param target what the thrower is facing; defaults to the basket.
 */
export function computeFlight(power: number, angle: number, jitter = 0, from: Point = TEE, target: Point = BASKET): Flight {
  const p = clamp(power, POWER_RANGE.min, POWER_RANGE.max);
  const a = clamp(angle, ANGLE_RANGE.min, ANGLE_RANGE.max);

  // Reason: a low floor lets short putts land near the basket instead of sailing past it.
  const distance = 10 + p * 5.5;
  // Reason: a right-hand backhand naturally fades left at the end of its flight,
  // so a neutral release still finishes slightly left; anhyzer pushes it right.
  const fade = -12 - p * 0.08;
  const lateral = a * 2.2 + fade + jitter;

  // Anhyzer releases turn out early before fading; hyzer releases hook late.
  const earlyTurn = a > 0 ? a * 1.4 : a * 0.3;

  // Unit vectors: forward toward the target, and right-of-forward for lateral drift.
  const dx = target.x - from.x;
  const dy = target.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  const fwd = { x: dx / len, y: dy / len };
  const right = { x: -fwd.y, y: fwd.x };

  const along = (f: number, r: number): Point => ({
    x: from.x + fwd.x * f + right.x * r,
    y: from.y + fwd.y * f + right.y * r,
  });

  const start = { ...from };
  const cp1 = along(distance * 0.35, earlyTurn * 0.6);
  const cp2 = along(distance * 0.72, earlyTurn + lateral * 0.35);
  const end = along(distance, lateral);

  return { start, cp1, cp2, end };
}

/**
 * Where the next throw is taken from. Out-of-bounds discs are brought back
 * inside the fairway edge; everything else is played as it lies.
 */
export function nextLie(end: Point): Point {
  return {
    x: clamp(end.x, IN_BOUNDS.x, FAIRWAY.width - IN_BOUNDS.x),
    y: clamp(end.y, IN_BOUNDS.y, FAIRWAY.height - IN_BOUNDS.y),
  };
}

/** Golf-style name for a finished hole, e.g. "Birdie" or "Double bogey". */
export function scoreName(strokes: number, par: number = PAR): string {
  if (!Number.isFinite(strokes) || strokes < 1) throw new RangeError(`strokes must be >= 1, received ${strokes}`);
  if (strokes === 1) return "Ace";
  const diff = strokes - par;
  if (diff <= -2) return "Eagle";
  if (diff === -1) return "Birdie";
  if (diff === 0) return "Par";
  if (diff === 1) return "Bogey";
  if (diff === 2) return "Double bogey";
  return `+${diff}`;
}

/** Format a running score relative to par: "E", "-1", "+3". */
export function formatToPar(diff: number): string {
  if (diff === 0) return "E";
  return diff > 0 ? `+${diff}` : `${diff}`;
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

/**
 * First tree the disc clips along its flight, or null for a clean line.
 *
 * Reason: the path is sampled rather than solved analytically; 200 samples is far
 * finer than any canopy, and it keeps the check trivially readable.
 * Trees that already overlap the lie are ignored until the disc has left them,
 * so a disc dropped under a canopy can still be thrown out from there.
 */
export function findTreeHit(f: Flight, trees: readonly Tree[] = TREES): TreeHit | null {
  const inside = (p: Point, tree: Tree) => Math.hypot(p.x - tree.x, p.y - tree.y) <= tree.r + DISC_RADIUS;
  const escaping = new Set(trees.map((tree, i) => (inside(f.start, tree) ? i : -1)).filter((i) => i >= 0));

  const steps = 200;
  for (let s = 1; s <= steps; s++) {
    const t = s / steps;
    const p = pointOnFlight(f, t);
    for (let i = 0; i < trees.length; i++) {
      const hit = inside(p, trees[i]);
      if (escaping.has(i)) {
        if (!hit) escaping.delete(i);
        continue;
      }
      if (hit) return { t, point: p, tree: i };
    }
  }
  return null;
}

/**
 * Cut a flight short where it hit a tree. The disc drops just shy of the trunk,
 * a little back along its line, so the next lie is playable.
 */
export function applyTreeHit(f: Flight, hit: TreeHit): Flight {
  const cut = truncateFlight(f, hit.t);
  const back = pointOnFlight(f, Math.max(0, hit.t - 0.04));
  return { ...cut, end: back };
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
