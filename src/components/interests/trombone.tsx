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

const SLIDE_TRAVEL = 230;
const SLIDE_HOME_X = 290;
const VIEW_W = 640;

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
    return positionFromExtension((SLIDE_HOME_X - svgX) / SLIDE_TRAVEL);
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
      className="space-y-6 rounded-2xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <div className="relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VIEW_W} 200`}
          className="w-full cursor-grab touch-none select-none active:cursor-grabbing"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={stopNote}
          onPointerCancel={stopNote}
          aria-hidden
        >
          <defs>
            <linearGradient id="brass" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="oklch(0.9 0.12 90)" />
              <stop offset="0.5" stopColor="oklch(0.78 0.14 80)" />
              <stop offset="1" stopColor="oklch(0.6 0.12 70)" />
            </linearGradient>
          </defs>

          {/* Position guide */}
          {Array.from({ length: 7 }, (_, i) => {
            const x = SLIDE_HOME_X - 20 - extensionFromPosition(i + 1) * SLIDE_TRAVEL;
            const active = Math.round(position) === i + 1;
            return (
              <g key={i}>
                <line x1={x} x2={x} y1="160" y2="170" stroke="currentColor" className={active ? "text-brass" : "text-muted-foreground/50"} strokeWidth="2" />
                <text x={x} y="188" textAnchor="middle" className={cn("font-mono text-[12px]", active ? "fill-brass" : "fill-muted-foreground")}>
                  {i + 1}
                </text>
              </g>
            );
          })}

          {/* Bell section (fixed) */}
          <g stroke="url(#brass)" strokeWidth="7" fill="none" strokeLinecap="round">
            <path d="M560 128 C600 128 612 100 600 78 C590 60 570 58 540 58 L230 58" />
            <path d="M470 128 L470 58" strokeWidth="5" />
          </g>
          <path d="M232 52 C200 50 170 30 140 14 L140 102 C170 86 200 66 232 64 Z" fill="url(#brass)" />
          <ellipse cx="140" cy="58" rx="9" ry="44" fill="oklch(0.55 0.1 70)" />

          {/* Inner slide (fixed) */}
          <g stroke="oklch(0.85 0.03 90)" strokeWidth="4">
            <line x1="560" y1="112" x2={SLIDE_HOME_X - 10} y2="112" />
            <line x1="560" y1="140" x2={SLIDE_HOME_X - 10} y2="140" />
          </g>
          <circle cx="572" cy="112" r="6" fill="url(#brass)" />

          {/* Outer slide (moves) */}
          <motion.g initial={false} animate={{ x: -offset }} transition={{ type: "spring", stiffness: 500, damping: 40 }}>
            <g stroke="url(#brass)" strokeWidth="8" fill="none" strokeLinecap="round">
              <path d={`M520 112 L${SLIDE_HOME_X - 10} 112 C${SLIDE_HOME_X - 38} 112 ${SLIDE_HOME_X - 38} 140 ${SLIDE_HOME_X - 10} 140 L520 140`} />
            </g>
            <rect x="500" y="104" width="10" height="44" rx="4" fill="url(#brass)" />
            <rect x="494" y="120" width="22" height="12" rx="5" className="fill-brass" opacity="0.9" />
          </motion.g>

          {/* Sound waves from the bell */}
          <AnimatePresence>
            {playing &&
              [0, 1, 2].map((i) => (
                <motion.path
                  key={i}
                  d="M118 30 Q96 58 118 86"
                  fill="none"
                  stroke="var(--brass)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ opacity: 0.9, x: 0 }}
                  animate={{ opacity: 0, x: -70 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.33, ease: "easeOut" }}
                />
              ))}
          </AnimatePresence>
        </svg>
        <p className="mt-1 text-center text-xs text-muted-foreground">
          Press and drag anywhere on the horn to play. Slide left to lower the pitch.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
        <div className="flex items-center gap-4">
          <div className="grid size-20 place-items-center rounded-2xl border border-border bg-background/60">
            <span aria-live="polite" className="font-heading text-2xl font-semibold text-brass">
              {note}
            </span>
          </div>
          <dl className="text-sm">
            <dt className="text-muted-foreground">Position</dt>
            <dd className="font-mono">{position.toFixed(1)}</dd>
            <dt className="mt-1 text-muted-foreground">Frequency</dt>
            <dd className="font-mono">{freq.toFixed(1)} Hz</dd>
          </dl>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label id="slide-label" className="text-sm font-medium">
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
                  "rounded-full border px-3 py-1 font-mono text-xs transition-colors",
                  partial === p
                    ? "border-brass bg-brass text-background"
                    : "border-border text-muted-foreground hover:border-brass/60 hover:text-foreground",
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
          className="h-10 bg-brass text-background hover:bg-brass/85"
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
        <Button variant="outline" className="h-10" onClick={playLick} disabled={lickPlaying}>
          {lickPlaying ? <Music2 className="animate-pulse" aria-hidden /> : <Play aria-hidden />}
          Play a B♭ arpeggio
        </Button>
      </div>
    </div>
  );
}
