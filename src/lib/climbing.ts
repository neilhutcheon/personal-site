// Pure rules for the interactive bouldering wall. Coordinates are SVG units in a 320x480 wall.

export type Hold = {
  id: string;
  x: number;
  y: number;
  /** Visual size of the hold. */
  r: number;
  kind: "jug" | "crimp" | "sloper" | "pinch";
  start?: boolean;
  top?: boolean;
};

export const WALL = { width: 320, height: 480 } as const;
export const REACH = 128;

export const HOLDS: Hold[] = [
  { id: "s", x: 150, y: 440, r: 15, kind: "jug", start: true },
  { id: "h1", x: 70, y: 395, r: 10, kind: "crimp" },
  { id: "h2", x: 230, y: 385, r: 13, kind: "sloper" },
  { id: "h3", x: 135, y: 340, r: 9, kind: "pinch" },
  { id: "h4", x: 45, y: 300, r: 12, kind: "jug" },
  { id: "h5", x: 260, y: 300, r: 10, kind: "crimp" },
  { id: "h6", x: 180, y: 265, r: 14, kind: "sloper" },
  { id: "h7", x: 95, y: 230, r: 9, kind: "crimp" },
  { id: "h8", x: 245, y: 200, r: 11, kind: "pinch" },
  { id: "h9", x: 40, y: 170, r: 13, kind: "jug" },
  { id: "h10", x: 150, y: 165, r: 8, kind: "crimp" },
  { id: "h11", x: 215, y: 120, r: 12, kind: "sloper" },
  { id: "h12", x: 85, y: 105, r: 10, kind: "pinch" },
  { id: "h13", x: 275, y: 80, r: 9, kind: "crimp" },
  { id: "t", x: 160, y: 42, r: 16, kind: "jug", top: true },
];

export const START_HOLD = HOLDS.find((h) => h.start)!;
export const TOP_HOLD = HOLDS.find((h) => h.top)!;

export function distance(a: Hold, b: Hold): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function canReach(from: Hold, to: Hold, reach = REACH): boolean {
  return from.id !== to.id && distance(from, to) <= reach;
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
