// Pure pitch math for a tenor trombone in B♭.
// Each slide position lowers the pitch by one semitone; each partial is a harmonic of B♭1.

export const FUNDAMENTAL_HZ = 58.27; // B♭1
const FUNDAMENTAL_MIDI = 34;

export const MIN_POSITION = 1;
export const MAX_POSITION = 7;

export const PARTIALS = [
  { partial: 2, label: "2nd" },
  { partial: 3, label: "3rd" },
  { partial: 4, label: "4th" },
  { partial: 5, label: "5th" },
  { partial: 6, label: "6th" },
] as const;

const NOTE_NAMES = ["C", "D♭", "D", "E♭", "E", "F", "G♭", "G", "A♭", "A", "B♭", "B"];

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/**
 * Frequency for a partial at a (possibly fractional) slide position.
 * Fractional positions give the glissando the trombone is famous for.
 */
export function slideFrequency(partial: number, position: number): number {
  if (!Number.isFinite(partial) || partial < 1) {
    throw new RangeError(`partial must be >= 1, received ${partial}`);
  }
  const pos = clamp(position, MIN_POSITION, MAX_POSITION);
  return FUNDAMENTAL_HZ * partial * Math.pow(2, -(pos - 1) / 12);
}

export function frequencyToMidi(freq: number): number {
  return Math.round(12 * Math.log2(freq / FUNDAMENTAL_HZ) + FUNDAMENTAL_MIDI);
}

export function midiToNoteName(midi: number): string {
  const octave = Math.floor(midi / 12) - 1;
  return `${NOTE_NAMES[((midi % 12) + 12) % 12]}${octave}`;
}

export function noteNameFor(partial: number, position: number): string {
  return midiToNoteName(frequencyToMidi(slideFrequency(partial, Math.round(position))));
}

/** Map a 0–1 slide extension to a fractional position between 1 and 7. */
export function positionFromExtension(extension: number): number {
  return MIN_POSITION + clamp(extension, 0, 1) * (MAX_POSITION - MIN_POSITION);
}

export function extensionFromPosition(position: number): number {
  return (clamp(position, MIN_POSITION, MAX_POSITION) - MIN_POSITION) / (MAX_POSITION - MIN_POSITION);
}

/** A short, recognisable lick: B♭ major arpeggio up and back down, as [partial, position]. */
export const LICK: Array<[partial: number, position: number]> = [
  [2, 1],
  [3, 4],
  [3, 1],
  [4, 1],
  [5, 1],
  [6, 1],
  [5, 1],
  [4, 1],
];
