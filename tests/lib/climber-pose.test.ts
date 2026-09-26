import { describe, expect, it } from "vitest";
import { ARM_REACH, LEG_REACH, PAD_TOP, bodyStance, footTarget, smearFoot } from "../../src/lib/climber-pose";
import { HOLDS, REACH, START_HOLD, distance, gripPoint } from "../../src/lib/climbing";
import type { Vec3 } from "../../src/lib/limb-ik";

function dist(a: Vec3, b: Vec3): number {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}

describe("climber pose", () => {
  it("hangs the start jug in front of the wall and inside arm's reach", () => {
    const grip = gripPoint(START_HOLD);
    const stance = bodyStance(grip, grip);
    expect(stance.hip.z).toBeGreaterThan(grip.z);
    expect(stance.hip.y).toBeGreaterThanOrEqual(0.78);
    expect(dist(grip, stance.leftShoulder)).toBeLessThanOrEqual(ARM_REACH + 1e-6);
    expect(dist(grip, stance.rightShoulder)).toBeLessThanOrEqual(ARM_REACH + 1e-6);
  });

  it("keeps both hands in reach on the longest legal move", () => {
    let best = 0;
    let pair = [HOLDS[0], HOLDS[1]] as const;
    for (const a of HOLDS) {
      for (const b of HOLDS) {
        const d = distance(a, b);
        if (a.id !== b.id && d <= REACH && d > best) {
          best = d;
          pair = a.x <= b.x ? [a, b] : [b, a];
        }
      }
    }
    const stance = bodyStance(pair[0], pair[1]);
    expect(dist(pair[0], stance.leftShoulder)).toBeLessThanOrEqual(ARM_REACH + 1e-6);
    expect(dist(pair[1], stance.rightShoulder)).toBeLessThanOrEqual(ARM_REACH + 1e-6);
  });

  it("plants a low foot on the pad, still inside the leg's reach", () => {
    const hip = { x: 0, y: 0.9, z: 1.2 };
    const foot = smearFoot(hip, 1);
    expect(foot.y).toBe(PAD_TOP + 0.08);
    expect(foot.z).toBeGreaterThan(0.8);
    expect(dist(hip, foot)).toBeLessThanOrEqual(LEG_REACH);
    const high = smearFoot({ x: 0, y: 2.4, z: 1 }, -1);
    expect(high.y).toBeGreaterThan(1);
    expect(high.z).toBeGreaterThan(0.7);
  });

  it("ignores a foothold that sits above the hip", () => {
    const hip = { x: 0, y: 1, z: 1 };
    const above = { x: 0, y: 1.5, z: 1 };
    expect(footTarget(hip, above, 1)).toEqual(smearFoot(hip, 1));
    const below = { x: 0.1, y: 0.3, z: 0.9 };
    expect(footTarget(hip, below, 1)).toEqual(below);
  });

  it("throws when a hand position is not a number", () => {
    expect(() => bodyStance({ x: Number.NaN, y: 1, z: 1 }, { x: 0, y: 1, z: 1 })).toThrow(RangeError);
  });
});
