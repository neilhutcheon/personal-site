"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Music2, Play, Volume2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  LICK,
  MAX_POSITION,
  MIN_POSITION,
  PARTIALS,
  extensionFromPosition,
  noteNameFor,
  positionFromExtension,
  slideFrequency,
} from "@/lib/trombone";
import { cn } from "@/lib/utils";
import { useTromboneSynth } from "./use-trombone-synth";

// Geometry is traced from a photo of a Yamaha tenor trombone at 1024px wide:
// bell tube on top (y≈128), upper slide tube y≈185, lower slide tube y≈240.
// Reason: at 7th position a real slide extends ~80% of the outer slide's length (425→1000 here),
// so travel is sized to that rather than squeezed to fit a narrow canvas.
const SLIDE_TRAVEL = 450;
const SLIDE_HOME_X = 1000; // tip of the slide crook in 1st position
const VIEW_W = 1480;
const VIEW_H = 330;
const BELL_Y = 128;
const UPPER_Y = 185;
const LOWER_Y = 240;

// Flat neo-brutalist palette: no gradients, every shape gets an ink outline.
const INK = "var(--foreground)";
const BRASS = "var(--brass)";
const BRASS_DEEP = "oklch(0.78 0.16 85)";
const SILVER = "oklch(0.93 0.01 95)";
const BORE = "oklch(0.35 0.06 70)";
const OUTLINE = 2.5;

/** A tube drawn as an ink stroke with a brass stroke on top, so it reads as an outlined shape. */
function Tube({ d, width }: { d: string; width: number }) {
  return (
    <>
      <path d={d} fill="none" stroke={INK} strokeWidth={width + OUTLINE * 2} strokeLinecap="round" />
      <path d={d} fill="none" stroke={BRASS} strokeWidth={width} strokeLinecap="round" />
    </>
  );
}

/** Silver ferrule / brace block with an ink outline. */
function Ferrule({ x, y, w, h, fill = SILVER }: { x: number; y: number; w: number; h: number; fill?: string }) {
  return <rect x={x} y={y} width={w} height={h} fill={fill} stroke={INK} strokeWidth={OUTLINE} />;
}

export function Trombone() {
  const [position, setPosition] = useState(1);
  const [partial, setPartial] = useState(3);
  const [playing, setPlaying] = useState(false);
  const [lickPlaying, setLickPlaying] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const lickTimers = useRef<number[]>([]);
  const synth = useTromboneSynth();

  const freq = slideFrequency(partial, position);
  const offset = extensionFromPosition(position) * SLIDE_TRAVEL;

  useEffect(() => {
    if (playing) synth.setFrequency(freq);
  }, [freq, playing, synth]);

  const startNote = useCallback(() => {
    synth.start(slideFrequency(partial, position));
    setPlaying(true);
  }, [synth, partial, position]);

  const stopNote = useCallback(() => {
    synth.stop();
    setPlaying(false);
  }, [synth]);

  useEffect(() => () => lickTimers.current.forEach(clearTimeout), []);

  const positionFromPointer = (e: PointerEvent<SVGSVGElement>) => {
    const rect = svgRef.current!.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * VIEW_W;
    return positionFromExtension((svgX - SLIDE_HOME_X) / SLIDE_TRAVEL);
  };

  const onPointerDown = (e: PointerEvent<SVGSVGElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const pos = positionFromPointer(e);
    setPosition(pos);
    synth.start(slideFrequency(partial, pos));
    setPlaying(true);
  };

  const onPointerMove = (e: PointerEvent<SVGSVGElement>) => {
    if (playing && e.currentTarget.hasPointerCapture(e.pointerId)) setPosition(positionFromPointer(e));
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const n = Number(e.key);
    if (n >= MIN_POSITION && n <= MAX_POSITION) setPosition(n);
    if (e.key === "ArrowUp") setPartial((p) => Math.min(6, p + 1));
    if (e.key === "ArrowDown") setPartial((p) => Math.max(2, p - 1));
    if ((e.key === " " || e.key === "Enter") && !e.repeat && e.target === e.currentTarget) {
      e.preventDefault();
      startNote();
    }
  };

  const onKeyUp = (e: KeyboardEvent<HTMLDivElement>) => {
    if ((e.key === " " || e.key === "Enter") && e.target === e.currentTarget) stopNote();
  };

  const playLick = () => {
    lickTimers.current.forEach(clearTimeout);
    setLickPlaying(true);
    const step = 300;
    LICK.forEach(([p, pos], i) => {
      lickTimers.current.push(
        window.setTimeout(() => {
          setPartial(p);
          setPosition(pos);
          synth.start(slideFrequency(p, pos));
          setPlaying(true);
        }, i * step),
      );
    });
    lickTimers.current.push(
      window.setTimeout(() => {
        stopNote();
        setLickPlaying(false);
      }, LICK.length * step + 250),
    );
  };

  const note = noteNameFor(partial, position);

  return (
    <div
      tabIndex={0}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      aria-label="Playable trombone. Number keys 1 to 7 set slide position, up and down arrows change partial, hold Space to play."
      className="space-y-6 outline-none focus-visible:ring-3 focus-visible:ring-primary/60"
    >
      <div className="relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="w-full cursor-grab touch-none select-none active:cursor-grabbing"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={stopNote}
          onPointerCancel={stopNote}
          aria-hidden
        >
          {/* Position guide — 1 is closed, 7 is fully extended to the right */}
          {Array.from({ length: 7 }, (_, i) => {
            const x = SLIDE_HOME_X + extensionFromPosition(i + 1) * SLIDE_TRAVEL;
            const active = Math.round(position) === i + 1;
            return (
              <g key={i}>
                <line x1={x} x2={x} y1="278" y2="292" stroke={INK} strokeWidth={active ? 4 : 2.5} />
                {active && <rect x={x - 16} y={296} width="32" height="28" fill={BRASS} stroke={INK} strokeWidth={OUTLINE} />}
                <text x={x} y="318" textAnchor="middle" className={cn("fill-foreground font-mono text-[22px] font-bold", !active && "opacity-50")}>
                  {i + 1}
                </text>
              </g>
            );
          })}

          {/* Bell section: bell tube on top, tuning bow at far left, return tube along the bottom */}
          <Tube
            d={`M470 ${BELL_Y} L62 ${BELL_Y} C30 ${BELL_Y} 16 ${(BELL_Y + LOWER_Y) / 2 - 22} 16 ${(BELL_Y + LOWER_Y) / 2} C16 ${(BELL_Y + LOWER_Y) / 2 + 22} 30 ${LOWER_Y} 62 ${LOWER_Y} L330 ${LOWER_Y}`}
            width={10}
          />
          {/* Tuning slide ferrules and cross brace */}
          <Ferrule x={92} y={BELL_Y - 7} w={20} h={14} />
          <Ferrule x={92} y={LOWER_Y - 7} w={20} h={14} />
          <Ferrule x={150} y={BELL_Y - 7} w={18} h={14} />
          <Ferrule x={150} y={LOWER_Y - 7} w={18} h={14} />
          {/* Reason: straight <line>s have a zero-width bounding box, so paint effects won't apply. Use rects. */}
          <Ferrule x={156.5} y={BELL_Y} w={5} h={LOWER_Y - BELL_Y} fill={BRASS_DEEP} />
          {/* Counterweight */}
          <Ferrule x={88} y={BELL_Y} w={4} h={LOWER_Y - BELL_Y} fill={BRASS_DEEP} />
          <circle cx="90" cy={(BELL_Y + LOWER_Y) / 2} r="15" fill={BRASS_DEEP} stroke={INK} strokeWidth={OUTLINE} />
          <circle cx="90" cy={(BELL_Y + LOWER_Y) / 2} r="6" fill="none" stroke={INK} strokeWidth="2" />

          {/* Bell-to-slide brace */}
          <Ferrule x={342.5} y={BELL_Y} w={5} h={LOWER_Y - BELL_Y} fill={BRASS_DEEP} />
          <Ferrule x={337} y={BELL_Y - 8} w={16} h={16} />
          <Ferrule x={337} y={UPPER_Y - 8} w={16} h={16} />
          <Ferrule x={337} y={LOWER_Y - 8} w={16} h={16} />

          {/* Inner slide tubes (silver) are fixed; they show as the outer slide extends */}
          <Ferrule x={300} y={UPPER_Y - 4} w={660} h={8} />
          <Ferrule x={330} y={LOWER_Y - 4} w={630} h={8} />
          {/* Inner slide cross stay */}
          <Ferrule x={397.5} y={UPPER_Y} w={5} h={LOWER_Y - UPPER_Y} />
          <Ferrule x={392} y={UPPER_Y - 8} w={16} h={16} />
          <Ferrule x={392} y={LOWER_Y - 8} w={16} h={16} />

          {/* Mouthpiece on the upper inner slide tube */}
          <path
            d={`M300 ${UPPER_Y - 5} L276 ${UPPER_Y - 9} L276 ${UPPER_Y + 9} L300 ${UPPER_Y + 5} Z`}
            fill={SILVER}
            stroke={INK}
            strokeWidth={OUTLINE}
          />
          <ellipse cx="274" cy={UPPER_Y} rx="5" ry="14" fill={SILVER} stroke={INK} strokeWidth={OUTLINE} />

          {/* Outer slide moves right to lengthen the horn */}
          <motion.g initial={false} animate={{ x: offset }} transition={{ type: "spring", stiffness: 500, damping: 40 }}>
            <Tube
              d={`M425 ${UPPER_Y} L${SLIDE_HOME_X - 42} ${UPPER_Y} C${SLIDE_HOME_X - 4} ${UPPER_Y} ${SLIDE_HOME_X - 4} ${LOWER_Y} ${SLIDE_HOME_X - 42} ${LOWER_Y} L425 ${LOWER_Y}`}
              width={11}
            />
            <Ferrule x={418} y={UPPER_Y - 8} w={18} h={16} />
            <Ferrule x={418} y={LOWER_Y - 8} w={18} h={16} />
            <Ferrule x={SLIDE_HOME_X - 62} y={UPPER_Y} w={4} h={LOWER_Y - UPPER_Y} fill={BRASS_DEEP} />
            <Ferrule x={SLIDE_HOME_X - 68} y={UPPER_Y - 7} w={16} h={14} />
            <Ferrule x={SLIDE_HOME_X - 68} y={LOWER_Y - 7} w={16} h={14} />
            {/* Water key */}
            <Ferrule x={SLIDE_HOME_X - 34} y={LOWER_Y + 4} w={14} h={6} />
            <circle cx={SLIDE_HOME_X - 6} cy={LOWER_Y + 8} r="3" fill={INK} />
          </motion.g>

          {/* Bell flare: throat leaves the bell tube and opens to the right */}
          <path
            d={`M380 ${BELL_Y - 7} C480 ${BELL_Y - 10} 555 ${BELL_Y - 60} 604 ${BELL_Y - 90} C615 ${BELL_Y - 92} 618 ${BELL_Y - 40} 618 ${BELL_Y} C618 ${BELL_Y + 40} 615 ${BELL_Y + 92} 604 ${BELL_Y + 90} C555 ${BELL_Y + 60} 480 ${BELL_Y + 10} 380 ${BELL_Y + 7} Z`}
            fill={BRASS}
            stroke={INK}
            strokeWidth={OUTLINE}
            strokeLinejoin="round"
          />
          <ellipse cx="612" cy={BELL_Y} rx="12" ry="90" fill={BORE} stroke={INK} strokeWidth={OUTLINE} />

          <AnimatePresence>
            {playing &&
              [0, 1, 2].map((i) => (
                <motion.path
                  key={i}
                  d={`M640 ${BELL_Y - 70} Q680 ${BELL_Y} 640 ${BELL_Y + 70}`}
                  fill="none"
                  stroke={INK}
                  strokeWidth="4"
                  strokeLinecap="round"
                  initial={{ opacity: 0.9, x: 0 }}
                  animate={{ opacity: 0, x: 80 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.33, ease: "easeOut" }}
                />
              ))}
          </AnimatePresence>
        </svg>
        <p className="mt-1 text-center font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Press and drag anywhere on the horn to play. Slide right to lower the pitch.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
        <div className="flex items-center gap-5">
          <div className="stack grid size-20 place-items-center bg-brass under-primary">
            <span aria-live="polite" className="font-heading text-2xl font-extrabold">
              {note}
            </span>
          </div>
          <dl className="text-sm">
            <dt className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">Position</dt>
            <dd className="font-mono font-bold">{position.toFixed(1)}</dd>
            <dt className="mt-1 font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">Frequency</dt>
            <dd className="font-mono font-bold">{freq.toFixed(1)} Hz</dd>
          </dl>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label id="slide-label" className="text-sm font-bold">
              Slide position
            </label>
            <Slider
              aria-labelledby="slide-label"
              min={MIN_POSITION}
              max={MAX_POSITION}
              step={0.1}
              value={[position]}
              onValueChange={(v) => setPosition(Array.isArray(v) ? v[0] : v)}
            />
          </div>
          <div role="radiogroup" aria-label="Partial" className="flex flex-wrap gap-1.5">
            {PARTIALS.map(({ partial: p, label }) => (
              <button
                key={p}
                role="radio"
                aria-checked={partial === p}
                onClick={() => setPartial(p)}
                className={cn(
                  "stack-sm stack-press px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider under-primary",
                  partial === p ? "bg-brass" : "bg-card text-muted-foreground hover:text-foreground",
                )}
              >
                {label} partial
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          className="h-10 bg-brass text-foreground under-primary"
          onPointerDown={startNote}
          onPointerUp={stopNote}
          onPointerLeave={() => playing && !lickPlaying && stopNote()}
          onKeyDown={(e) => {
            if ((e.key === " " || e.key === "Enter") && !e.repeat) {
              e.preventDefault();
              startNote();
            }
          }}
          onKeyUp={(e) => (e.key === " " || e.key === "Enter") && stopNote()}
        >
          <Volume2 aria-hidden />
          Hold to play
        </Button>
        <Button variant="outline" className="h-10 under-brass" onClick={playLick} disabled={lickPlaying}>
          {lickPlaying ? <Music2 className="animate-pulse" aria-hidden /> : <Play aria-hidden />}
          Play a B♭ arpeggio
        </Button>
      </div>
    </div>
  );
}
