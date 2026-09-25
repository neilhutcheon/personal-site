"use client";

import { useReducedMotion } from "framer-motion";
import { Disc3, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  ANGLE_RANGE,
  BASKET,
  CHAINS_RADIUS,
  CIRCLE_RADIUS,
  FAIRWAY,
  POWER_RANGE,
  TEE,
  computeFlight,
  flightToPath,
  pointOnFlight,
  scoreThrow,
  truncateFlight,
  type Flight,
  type ThrowResult,
} from "@/lib/disc-flight";
import { cn } from "@/lib/utils";

const FLIGHT_MS = 1500;

const resultCopy: Record<ThrowResult, (ft: number) => string> = {
  chains: () => "Chains! That one's in the basket.",
  circle: (ft) => `Parked. ${ft} ft tap-in inside the circle.`,
  fairway: (ft) => `Fairway. ${ft} ft from the pin.`,
  rough: (ft) => `Into the rough, ${ft} ft out. Tree kick incoming.`,
};

const trees = [
  [90, 36, 20], [150, 22, 16], [230, 40, 22], [330, 26, 18], [420, 44, 20],
  [120, 300, 22], [210, 286, 16], [300, 304, 20], [390, 290, 18], [470, 302, 22], [580, 250, 20],
] as const;

type ThrowState = { flight: Flight; result: ThrowResult; feet: number };

export function DiscGolf() {
  const reduceMotion = useReducedMotion();
  const [power, setPower] = useState(60);
  const [angle, setAngle] = useState(0);
  const [flying, setFlying] = useState(false);
  const [last, setLast] = useState<ThrowState | null>(null);
  const [throws, setThrows] = useState(0);
  const [aces, setAces] = useState(0);
  const discRef = useRef<SVGGElement>(null);
  const trailRef = useRef<SVGPathElement>(null);
  const rafRef = useRef<number>(0);

  const preview = useMemo(() => truncateFlight(computeFlight(power, angle), 0.45), [power, angle]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const placeDisc = (x: number, y: number, t: number) => {
    // Reason: scale peaks mid-flight to fake altitude in a top-down view.
    const scale = 1 + Math.sin(Math.PI * t) * 0.6;
    discRef.current?.setAttribute("transform", `translate(${x} ${y}) scale(${scale}) rotate(${t * 1440})`);
  };

  const land = (flight: Flight) => {
    const { result, feetFromBasket } = scoreThrow(flight.end);
    setLast({ flight, result, feet: feetFromBasket });
    setThrows((n) => n + 1);
    if (result === "chains") setAces((n) => n + 1);
    setFlying(false);
  };

  const throwDisc = () => {
    if (flying) return;
    const jitter = (Math.random() - 0.5) * 8;
    const flight = computeFlight(power, angle, jitter);
    setLast(null);

    if (reduceMotion) {
      placeDisc(flight.end.x, flight.end.y, 1);
      land(flight);
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
      else land(flight);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const reset = () => {
    cancelAnimationFrame(rafRef.current);
    setFlying(false);
    setLast(null);
    setThrows(0);
    setAces(0);
    placeDisc(TEE.x, TEE.y, 0);
    trailRef.current?.setAttribute("d", "");
  };

  const angleLabel =
    angle < -5 ? `${Math.abs(angle)}° hyzer` : angle > 5 ? `${angle}° anhyzer` : "Flat release";

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_17rem] lg:items-center">
      <svg
        viewBox={`0 0 ${FAIRWAY.width} ${FAIRWAY.height}`}
        className="w-full rounded-2xl border border-border shadow-xl"
        role="img"
        aria-label={`Top-down disc golf hole, about 300 feet. ${last ? resultCopy[last.result](last.feet) : "Disc on the tee."}`}
      >
        <defs>
          <linearGradient id="fairway-bg" x1="0" x2="1">
            <stop offset="0" stopColor="oklch(0.36 0.07 145)" />
            <stop offset="1" stopColor="oklch(0.31 0.06 150)" />
          </linearGradient>
          <pattern id="mow" width="60" height={FAIRWAY.height} patternUnits="userSpaceOnUse">
            <rect width="30" height={FAIRWAY.height} fill="oklch(1 0 0 / 3%)" />
          </pattern>
        </defs>
        <rect width={FAIRWAY.width} height={FAIRWAY.height} fill="oklch(0.27 0.05 150)" />
        <rect x="0" y="18" width={FAIRWAY.width} height={FAIRWAY.height - 36} fill="url(#fairway-bg)" />
        <rect x="0" y="18" width={FAIRWAY.width} height={FAIRWAY.height - 36} fill="url(#mow)" />
        <line x1="0" y1="18" x2={FAIRWAY.width} y2="18" stroke="oklch(0.95 0 0 / 50%)" strokeDasharray="8 6" />
        <line x1="0" y1={FAIRWAY.height - 18} x2={FAIRWAY.width} y2={FAIRWAY.height - 18} stroke="oklch(0.95 0 0 / 50%)" strokeDasharray="8 6" />

        {trees.map(([x, y, r], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r={r} fill="oklch(0.25 0.06 150)" />
            <circle cx={x - r * 0.25} cy={y - r * 0.25} r={r * 0.6} fill="oklch(0.33 0.08 145)" />
          </g>
        ))}

        <rect x={TEE.x - 26} y={TEE.y - 12} width="40" height="24" rx="3" fill="oklch(0.55 0.02 60)" />
        <text x={TEE.x - 6} y={TEE.y + 28} textAnchor="middle" className="fill-foreground/70 font-mono text-[10px] uppercase">
          tee
        </text>

        <circle cx={BASKET.x} cy={BASKET.y} r={CIRCLE_RADIUS} fill="oklch(1 0 0 / 4%)" stroke="oklch(1 0 0 / 30%)" strokeDasharray="3 5" />
        <circle cx={BASKET.x} cy={BASKET.y} r={CHAINS_RADIUS} fill="oklch(0.3 0.01 250)" stroke="oklch(0.85 0.01 250)" strokeWidth="2.5" />
        <circle cx={BASKET.x} cy={BASKET.y} r={CHAINS_RADIUS - 6} fill="none" stroke="oklch(0.85 0.01 250 / 70%)" strokeDasharray="2 2" />
        <circle cx={BASKET.x} cy={BASKET.y} r="3" fill="var(--brass)" />

        <path
          d={flightToPath(preview)}
          fill="none"
          stroke="oklch(1 0 0 / 55%)"
          strokeWidth="2"
          strokeDasharray="2 7"
          strokeLinecap="round"
          opacity={flying ? 0 : 1}
        />
        <path ref={trailRef} fill="none" stroke="var(--disc)" strokeOpacity="0.8" strokeWidth="2.5" strokeLinecap="round" />
        {last && (
          <circle cx={last.flight.end.x} cy={last.flight.end.y} r="14" fill="none" stroke="var(--disc)" strokeOpacity="0.5">
            {!reduceMotion && <animate attributeName="r" from="6" to="22" dur="1.2s" repeatCount="indefinite" />}
            {!reduceMotion && <animate attributeName="stroke-opacity" from="0.7" to="0" dur="1.2s" repeatCount="indefinite" />}
          </circle>
        )}

        <g ref={discRef} transform={`translate(${TEE.x} ${TEE.y})`}>
          <circle r="8" fill="var(--disc)" stroke="oklch(0.2 0.03 130)" strokeWidth="1.5" />
          <circle r="4.5" fill="none" stroke="oklch(0.2 0.03 130 / 60%)" />
          <line x1="-6" y1="0" x2="6" y2="0" stroke="oklch(0.2 0.03 130 / 60%)" />
        </g>
      </svg>

      <div className="space-y-5">
        <div className="space-y-3">
          <div className="flex items-baseline justify-between text-sm">
            <label id="power-label" className="font-medium">Power</label>
            <span className="font-mono text-muted-foreground">{power}%</span>
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
            <label id="angle-label" className="font-medium">Release angle</label>
            <span className="font-mono text-muted-foreground">{angleLabel}</span>
          </div>
          <Slider
            aria-labelledby="angle-label"
            min={ANGLE_RANGE.min}
            max={ANGLE_RANGE.max}
            value={[angle]}
            onValueChange={(v) => setAngle(Array.isArray(v) ? v[0] : v)}
            disabled={flying}
          />
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            <span>Hyzer</span>
            <span>Anhyzer</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={throwDisc} disabled={flying} className="h-10 flex-1 bg-disc text-background hover:bg-disc/85">
            <Disc3 className={cn(flying && "animate-spin")} aria-hidden />
            {flying ? "In flight…" : "Throw"}
          </Button>
          <Button variant="outline" size="icon-lg" className="size-10" onClick={reset} aria-label="Reset scorecard">
            <RotateCcw aria-hidden />
          </Button>
        </div>

        <p aria-live="polite" className={cn("min-h-12 text-sm font-medium", last?.result === "chains" && "text-disc")}>
          {last ? resultCopy[last.result](last.feet) : "Right-hand backhand. Line it up and let it rip."}
        </p>
        <p className="font-mono text-xs text-muted-foreground">
          Throws: {throws} · Chains: {aces}
        </p>
      </div>
    </div>
  );
}
