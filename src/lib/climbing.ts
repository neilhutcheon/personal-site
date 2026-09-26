// Rules for the 3D gym boulder. Y is up, Z points out of the wall toward the camera.
// Holds sit on layers about 0.72 apart and reach is 1.05, so a move can leave a layer
// but cannot skip one. The shortest way to the top is four moves.

import { canPlant, footTarget, bodyStance } from "./climber-pose";
import type { Vec3 } from "./limb-ik";

export type HoldKind = "jug" | "crimp" | "sloper" | "pinch";

export type Hold = {
  id: string;
  x: number;
  y: number;
  z: number;
  /** Visual size of the hold. */
  r: number;
  kind: HoldKind;
  start?: boolean;
  top?: boolean;
};

export const REACH = 1.05;

// z is where a ray straight out from the camera hits the boulder, an arete, or the
// headwall, plus 2cm so the plastic sits on that face instead of floating in front of it.
export const HOLDS: Hold[] = [
  { id: "s", x: 0, y: 1.5, z: 0.63, r: 0.2, kind: "jug", start: true },

  { id: "d", x: -1.05, y: 2.22, z: 0.38, r: 0.16, kind: "jug" },
  { id: "a", x: -0.55, y: 2.22, z: 0.89, r: 0.12, kind: "crimp" },
  { id: "b", x: 0.08, y: 2.22, z: 0.79, r: 0.16, kind: "sloper" },
  { id: "c", x: 0.64, y: 2.22, z: 0.47, r: 0.13, kind: "pinch" },

  { id: "e", x: -0.62, y: 2.94, z: 0.74, r: 0.16, kind: "jug" },
  { id: "f", x: 0.02, y: 2.94, z: 0.76, r: 0.11, kind: "crimp" },
  { id: "g", x: 0.7, y: 2.94, z: 0.31, r: 0.14, kind: "sloper" },
  { id: "k", x: 1.05, y: 2.94, z: 0.31, r: 0.12, kind: "pinch" },

  { id: "h", x: -0.48, y: 3.66, z: 0.42, r: 0.13, kind: "pinch" },
  { id: "i", x: 0.16, y: 3.66, z: 0.42, r: 0.12, kind: "crimp" },
  { id: "j", x: 0.9, y: 3.66, z: 0.42, r: 0.16, kind: "jug" },

  { id: "t", x: 0.02, y: 4.34, z: 0.42, r: 0.2, kind: "jug", top: true },
];

export const START_HOLD = HOLDS.find((h) => h.start)!;
export const TOP_HOLD = HOLDS.find((h) => h.top)!;

const byId = new Map(HOLDS.map((h) => [h.id, h]));

export function holdById(id: string): Hold {
  const hold = byId.get(id);
  if (!hold) throw new RangeError(`unknown hold ${id}`);
  return hold;
}

export function distance(a: Hold, b: Hold): number {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}

export function canReach(from: Hold, to: Hold, reach = REACH): boolean {
  if (from.id === to.id) return false;
  const d = distance(from, to);
  return Number.isFinite(d) && d <= reach;
}

export function reachableHolds(from: Hold, holds: Hold[] = HOLDS, reach = REACH): Hold[] {
  return holds.filter((h) => canReach(from, h, reach));
}

/**
 * Fewer moves means bigger, more dynamic reaches, so it earns a harder grade.
 * Returns a V-scale grade string (V0–V8).
 */
export function gradeForMoves(moves: number): string {
  if (!Number.isFinite(moves) || moves <= 0) return "V?";
  return `V${Math.max(0, Math.min(8, 12 - moves))}`;
}

/** Screen-reader and button label. Names are unique across the route. */
export function holdName(hold: Hold): string {
  if (hold.start) return "Start jug";
  if (hold.top) return "Top jug";
  const side =
    hold.x < -0.8 ? "Far left" : hold.x < -0.25 ? "Left" : hold.x > 0.8 ? "Far right" : hold.x > 0.25 ? "Right" : "Middle";
  const band = hold.y < 2.6 ? "low" : hold.y < 3.4 ? "mid" : "high";
  return `${side} ${band} ${hold.kind}`;
}

/**
 * Left hand, then right. The body hangs between the two holds, so each hand
 * takes the hold on its own side of that midline. A straight-up move (same x)
 * keeps the old hold in the left hand and reaches with the right.
 */
export function handsForPath(path: readonly string[]): [string, string] {
  if (path.length === 0) throw new RangeError("path must include the start hold");
  if (path.length === 1) return [path[0], path[0]];
  const prev = holdById(path[path.length - 2]);
  const curr = holdById(path[path.length - 1]);
  if (prev.x === curr.x) return [prev.id, curr.id];
  return prev.x < curr.x ? [prev.id, curr.id] : [curr.id, prev.id];
}

/**
 * Feet use the holds a couple of moves back. Each foot only takes a hold on its
 * own side of the hips. Null means smear on the wall or stand on the pad.
 * Two holds on one side: the one that foot can stand on wins, then the outer one,
 * so a leg never crosses the body to reach past the other foot.
 */
export function feetForPath(path: readonly string[], hip: Vec3): [string | null, string | null] {
  if (path.length < 3) return [null, null];
  if (!Number.isFinite(hip.x) || !Number.isFinite(hip.y) || !Number.isFinite(hip.z)) {
    throw new RangeError("body center must be finite");
  }
  const ids = path.length >= 4 ? [path[path.length - 4], path[path.length - 3]] : [path[path.length - 3]];
  let left: Hold | null = null;
  let right: Hold | null = null;
  const centered: Hold[] = [];
  for (const id of ids) {
    const hold = holdById(id);
    if (hold.x < hip.x) left = preferFoot(left, hold, hip, -1);
    else if (hold.x > hip.x) right = preferFoot(right, hold, hip, 1);
    else centered.push(hold);
  }
  // A hold on the midline can fill whichever foot is still free.
  for (const hold of centered) {
    if (!left) left = hold;
    else if (!right) right = hold;
  }
  return [left?.id ?? null, right?.id ?? null];
}

/** Keep the hold this foot can actually stand on; otherwise the one further to its side. */
function preferFoot(current: Hold | null, next: Hold, hip: Vec3, side: -1 | 1): Hold {
  if (!current) return next;
  const currentOk = canPlant(hip, footPoint(current));
  const nextOk = canPlant(hip, footPoint(next));
  if (nextOk !== currentOk) return nextOk ? next : current;
  return side < 0 ? (next.x < current.x ? next : current) : next.x > current.x ? next : current;
}

/** How far the colored plastic sticks out from the bolt, including the ink shell. */
function faceDepth(hold: Hold): number {
  const ink = hold.kind === "pinch" ? 1.16 : 1.14;
  if (hold.kind === "crimp") return hold.r * 0.75 * ink;
  if (hold.kind === "pinch") return hold.r * 1.05 * ink;
  if (hold.kind === "sloper") return hold.r * 1.35 * 0.95 * ink;
  return hold.r * 1.35 * 0.78 * ink;
}

/** How far the plastic rises above the bolt. */
function crown(hold: Hold): number {
  const ink = hold.kind === "pinch" ? 1.16 : 1.14;
  if (hold.kind === "crimp") return hold.r * 0.425 * ink;
  if (hold.kind === "pinch") return hold.r * 1.05 * ink;
  if (hold.kind === "sloper") return hold.r * 1.35 * 0.58 * ink;
  return hold.r * 1.35 * 0.92 * ink;
}

/**
 * Palm on the camera side of the plastic. The hand box is 0.1 deep and stays
 * axis-aligned, so the extra 0.07 keeps its back face off the hold.
 */
export function gripPoint(hold: Hold, side: -1 | 0 | 1 = 0): Vec3 {
  return {
    x: hold.x + side * 0.045,
    y: hold.y + crown(hold) * 0.2,
    z: hold.z + faceDepth(hold) + 0.07,
  };
}

/** Sole just above the top of the plastic, slightly toward the camera. */
export function footPoint(hold: Hold): Vec3 {
  return {
    x: hold.x,
    y: hold.y + crown(hold) + 0.06,
    z: hold.z + Math.max(faceDepth(hold) * 0.35, 0.08),
  };
}

export type ClimberTargets = {
  leftHand: Vec3;
  rightHand: Vec3;
  leftFoot: Vec3;
  rightFoot: Vec3;
};

/** Hand and foot goals for a path. Feet fall back to a smear when the old hold is a bad step. */
export function targetsForPath(path: readonly string[]): ClimberTargets {
  const [leftId, rightId] = handsForPath(path);
  const shared = leftId === rightId;
  const leftHand = gripPoint(holdById(leftId), shared ? -1 : 0);
  const rightHand = gripPoint(holdById(rightId), shared ? 1 : 0);
  const { hip } = bodyStance(leftHand, rightHand);
  const [leftFootId, rightFootId] = feetForPath(path, hip);
  const leftHold = leftFootId ? holdById(leftFootId) : null;
  const rightHold = rightFootId ? holdById(rightFootId) : null;
  return {
    leftHand,
    rightHand,
    leftFoot: footTarget(hip, leftHold ? footPoint(leftHold) : null, -1),
    rightFoot: footTarget(hip, rightHold ? footPoint(rightHold) : null, 1),
  };
}
