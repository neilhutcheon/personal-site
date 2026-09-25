"use client";

import { useReducedMotion } from "framer-motion";
import { ArrowRight, Disc3, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  ANGLE_RANGE,
  BASKET,
  CHAINS_RADIUS,
  CIRCLE_RADIUS,
  FAIRWAY,
  FEET_PER_UNIT,
  PAR,
  POWER_RANGE,
  TEE,
  TREES,
  applyTreeHit,
  computeFlight,
  findTreeHit,
  flightToPath,
  formatToPar,
  nextLie,
  pointOnFlight,
  scoreName,
  scoreThrow,
  truncateFlight,
  type Flight,
  type Point,
  type ThrowResult,
} from "@/lib/disc-flight";
import { cn } from "@/lib/utils";

const FLIGHT_MS = 1500;
const INK = "var(--foreground)";

const resultCopy: Record<ThrowResult, (ft: number) => string> = {
  chains: () => "Chains! That one's in the basket.",
  circle: (ft) => `Parked. ${ft} ft putt from inside the circle.`,
  fairway: (ft) => `Fairway. ${ft} ft to the pin. Play it from there.`,
  rough: (ft) => `Out of bounds. Penalty stroke, back in play ${ft} ft out.`,
  tree: (ft) => `Tree! Kicked straight down, ${ft} ft from the pin. Shape it around next time.`,
};

type ThrowState = { flight: Flight; result: ThrowResult; feet: number; hitTree: number | null };

export function DiscGolf() {
  const reduceMotion = useReducedMotion();
  const [power, setPower] = useState(60);
  const [angle, setAngle] = useState(0);
  const [flying, setFlying] = useState(false);
  const [last, setLast] = useState<ThrowState | null>(null);
  // Where the next throw is taken from. Starts on the tee, then wherever the disc lands.
  const [lie, setLie] = useState<Point>(TEE);
  const [strokes, setStrokes] = useState(0);
  const [holed, setHoled] = useState(false);
  // Running scorecard across completed holes.
  const [holesPlayed, setHolesPlayed] = useState(0);
  const [totalStrokes, setTotalStrokes] = useState(0);
  const discRef = useRef<SVGGElement>(null);
  const trailRef = useRef<SVGPathElement>(null);
  const rafRef = useRef<number>(0);

  const preview = useMemo(() => truncateFlight(computeFlight(power, angle, 0, lie), 0.45), [power, angle, lie]);
  const feetToPin = Math.round(Math.hypot(BASKET.x - lie.x, BASKET.y - lie.y) * FEET_PER_UNIT);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const placeDisc = (x: number, y: number, t: number) => {
    // Reason: scale peaks mid-flight to fake altitude in a top-down view.
    const scale = 1 + Math.sin(Math.PI * t) * 0.6;
    discRef.current?.setAttribute("transform", `translate(${x} ${y}) scale(${scale}) rotate(${t * 1440})`);
  };

  const land = (flight: Flight, hitTree: number | null) => {
    const scored = scoreThrow(flight.end);
    // Reason: a tree strike drops the disc where it hit, so it's never chains even if that spot is close.
    const result: ThrowResult = hitTree !== null && scored.result !== "rough" ? "tree" : scored.result;
    const next = nextLie(flight.end);
    // Reason: after an OB throw the disc is played from the relocated lie, so report that distance.
    const feet =
      result === "rough" ? Math.round(Math.hypot(next.x - BASKET.x, next.y - BASKET.y) * FEET_PER_UNIT) : scored.feetFromBasket;
    setLast({ flight, result, feet, hitTree });
    // Reason: out of bounds costs a penalty stroke on top of the throw, like real disc golf.
    setStrokes((n) => n + (result === "rough" ? 2 : 1));
    if (result === "chains") {
      setHoled(true);
    } else {
      setLie(next);
      if (result === "rough") placeDisc(next.x, next.y, 1);
    }
    setFlying(false);
  };

  const throwDisc = () => {
    if (flying || holed) return;
    const jitter = (Math.random() - 0.5) * 8;
    const intended = computeFlight(power, angle, jitter, lie);
    const hit = findTreeHit(intended);
    const flight = hit ? applyTreeHit(intended, hit) : intended;
    const hitTree = hit ? hit.tree : null;
    setLast(null);

    if (reduceMotion) {
      placeDisc(flight.end.x, flight.end.y, 1);
      land(flight, hitTree);
      return;
    }

    setFlying(true);
    const trail = trailRef.current;
    if (trail) {
      trail.setAttribute("d", flightToPath(flight));
      const len = trail.getTotalLength();
      trail.style.strokeDasharray = `${len}`;
      trail.style.strokeDashoffset = `${len}`;
    }
    const startTime = performance.now();
    const tick = (now: number) => {
      const raw = Math.min(1, (now - startTime) / FLIGHT_MS);
      const t = 1 - Math.pow(1 - raw, 2.2);
      const p = pointOnFlight(flight, t);
      placeDisc(p.x, p.y, t);
      if (trail) trail.style.strokeDashoffset = `${trail.getTotalLength() * (1 - t)}`;
      if (raw < 1) rafRef.current = requestAnimationFrame(tick);
      else land(flight, hitTree);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const teeUp = () => {
    cancelAnimationFrame(rafRef.current);
    setFlying(false);
    setLast(null);
    setLie(TEE);
    setStrokes(0);
    setHoled(false);
    placeDisc(TEE.x, TEE.y, 0);
    trailRef.current?.setAttribute("d", "");
  };

  const nextHole = () => {
    setHolesPlayed((n) => n + 1);
    setTotalStrokes((n) => n + strokes);
    teeUp();
  };

  const reset = () => {
    setHolesPlayed(0);
    setTotalStrokes(0);
    teeUp();
  };

  const angleLabel =
    angle < -5 ? `${Math.abs(angle)}° hyzer` : angle > 5 ? `${angle}° anhyzer` : "Flat release";

  const status = holed
    ? `${scoreName(strokes)}! Holed out in ${strokes}.`
    : last
      ? resultCopy[last.result](last.feet)
      : strokes === 0
        ? "Right-hand backhand. Line it up and let it rip."
        : `${feetToPin} ft to the pin.`;
  const toPar = formatToPar(totalStrokes - holesPlayed * PAR);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_17rem] lg:items-center">
      <svg
        viewBox={`0 0 ${FAIRWAY.width} ${FAIRWAY.height}`}
        className="stack w-full under-disc"
        role="img"
        aria-label={`Top-down disc golf hole, par ${PAR}, about 300 feet. ${status}`}
      >
        <defs>
          <pattern id="mow" width="60" height={FAIRWAY.height} patternUnits="userSpaceOnUse">
            <rect width="30" height={FAIRWAY.height} fill="oklch(1 0 0 / 7%)" />
          </pattern>
        </defs>
        {/* Flat colour: darker rough on the edges, mown fairway between the OB lines. */}
        <rect width={FAIRWAY.width} height={FAIRWAY.height} fill="oklch(0.55 0.13 145)" />
        <rect x="0" y="18" width={FAIRWAY.width} height={FAIRWAY.height - 36} fill="oklch(0.7 0.17 140)" />
        <rect x="0" y="18" width={FAIRWAY.width} height={FAIRWAY.height - 36} fill="url(#mow)" />
        <line x1="0" y1="18" x2={FAIRWAY.width} y2="18" stroke={INK} strokeWidth="2" strokeDasharray="8 6" />
        <line x1="0" y1={FAIRWAY.height - 18} x2={FAIRWAY.width} y2={FAIRWAY.height - 18} stroke={INK} strokeWidth="2" strokeDasharray="8 6" />

        {TREES.map(({ x, y, r }, i) => {
          const struck = last?.hitTree === i;
          return (
            <g key={i} className={cn(struck && !reduceMotion && "animate-[tree-shake_0.5s_ease-out]")} style={{ transformOrigin: `${x}px ${y}px` }}>
              <circle cx={x} cy={y} r={r} fill="oklch(0.42 0.12 148)" stroke={INK} strokeWidth="2" />
              <circle cx={x - r * 0.25} cy={y - r * 0.25} r={r * 0.5} fill="oklch(0.52 0.14 145)" />
              {struck && <circle cx={x} cy={y} r={r + 4} fill="none" stroke="var(--climb)" strokeWidth="3" />}
            </g>
          );
        })}

        <rect x={TEE.x - 26} y={TEE.y - 12} width="40" height="24" fill="oklch(0.75 0.02 70)" stroke={INK} strokeWidth="2" />
        <text x={TEE.x - 6} y={TEE.y + 28} textAnchor="middle" className="fill-foreground font-mono text-[10px] font-bold uppercase">
          tee
        </text>

        <circle cx={BASKET.x} cy={BASKET.y} r={CIRCLE_RADIUS} fill="oklch(1 0 0 / 12%)" stroke={INK} strokeWidth="1.5" strokeDasharray="4 5" />
        <circle cx={BASKET.x} cy={BASKET.y} r={CHAINS_RADIUS} fill="oklch(0.92 0.005 250)" stroke={INK} strokeWidth="2.5" />
        <circle cx={BASKET.x} cy={BASKET.y} r={CHAINS_RADIUS - 6} fill="none" stroke={INK} strokeWidth="1.5" strokeDasharray="2 2" />
        <circle cx={BASKET.x} cy={BASKET.y} r="3.5" fill="var(--climb)" stroke={INK} strokeWidth="1.5" />

        <path
          d={flightToPath(preview)}
          fill="none"
          stroke={INK}
          strokeWidth="2.5"
          strokeDasharray="2 7"
          strokeLinecap="round"
          opacity={flying || holed ? 0 : 1}
        />
        <path ref={trailRef} fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
        {last && !holed && (
          <circle cx={lie.x} cy={lie.y} r="14" fill="none" stroke={INK} strokeWidth="2" strokeOpacity="0.6">
            {!reduceMotion && <animate attributeName="r" from="6" to="22" dur="1.2s" repeatCount="indefinite" />}
            {!reduceMotion && <animate attributeName="stroke-opacity" from="0.8" to="0" dur="1.2s" repeatCount="indefinite" />}
          </circle>
        )}

        <g ref={discRef} transform={`translate(${TEE.x} ${TEE.y})`}>
          <circle r="8" fill="var(--brass)" stroke={INK} strokeWidth="2" />
          <circle r="4.5" fill="none" stroke={INK} strokeWidth="1.5" />
          <line x1="-6" y1="0" x2="6" y2="0" stroke={INK} strokeWidth="1.5" />
        </g>
      </svg>

      <div className="space-y-5">
        <div className="space-y-3">
          <div className="flex items-baseline justify-between text-sm">
            <label id="power-label" className="font-bold">Power</label>
            <span className="border-2 border-foreground bg-card px-1.5 font-mono text-xs font-bold">{power}%</span>
          </div>
          <Slider
            aria-labelledby="power-label"
            min={POWER_RANGE.min}
            max={POWER_RANGE.max}
            value={[power]}
            onValueChange={(v) => setPower(Array.isArray(v) ? v[0] : v)}
            disabled={flying}
          />
        </div>
        <div className="space-y-3">
          <div className="flex items-baseline justify-between text-sm">
            <label id="angle-label" className="font-bold">Release angle</label>
            <span className="border-2 border-foreground bg-card px-1.5 font-mono text-xs font-bold">{angleLabel}</span>
          </div>
          <Slider
            aria-labelledby="angle-label"
            min={ANGLE_RANGE.min}
            max={ANGLE_RANGE.max}
            value={[angle]}
            onValueChange={(v) => setAngle(Array.isArray(v) ? v[0] : v)}
            disabled={flying}
          />
          <div className="flex justify-between font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            <span>Hyzer</span>
            <span>Anhyzer</span>
          </div>
        </div>

        <div className="flex gap-2">
          {holed ? (
            <Button onClick={nextHole} className="h-10 flex-1 bg-disc text-foreground under-primary">
              <ArrowRight aria-hidden />
              Next hole
            </Button>
          ) : (
            <Button onClick={throwDisc} disabled={flying} className="h-10 flex-1 bg-disc text-foreground under-primary">
              <Disc3 className={cn(flying && "animate-spin")} aria-hidden />
              {flying ? "In flight…" : strokes === 0 ? "Throw" : "Throw from the lie"}
            </Button>
          )}
          <Button variant="outline" size="icon-lg" className="size-10 under-disc" onClick={reset} aria-label="Reset scorecard">
            <RotateCcw aria-hidden />
          </Button>
        </div>

        <p aria-live="polite" className="min-h-12 text-sm font-bold">
          {holed ? <span className="inline-block border-2 border-foreground bg-disc px-2 py-0.5">{status}</span> : status}
        </p>
        <p className="inline-block border-2 border-foreground bg-muted px-2 py-0.5 font-mono text-xs font-bold uppercase tracking-wider">
          Hole {holesPlayed + 1} · Par {PAR} · Stroke {strokes}
          {holesPlayed > 0 && ` · ${toPar} thru ${holesPlayed}`}
        </p>
      </div>
    </div>
  );
}
