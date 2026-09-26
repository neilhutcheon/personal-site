import { describe, expect, it } from "vitest";
import {
  HOLDS,
  REACH,
  START_HOLD,
  TOP_HOLD,
  canReach,
  distance,
  feetForPath,
  footPoint,
  gradeForMoves,
  gripPoint,
  handsForPath,
  holdName,
  reachableHolds,
  type Hold,
} from "../../src/lib/climbing";

function shortestSend(): number {
  const seen = new Map<string, number>([[START_HOLD.id, 0]]);
  const queue: Hold[] = [START_HOLD];
  while (queue.length) {
    const current = queue.shift()!;
    for (const next of reachableHolds(current)) {
      if (seen.has(next.id)) continue;
      seen.set(next.id, seen.get(current.id)! + 1);
      queue.push(next);
    }
  }
  return seen.get(TOP_HOLD.id) ?? Infinity;
}

function visitedFromStart(): Set<string> {
  const seen = new Set<string>([START_HOLD.id]);
  const queue: Hold[] = [START_HOLD];
  while (queue.length) {
    const current = queue.shift()!;
    for (const next of reachableHolds(current)) {
      if (seen.has(next.id)) continue;
      seen.add(next.id);
      queue.push(next);
    }
  }
  return seen;
}

describe("climbing wall", () => {
  it("has exactly one start and one top hold", () => {
    expect(HOLDS.filter((h) => h.start)).toHaveLength(1);
    expect(HOLDS.filter((h) => h.top)).toHaveLength(1);
  });

  it("is sendable from start to top", () => {
    expect(shortestSend()).toBeLessThan(Infinity);
  });

  it("takes four moves on the shortest beta", () => {
    expect(shortestSend()).toBe(4);
  });

  it("can eventually reach every hold from the start", () => {
    expect(visitedFromStart().size).toBe(HOLDS.length);
  });

  it("does not let you reach the top from the start in one move", () => {
    expect(canReach(START_HOLD, TOP_HOLD)).toBe(false);
  });

  it("does not count the current hold as reachable", () => {
    expect(canReach(START_HOLD, START_HOLD)).toBe(false);
  });

  it("cannot skip a whole layer of the route", () => {
    for (const from of HOLDS) {
      for (const to of HOLDS) {
        if (to.y - from.y > 1.15) expect(canReach(from, to)).toBe(false);
      }
    }
  });

  it("leaves the far-right high jug short of the top", () => {
    const jug = HOLDS.find((h) => h.id === "j");
    expect(jug).toBeDefined();
    expect(canReach(jug!, TOP_HOLD)).toBe(false);
  });

  it("measures reach in three dimensions and includes the exact limit", () => {
    const edge: Hold = { id: "edge", x: START_HOLD.x + REACH, y: START_HOLD.y, z: START_HOLD.z, r: 0.1, kind: "jug" };
    expect(canReach(START_HOLD, edge)).toBe(true);
    expect(distance(START_HOLD, edge)).toBeCloseTo(REACH);
    const past: Hold = { ...edge, id: "past", z: START_HOLD.z + REACH + 0.01 };
    expect(canReach(START_HOLD, past)).toBe(false);
  });

  it("rejects a reach check when a coordinate is not a number", () => {
    const broken: Hold = { ...START_HOLD, id: "bad", z: Number.NaN };
    expect(canReach(START_HOLD, broken)).toBe(false);
  });

  it("grades harder for fewer moves and handles invalid input", () => {
    expect(gradeForMoves(4)).toBe("V8");
    expect(gradeForMoves(10)).toBe("V2");
    expect(gradeForMoves(40)).toBe("V0");
    expect(gradeForMoves(0)).toBe("V?");
  });

  it("gives every hold a unique name", () => {
    const names = HOLDS.map(holdName);
    expect(new Set(names).size).toBe(names.length);
    expect(holdName(START_HOLD)).toBe("Start jug");
    expect(holdName(TOP_HOLD)).toBe("Top jug");
  });

  it("matches each hand to the hold on its own side of the body", () => {
    expect(handsForPath(["s"])).toEqual(["s", "s"]);
    // a sits left of the start, so the left hand reaches and the right stays.
    expect(handsForPath(["s", "a"])).toEqual(["a", "s"]);
    // b sits right of the start.
    expect(handsForPath(["s", "b"])).toEqual(["s", "b"]);
    // c is right of b, even though it is the newer hold.
    expect(handsForPath(["s", "b", "c"])).toEqual(["b", "c"]);
  });

  it("throws if the path is empty", () => {
    expect(() => handsForPath([])).toThrow(RangeError);
  });

  it("sets each grip and step on the outside of the plastic", () => {
    for (const hold of HOLDS) {
      const grip = gripPoint(hold);
      expect(grip.z).toBeGreaterThan(hold.z + hold.r);
      const foot = footPoint(hold);
      expect(foot.y).toBeGreaterThan(hold.y + hold.r * 0.4);
      expect(foot.z).toBeGreaterThan(hold.z);
    }
    const [left, right] = [gripPoint(START_HOLD, -1), gripPoint(START_HOLD, 1)];
    expect(left.x).toBeLessThan(START_HOLD.x);
    expect(right.x).toBeGreaterThan(START_HOLD.x);
  });

  it("plants each foot on a hold on its own side of the hips", () => {
    const hip = { x: 0, y: 2.8, z: 1 };
    expect(feetForPath(["s"], hip)).toEqual([null, null]);
    expect(feetForPath(["s", "b"], hip)).toEqual([null, null]);
    // The only foothold is left of the hips.
    expect(feetForPath(["s", "b", "c"], { ...hip, x: 0.3 })).toEqual(["s", null]);
    // Start is left of the hips, b is right.
    expect(feetForPath(["s", "b", "f", "g"], { ...hip, x: 0.04 })).toEqual(["s", "b"]);
    // Both footholds are right of the hips, so only the right foot takes the outer one.
    expect(feetForPath(["s", "b", "f", "i"], { ...hip, x: -1 })).toEqual([null, "b"]);
  });

  it("keeps a foot on the hold it can stand on when the outer one is too high", () => {
    // a is further left but above the hips; s is left of the body and low enough.
    expect(feetForPath(["s", "a", "b", "c"], { x: 0.36, y: 2, z: 1.08 })).toEqual(["s", null]);
  });

  it("rejects a foot match when the body center is not a number", () => {
    expect(() => feetForPath(["s", "b", "f"], { x: Number.NaN, y: 0, z: 0 })).toThrow(RangeError);
  });
});
