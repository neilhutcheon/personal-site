import { describe, expect, it } from "vitest";
import {
  extensionFromPosition,
  midiToNoteName,
  noteNameFor,
  positionFromExtension,
  slideFrequency,
} from "../../src/lib/trombone";

describe("slideFrequency", () => {
  it("plays B♭2 in first position on the 2nd partial", () => {
    expect(slideFrequency(2, 1)).toBeCloseTo(116.54, 1);
    expect(noteNameFor(2, 1)).toBe("B♭2");
  });

  it("drops a semitone per position", () => {
    expect(noteNameFor(2, 2)).toBe("A2");
    expect(noteNameFor(2, 7)).toBe("E2");
    expect(noteNameFor(3, 1)).toBe("F3");
    expect(noteNameFor(5, 1)).toBe("D4");
  });

  it("supports fractional positions for glissando and clamps the slide", () => {
    const between = slideFrequency(2, 1.5);
    expect(between).toBeLessThan(slideFrequency(2, 1));
    expect(between).toBeGreaterThan(slideFrequency(2, 2));
    expect(slideFrequency(2, 12)).toBe(slideFrequency(2, 7));
  });

  it("rejects invalid partials", () => {
    expect(() => slideFrequency(0, 1)).toThrow(RangeError);
  });
});

describe("slide extension helpers", () => {
  it("round-trips extension and position", () => {
    expect(positionFromExtension(0)).toBe(1);
    expect(positionFromExtension(1)).toBe(7);
    expect(extensionFromPosition(4)).toBeCloseTo(0.5);
    expect(positionFromExtension(2)).toBe(7);
  });

  it("names notes across octaves", () => {
    expect(midiToNoteName(60)).toBe("C4");
    expect(midiToNoteName(58)).toBe("B♭3");
  });
});
