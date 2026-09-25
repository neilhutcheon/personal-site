"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { Flag } from "lucide-react";
import { useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { roles } from "@/content/resume";
import { cn } from "@/lib/utils";
import { Reveal } from "./motion";
import { SectionHeading } from "./section-heading";

const holdTones = [
  { bg: "bg-climb", under: "under-climb" },
  { bg: "bg-brass", under: "under-brass" },
  { bg: "bg-disc", under: "under-disc" },
  { bg: "bg-primary", under: "under-primary" },
];

const holdShapes = [
  "rounded-[60%_40%_55%_45%/50%_60%_40%_50%]",
  "rounded-[40%_60%_45%_55%/60%_40%_60%_40%]",
  "rounded-[55%_45%_40%_60%/45%_55%_45%_55%]",
  "rounded-[45%_55%_60%_40%/55%_45%_55%_45%]",
];

export function Experience() {
  const routeRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: routeRef, offset: ["start 75%", "end 60%"] });
  const rope = useSpring(scrollYProgress, { stiffness: 90, damping: 22 });

  return (
    <section
      id="experience"
      aria-labelledby="experience-title"
      className="relative border-b-[3px] border-foreground bg-muted py-24 sm:py-32"
    >
      <div aria-hidden className="grid-paper absolute inset-0 -z-10" />
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          id="experience-title"
          eyebrow="Experience"
          title="The route so far."
          description="Four roles at Curve10 LLC, from part-time junior engineer in 2021 to senior engineer owning architecture today. Read it top-down like a topo: the crux is where I am now."
        />

        <div ref={routeRef} className="relative mt-16 pl-12 sm:pl-16">
          <div aria-hidden className="absolute left-[14px] top-2 bottom-2 w-1 bg-foreground sm:left-[22px]" />
          <motion.div
            aria-hidden
            style={{ scaleY: rope }}
            className="absolute left-[14px] top-2 bottom-2 w-1 origin-top bg-primary sm:left-[22px]"
          />

          <ol className="space-y-10">
          <li className="relative flex min-h-8 items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.2em] sm:min-h-12">
            <span className="absolute -left-12 grid size-8 place-items-center border-2 border-foreground bg-climb shadow-brutal-sm sm:-left-16 sm:size-12">
              <Flag className="size-4" strokeWidth={2.5} aria-hidden />
            </span>
            Top of the route · still climbing
          </li>

          {roles.map((role, i) => {
            const tone = holdTones[i % holdTones.length];
            return (
            <li key={role.title} className="relative pt-3">
              <span
                aria-hidden
                className={cn(
                  "absolute -left-12 top-4 size-8 border-[3px] border-foreground shadow-brutal-sm sm:-left-16 sm:size-12",
                  holdShapes[i % holdShapes.length],
                  tone.bg,
                )}
              />
              <Reveal>
                <article className={cn("stack relative bg-card p-6 pt-8 sm:p-8 sm:pt-9", tone.under)}>
                  {/* Period rides the top edge like a folder tab. */}
                  <span className={cn("tab", tone.bg, i === 3 && "text-primary-foreground")}>{role.period}</span>
                  <header className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
                    <div>
                      <h3 className="font-heading text-xl font-extrabold sm:text-2xl">{role.title}</h3>
                      <p className="font-medium text-muted-foreground">{role.company}</p>
                    </div>
                    <Badge variant="outline" className={i === 0 ? "bg-brass" : undefined}>
                      {role.grade}
                    </Badge>
                  </header>

                  <ul className="mt-5 space-y-2.5 text-[0.95rem] leading-relaxed text-muted-foreground">
                    {role.highlights.map((h) => (
                      <li key={h} className="flex gap-3">
                        <span aria-hidden className="mt-2 size-2.5 shrink-0 border-2 border-foreground bg-primary" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>

                  {role.clients ? (
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      {role.clients.map((c) => (
                        <div key={c.name} className="ruled border-2 border-foreground bg-card p-4">
                          <p className="font-heading font-bold text-foreground">{c.name}</p>
                          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{c.detail}</p>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </article>
              </Reveal>
            </li>
            );
          })}
          </ol>
        </div>
      </div>
    </section>
  );
}
