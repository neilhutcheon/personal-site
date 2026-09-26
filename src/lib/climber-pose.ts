// Where the climber's hips and shoulders sit, given the two holds their hands are on.
// Kept separate from three.js so the body can be tested against the route.

import type { Vec3 } from "./limb-ik";

export const UPPER_ARM = 0.4;
export const FOREARM = 0.34;
export const ARM_REACH = UPPER_ARM + FOREARM;
export const LEG_REACH = 0.86;
export const SHOULDER_LIFT = 0.42;
export const SHOULDER_HALF = 0.2;
export const HIP_MIN_Y = 0.78;
/** Crash-pad top. Low feet plant here instead of clipping through the floor. */
export const PAD_TOP = 0.2;

export type BodyStance = {
  hip: Vec3;
  leftShoulder: Vec3;
  rightShoulder: Vec3;
};

function finite(v: Vec3): boolean {
  return Number.isFinite(v.x) && Number.isFinite(v.y) && Number.isFinite(v.z);
}

function dist(a: Vec3, b: Vec3): number {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}

/**
 * Hang the body just out from the wall, under the midpoint of the hands.
 * If a span is too long, pull the chest toward the holds until the arms can make it.
 */
export function bodyStance(left: Vec3, right: Vec3): BodyStance {
  if (!finite(left) || !finite(right)) {
    throw new RangeError("hand positions must be finite");
  }

  const mid = {
    x: (left.x + right.x) / 2,
    y: (left.y + right.y) / 2,
    z: (left.z + right.z) / 2,
  };
  // Reason: dropping the hips moves the shoulders away from high holds, so a long
  // move is solved by standing the chest closer to the wall, then higher — not lower.
  let drop = 0.5;
  let zOff = 0.22;

  const place = (): BodyStance => {
    const hip = { x: mid.x, y: Math.max(HIP_MIN_Y, mid.y - drop), z: mid.z + zOff };
    return {
      hip,
      leftShoulder: { x: hip.x - SHOULDER_HALF, y: hip.y + SHOULDER_LIFT, z: hip.z },
      rightShoulder: { x: hip.x + SHOULDER_HALF, y: hip.y + SHOULDER_LIFT, z: hip.z },
    };
  };

  let stance = place();
  for (let i = 0; i < 12; i++) {
    if (dist(left, stance.leftShoulder) <= ARM_REACH && dist(right, stance.rightShoulder) <= ARM_REACH) break;
    if (zOff > 0.06) zOff -= 0.04;
    else if (drop > 0.28) drop -= 0.04;
    else break;
    stance = place();
  }
  return stance;
}

/**
 * Camera-facing surface of the gym volumes in gym.ts: plywood, the center boulder,
 * the side aretes, and the headwall. Feet smear here instead of inside the mesh.
 */
function wallFace(x: number, y: number): number {
  let z = 0.12;
  if (Math.abs(x) < 1.1 && y > 0.9 && y < 3.6) z = Math.max(z, 0.74 - Math.abs(x) * 0.28);
  if (x < -0.4 && x > -1.2 && y > 1.4 && y < 4.05) z = Math.max(z, 0.4);
  if (x > 0.4 && x < 1.25 && y > 1.7 && y < 4.1) z = Math.max(z, 0.34);
  if (Math.abs(x) < 0.9 && y > 3.45) z = Math.max(z, 0.46);
  return z;
}

/** A foot pressed to the wall, or planted on the pad when the hips are low. */
export function smearFoot(hip: Vec3, side: -1 | 1): Vec3 {
  if (!finite(hip)) throw new RangeError("hip must be finite");
  const x = hip.x + side * 0.16;
  const hung = hip.y - 0.7;
  // Reason: the shoe is 0.08 tall, so the ankle sits above the pad stripe (top at 0.22).
  if (hung < 0.55) return { x, y: PAD_TOP + 0.08, z: Math.max(0.85, hip.z - 0.12) };
  return { x, y: hung, z: Math.max(wallFace(x, hung) + 0.1, hip.z - 0.1) };
}

/** True when the leg can stand on this spot without reaching above the hips. */
export function canPlant(hip: Vec3, spot: Vec3): boolean {
  return finite(spot) && spot.y < hip.y - 0.05 && dist(hip, spot) <= LEG_REACH + 0.05;
}

/** Use a real step only when it sits below the hip and the leg can reach it. */
export function footTarget(hip: Vec3, spot: Vec3 | null, side: -1 | 1): Vec3 {
  if (spot && canPlant(hip, spot)) return spot;
  return smearFoot(hip, side);
}
