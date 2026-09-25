"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { Flag } from "lucide-react";
import { useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { roles } from "@/content/resume";
import { cn } from "@/lib/utils";
import { Reveal } from "./motion";
import { SectionHeading } from "./section-heading";

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
      className="relative border-y border-border bg-card/30 py-24 sm:py-32"
    >
      <div aria-hidden className="grain absolute inset-0 -z-10 opacity-40" />
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          id="experience-title"
          eyebrow="Experience"
          title="The route so far."
          description="Four roles at Curve10 LLC, from part-time junior engineer in 2021 to senior engineer owning architecture today. Read it top-down like a topo: the crux is where I am now."
        />

        <div ref={routeRef} className="relative mt-16 pl-12 sm:pl-16">
          <div aria-hidden className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-border sm:left-[23px]" />
          <motion.div
            aria-hidden
            style={{ scaleY: rope }}
            className="absolute left-[15px] top-2 bottom-2 w-0.5 origin-top bg-gradient-to-b from-climb via-brass to-disc sm:left-[23px]"
          />

          <ol className="space-y-10">
          <li className="relative -mb-4 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <span className="absolute -left-12 grid size-8 place-items-center rounded-full border border-border bg-background sm:-left-16 sm:size-12">
              <Flag className="size-4 text-climb" aria-hidden />
            </span>
            Top of the route · still climbing
          </li>

          {roles.map((role, i) => (
            <li key={role.title} className="relative">
              <span
                aria-hidden
                className={cn(
                  "absolute -left-12 top-1 size-8 border-2 border-background shadow-md sm:-left-16 sm:size-12",
                  holdShapes[i % holdShapes.length],
                  i === 0 ? "bg-climb" : i === 1 ? "bg-brass" : i === 2 ? "bg-disc" : "bg-muted-foreground",
                )}
              />
              <Reveal>
                <article className="rounded-2xl border border-border bg-background/70 p-6 shadow-sm backdrop-blur transition-colors hover:border-primary/40 sm:p-8">
                  <header className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
                    <div>
                      <h3 className="font-heading text-xl font-semibold sm:text-2xl">{role.title}</h3>
                      <p className="text-muted-foreground">{role.company}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono">
                        {role.grade}
                      </Badge>
                      <span className="font-mono text-sm text-muted-foreground">{role.period}</span>
                    </div>
                  </header>

                  <ul className="mt-5 space-y-2.5 text-[0.95rem] leading-relaxed text-muted-foreground">
                    {role.highlights.map((h) => (
                      <li key={h} className="flex gap-3">
                        <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>

                  {role.clients ? (
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      {role.clients.map((c) => (
                        <div key={c.name} className="rounded-xl border border-border bg-card/70 p-4">
                          <p className="font-medium text-foreground">{c.name}</p>
                          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{c.detail}</p>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </article>
              </Reveal>
            </li>
          ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
