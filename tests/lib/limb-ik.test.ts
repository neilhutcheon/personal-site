import { describe, expect, it } from "vitest";
import { solveTwoBone, type Vec3 } from "../../src/lib/limb-ik";

const root: Vec3 = { x: 0, y: 0, z: 0 };
const pole: Vec3 = { x: 0, y: 0.5, z: 2 };

function dist(a: Vec3, b: Vec3): number {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}

describe("two-bone ik", () => {
  it("plants the end on the target and bends the joint toward the pole", () => {
    const target = { x: 0, y: 1, z: 0 };
    const pose = solveTwoBone(root, target, 0.6, 0.6, pole);
    expect(pose.reached).toBe(true);
    expect(pose.end.y).toBeCloseTo(1);
    expect(pose.end.x).toBeCloseTo(0);
    expect(pose.joint.z).toBeGreaterThan(0.2);
    expect(dist(root, pose.joint)).toBeCloseTo(0.6, 1);
    expect(dist(pose.joint, pose.end)).toBeCloseTo(0.6, 1);
  });

  it("folds an equal-length chain onto a target at the root", () => {
    const pose = solveTwoBone(root, root, 0.5, 0.5, { x: 0, y: 0, z: 1 });
    expect(pose.reached).toBe(true);
    expect(dist(pose.end, root)).toBeLessThan(0.05);
    expect(dist(root, pose.joint)).toBeCloseTo(0.5, 1);
  });

  it("stops short when the target is farther than both bones", () => {
    const pose = solveTwoBone(root, { x: 0, y: 5, z: 0 }, 0.6, 0.6, pole);
    expect(pose.reached).toBe(false);
    expect(pose.end.y).toBeCloseTo(1.2, 1);
    expect(pose.end.x).toBeCloseTo(0);
  });

  it("throws when a bone length is not usable", () => {
    expect(() => solveTwoBone(root, { x: 0, y: 1, z: 0 }, 0, 0.5, pole)).toThrow(RangeError);
    expect(() => solveTwoBone(root, { x: Number.NaN, y: 1, z: 0 }, 0.5, 0.5, pole)).toThrow(RangeError);
  });
});
