import { describe, expect, it } from "vitest";
import {
  HOLDS,
  START_HOLD,
  TOP_HOLD,
  canReach,
  gradeForMoves,
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

describe("climbing wall", () => {
  it("has exactly one start and one top hold", () => {
    expect(HOLDS.filter((h) => h.start)).toHaveLength(1);
    expect(HOLDS.filter((h) => h.top)).toHaveLength(1);
  });

  it("is sendable from start to top", () => {
    expect(shortestSend()).toBeLessThan(Infinity);
  });

  it("does not let you reach the top from the start in one move", () => {
    expect(canReach(START_HOLD, TOP_HOLD)).toBe(false);
  });

  it("does not count the current hold as reachable", () => {
    expect(canReach(START_HOLD, START_HOLD)).toBe(false);
  });

  it("grades harder for fewer moves and handles invalid input", () => {
    expect(gradeForMoves(4)).toBe("V8");
    expect(gradeForMoves(10)).toBe("V2");
    expect(gradeForMoves(40)).toBe("V0");
    expect(gradeForMoves(0)).toBe("V?");
  });
});
