"use client";

import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw, Undo2 } from "lucide-react";
import { useMemo, useState, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  HOLDS,
  REACH,
  START_HOLD,
  WALL,
  canReach,
  gradeForMoves,
  type Hold,
} from "@/lib/climbing";
import { cn } from "@/lib/utils";

const holdColors: Record<Hold["kind"], string> = {
  jug: "var(--climb)",
  crimp: "var(--brass)",
  sloper: "oklch(0.7 0.13 250)",
  pinch: "var(--disc)",
};

// Organic blob outline scaled by radius; rotated per hold so no two look identical.
function holdPath(r: number) {
  const k = r / 10;
  return `M${-10 * k} ${-2 * k} C${-9 * k} ${-9 * k} ${6 * k} ${-11 * k} ${10 * k} ${-4 * k} C${13 * k} ${2 * k} ${7 * k} ${10 * k} ${0} ${9 * k} C${-7 * k} ${9 * k} ${-11 * k} ${4 * k} ${-10 * k} ${-2 * k}Z`;
}

const byId = new Map(HOLDS.map((h) => [h.id, h]));
const chalk = Array.from({ length: 10 }, (_, i) => ({
  angle: (i / 10) * Math.PI * 2,
  dist: 26 + (i % 3) * 10,
}));

export function ClimbingWall() {
  const [path, setPath] = useState<string[]>([START_HOLD.id]);
  const current = byId.get(path[path.length - 1])!;
  const moves = path.length - 1;
  const sent = Boolean(current.top);

  const reachable = useMemo(
    () => new Set(HOLDS.filter((h) => !sent && canReach(current, h)).map((h) => h.id)),
    [current, sent],
  );

  const grab = (hold: Hold) => {
    if (!reachable.has(hold.id)) return;
    setPath((p) => [...p, hold.id]);
  };

  const onHoldKey = (e: KeyboardEvent, hold: Hold) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      grab(hold);
    }
  };

  const status = sent
    ? `Sent it! ${moves} moves, graded ${gradeForMoves(moves)}.`
    : moves === 0
      ? "On the start hold. Pick a glowing hold within reach."
      : `${moves} move${moves === 1 ? "" : "s"} in. ${reachable.size} holds within reach.`;

  const ropePoints = path.map((id) => `${byId.get(id)!.x},${byId.get(id)!.y}`).join(" ");

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,20rem)_1fr] md:items-center">
      <div className="relative mx-auto w-full max-w-[20rem]">
        <svg
          viewBox={`0 0 ${WALL.width} ${WALL.height}`}
          className="w-full rounded-2xl border border-border shadow-xl"
          role="group"
          aria-label="Bouldering wall. Holds within reach can be grabbed."
        >
          <defs>
            <linearGradient id="wall-bg" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="oklch(0.3 0.03 60)" />
              <stop offset="1" stopColor="oklch(0.22 0.025 60)" />
            </linearGradient>
            <pattern id="t-nuts" width="32" height="32" patternUnits="userSpaceOnUse">
              <circle cx="16" cy="16" r="1.6" fill="oklch(0 0 0 / 35%)" />
            </pattern>
          </defs>
          <rect width={WALL.width} height={WALL.height} fill="url(#wall-bg)" />
          <rect width={WALL.width} height={WALL.height} fill="url(#t-nuts)" />
          <line x1="0" y1="160" x2={WALL.width} y2="160" stroke="oklch(0 0 0 / 25%)" />
          <line x1="0" y1="320" x2={WALL.width} y2="320" stroke="oklch(0 0 0 / 25%)" />

          {!sent && (
            <motion.circle
              cx={current.x}
              cy={current.y}
              r={REACH}
              fill="oklch(1 0 0 / 3%)"
              stroke="oklch(1 0 0 / 22%)"
              strokeDasharray="4 6"
              initial={false}
              animate={{ cx: current.x, cy: current.y }}
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
            />
          )}

          <polyline
            points={ropePoints}
            fill="none"
            stroke="oklch(0.95 0.01 90 / 70%)"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeDasharray="1 5"
            strokeLinecap="round"
          />

          {HOLDS.map((hold, i) => {
            const isReachable = reachable.has(hold.id);
            const visited = path.includes(hold.id);
            const label = `${hold.start ? "Start " : hold.top ? "Top " : ""}${hold.kind} hold${
              isReachable ? ", within reach" : visited ? ", already used" : ", out of reach"
            }`;
            return (
              <g
                key={hold.id}
                transform={`translate(${hold.x} ${hold.y})`}
                role="button"
                tabIndex={isReachable ? 0 : -1}
                aria-label={label}
                aria-disabled={!isReachable}
                onClick={() => grab(hold)}
                onKeyDown={(e) => onHoldKey(e, hold)}
                className={cn(
                  "outline-none [&:focus-visible>circle.focus]:opacity-100",
                  isReachable ? "cursor-pointer" : "cursor-not-allowed",
                )}
              >
                <circle className="focus" r={hold.r + 9} fill="none" stroke="white" strokeWidth="2" opacity="0" />
                {isReachable && (
                  <motion.circle
                    r={hold.r + 6}
                    fill="none"
                    stroke={holdColors[hold.kind]}
                    strokeWidth="2"
                    initial={{ opacity: 0.2, scale: 0.9 }}
                    animate={{ opacity: [0.2, 0.9, 0.2], scale: [0.9, 1.15, 0.9] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}
                <circle r={hold.r + 14} fill="transparent" />
                <path
                  d={holdPath(hold.r)}
                  transform={`rotate(${(i * 47) % 360})`}
                  fill={holdColors[hold.kind]}
                  opacity={isReachable || visited || sent ? 1 : 0.45}
                  stroke="oklch(0 0 0 / 40%)"
                  strokeWidth="1.5"
                  className="transition-opacity"
                />
                {(hold.start || hold.top) && (
                  <text
                    y={hold.r + 16}
                    textAnchor="middle"
                    className="fill-foreground font-mono text-[10px] uppercase tracking-widest"
                  >
                    {hold.start ? "start" : "top"}
                  </text>
                )}
              </g>
            );
          })}

          <motion.g
            initial={false}
            animate={{ x: current.x, y: current.y }}
            transition={{ type: "spring", stiffness: 160, damping: 16 }}
            pointerEvents="none"
          >
            <circle r="7" fill="white" stroke="oklch(0.2 0.02 255)" strokeWidth="2" />
            <circle r="2.5" fill="var(--climb)" />
          </motion.g>

          <AnimatePresence>
            {sent &&
              chalk.map((c, i) => (
                <motion.circle
                  key={i}
                  cx={current.x}
                  cy={current.y}
                  r="4"
                  fill="white"
                  initial={{ opacity: 0.9, cx: current.x, cy: current.y }}
                  animate={{
                    opacity: 0,
                    cx: current.x + Math.cos(c.angle) * c.dist,
                    cy: current.y + Math.sin(c.angle) * c.dist,
                  }}
                  transition={{ duration: 1.1, ease: "easeOut" }}
                />
              ))}
          </AnimatePresence>
        </svg>
      </div>

      <div className="space-y-5">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Your beta</p>
          <p aria-live="polite" className={cn("mt-2 text-lg font-medium", sent && "text-climb")}>
            {status}
          </p>
        </div>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl border border-border bg-background/60 p-3">
            <dt className="text-muted-foreground">Moves</dt>
            <dd className="font-heading text-2xl font-semibold">{moves}</dd>
          </div>
          <div className="rounded-xl border border-border bg-background/60 p-3">
            <dt className="text-muted-foreground">Grade</dt>
            <dd className="font-heading text-2xl font-semibold">{sent ? gradeForMoves(moves) : "—"}</dd>
          </div>
        </dl>
        <p className="text-sm text-muted-foreground">
          Fewer, bigger moves earn a harder grade. The dashed ring is your reach. Can you find the four-move beta?
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setPath((p) => p.slice(0, -1))} disabled={moves === 0}>
            <Undo2 aria-hidden />
            Downclimb
          </Button>
          <Button variant="outline" onClick={() => setPath([START_HOLD.id])} disabled={moves === 0}>
            <RotateCcw aria-hidden />
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
