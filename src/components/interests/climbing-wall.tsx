"use client";

import { useReducedMotion } from "framer-motion";
import { RotateCcw, Undo2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  HOLDS,
  START_HOLD,
  canReach,
  gradeForMoves,
  holdById,
  holdName,
  type HoldKind,
} from "@/lib/climbing";
import { cn } from "@/lib/utils";

const kindClass: Record<HoldKind, string> = {
  jug: "bg-climb",
  crimp: "bg-brass",
  sloper: "bg-primary text-primary-foreground",
  pinch: "bg-disc",
};

type World = {
  sync: (state: { path: string[]; reachable: string[]; sent: boolean; reducedMotion: boolean }) => void;
  dispose: () => void;
};

export function ClimbingWall() {
  const reduced = useReducedMotion();
  const hostRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<World | null>(null);
  const [path, setPath] = useState<string[]>([START_HOLD.id]);
  const [failed, setFailed] = useState(false);

  const current = holdById(path[path.length - 1]);
  const moves = path.length - 1;
  const sent = Boolean(current.top);
  const reachable = useMemo(() => {
    if (sent) return new Set<string>();
    return new Set(HOLDS.filter((hold) => canReach(current, hold)).map((hold) => hold.id));
  }, [current, sent]);

  const grab = useCallback((id: string) => {
    setPath((prev) => {
      const next = HOLDS.find((hold) => hold.id === id);
      const from = holdById(prev[prev.length - 1]);
      if (!next || from.top || !canReach(from, next)) return prev;
      return [...prev, id];
    });
  }, []);

  const onGrabRef = useRef(grab);
  const stateRef = useRef({
    path,
    reachable: [...reachable],
    sent,
    reducedMotion: Boolean(reduced),
  });

  useEffect(() => {
    onGrabRef.current = grab;
  }, [grab]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let dead = false;
    let world: World | null = null;
    // Reason: three.js touches WebGL, so it loads after hydration instead of during the server render.
    import("@/components/interests/climbing/world")
      .then(({ ClimbingWorld }) => {
        if (dead) return;
        try {
          world = new ClimbingWorld(host, (id) => onGrabRef.current(id));
          world.sync(stateRef.current);
          worldRef.current = world;
        } catch {
          setFailed(true);
        }
      })
      .catch(() => {
        if (!dead) setFailed(true);
      });
    return () => {
      dead = true;
      world?.dispose();
      worldRef.current = null;
    };
  }, []);

  useEffect(() => {
    const state = {
      path,
      reachable: [...reachable],
      sent,
      reducedMotion: Boolean(reduced),
    };
    stateRef.current = state;
    worldRef.current?.sync(state);
  }, [path, reachable, sent, reduced]);

  const options = HOLDS.filter((hold) => reachable.has(hold.id)).sort((a, b) => a.y - b.y || a.x - b.x);
  const status = sent
    ? `Sent it! ${moves} moves, graded ${gradeForMoves(moves)}.`
    : moves === 0
      ? "On the start jug. Grab a glowing hold your climber can reach."
      : `${holdName(current)}. ${moves} move${moves === 1 ? "" : "s"} in, ${options.length} within reach.`;

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div>
        <div className="stack relative h-[26rem] w-full overflow-hidden bg-background under-climb sm:h-[36rem]">
          <div ref={hostRef} className="absolute inset-0" />
          {failed ? (
            <p className="absolute inset-0 grid place-items-center p-6 text-center text-sm font-bold">
              This browser can&apos;t show the 3D wall. Use the hold buttons to climb.
            </p>
          ) : null}
        </div>
        <p className="mt-3 font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Drag to look around · click a glowing hold
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Your beta</p>
          <p
            aria-live="polite"
            className={cn("mt-2 text-lg font-bold", sent && "inline-block border-2 border-foreground bg-climb px-2")}
          >
            {status}
          </p>
        </div>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div className="stack-sm ruled bg-card p-3 under-primary">
            <dt className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">Moves</dt>
            <dd className="font-heading text-2xl font-extrabold">{moves}</dd>
          </div>
          <div className={cn("stack-sm p-3 under-climb", sent ? "bg-brass" : "ruled bg-card")}>
            <dt className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">Grade</dt>
            <dd className="font-heading text-2xl font-extrabold">{sent ? gradeForMoves(moves) : "—"}</dd>
          </div>
        </dl>
        <p className="text-sm text-muted-foreground">
          The glowing holds are in reach. Bigger, fewer moves earn a harder grade — four moves sends it at{" "}
          {gradeForMoves(4)}.
        </p>
        <div className="flex flex-wrap gap-2" aria-label="Holds within reach">
          {options.map((hold) => (
            <Button key={hold.id} variant="outline" size="sm" className={kindClass[hold.kind]} onClick={() => grab(hold.id)}>
              {holdName(hold)}
            </Button>
          ))}
        </div>
        <ul className="flex flex-wrap gap-1.5" aria-label="Hold colours">
          {(["jug", "crimp", "sloper", "pinch"] as HoldKind[]).map((kind) => (
            <li
              key={kind}
              className={cn(
                "border-2 border-foreground px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider",
                kindClass[kind],
              )}
            >
              {kind}
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setPath((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev))} disabled={moves === 0}>
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
