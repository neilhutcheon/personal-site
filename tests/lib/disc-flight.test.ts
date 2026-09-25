import { describe, expect, it } from "vitest";
import {
  BASKET,
  TEE,
  computeFlight,
  flightToPath,
  pointOnFlight,
  scoreThrow,
  truncateFlight,
} from "../../src/lib/disc-flight";

describe("computeFlight", () => {
  it("starts at the tee and carries further with more power", () => {
    const soft = computeFlight(20, 0);
    const hard = computeFlight(90, 0);
    expect(soft.start).toEqual(TEE);
    expect(hard.end.x).toBeGreaterThan(soft.end.x);
  });

  it("fades left on a neutral release and turns right on anhyzer", () => {
    expect(computeFlight(60, 0).end.y).toBeLessThan(TEE.y);
    expect(computeFlight(60, 40).end.y).toBeGreaterThan(TEE.y);
  });

  it("clamps out-of-range inputs", () => {
    expect(computeFlight(500, 999)).toEqual(computeFlight(100, 40));
    expect(computeFlight(-10, -999)).toEqual(computeFlight(0, -40));
  });
});

describe("pointOnFlight", () => {
  it("returns the endpoints at t=0 and t=1", () => {
    const f = computeFlight(70, -10);
    expect(pointOnFlight(f, 0)).toEqual(f.start);
    const end = pointOnFlight(f, 1);
    expect(end.x).toBeCloseTo(f.end.x);
    expect(end.y).toBeCloseTo(f.end.y);
  });
});

describe("scoreThrow", () => {
  it("scores a direct hit as chains", () => {
    expect(scoreThrow(BASKET)).toEqual({ result: "chains", feetFromBasket: 0 });
  });

  it("can hit the chains with a well-judged hyzer", () => {
    const f = computeFlight(73, -23);
    expect(scoreThrow(f.end).result).toBe("chains");
  });

  it("scores near misses as circle and wild throws as rough", () => {
    expect(scoreThrow({ x: BASKET.x + 30, y: BASKET.y }).result).toBe("circle");
    expect(scoreThrow({ x: 300, y: 5 }).result).toBe("rough");
    expect(scoreThrow({ x: 300, y: 160 }).result).toBe("fairway");
  });
});

describe("truncateFlight", () => {
  it("ends exactly where the full flight is at t", () => {
    const f = computeFlight(65, 12);
    const part = truncateFlight(f, 0.4);
    const expected = pointOnFlight(f, 0.4);
    expect(part.start).toEqual(f.start);
    expect(part.end.x).toBeCloseTo(expected.x);
    expect(part.end.y).toBeCloseTo(expected.y);
  });

  it("clamps t outside [0, 1]", () => {
    const f = computeFlight(65, 12);
    expect(truncateFlight(f, 2).end.x).toBeCloseTo(f.end.x);
    expect(truncateFlight(f, -1).end).toEqual(f.start);
  });
});

describe("flightToPath", () => {
  it("produces an SVG cubic path", () => {
    expect(flightToPath(computeFlight(50, 0))).toMatch(/^M[\d.]+ [\d.]+ C/);
  });
});
