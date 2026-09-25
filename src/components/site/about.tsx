import { Cloud, Code2, Database, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { focusAreas, profile, stats } from "@/content/resume";
import { cn } from "@/lib/utils";
import { Reveal } from "./motion";
import { SectionHeading } from "./section-heading";

const focusIcons = [Code2, Database, Cloud, Users];
// Reason: brutalism leans on flat colour blocks; rotate through the accents so the grid isn't all white.
const statTones = [
  { bg: "bg-brass", under: "under-primary", tilt: "tilt-l" },
  { bg: "bg-card ruled", under: "under-climb", tilt: "tilt-r" },
  { bg: "bg-card ruled", under: "under-disc", tilt: "tilt-r" },
  { bg: "bg-disc", under: "under-primary", tilt: "tilt-l" },
];
const focusTones = [
  { chip: "bg-climb", under: "under-climb" },
  { chip: "bg-brass", under: "under-brass" },
  { chip: "bg-primary text-primary-foreground", under: "under-primary" },
  { chip: "bg-disc", under: "under-disc" },
];
const pad = (n: number) => String(n).padStart(2, "0");

export function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <div>
          <SectionHeading
            id="about-title"
            eyebrow="About"
            title="Engineer who likes owning the whole problem."
          />
          <Reveal delay={0.1}>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground text-pretty">{profile.summary}</p>
          </Reveal>
        </div>

        <dl className="grid grid-cols-2 gap-3 self-end sm:gap-4">
          {stats.map((stat, i) => {
            const tone = statTones[i % statTones.length];
            return (
              <Reveal key={stat.label} delay={0.05 * i}>
                <div className={cn("stack relative h-full p-5 sm:p-6", tone.bg, tone.under, tone.tilt)}>
                  <span aria-hidden className="index-no">{pad(i + 1)}</span>
                  <dt className="sr-only">{stat.label}</dt>
                  <dd>
                    <span className="block font-heading text-4xl font-extrabold sm:text-5xl">{stat.value}</span>
                    <span className="mt-2 block text-sm font-medium leading-snug">{stat.label}</span>
                  </dd>
                </div>
              </Reveal>
            );
          })}
        </dl>
      </div>

      <ul className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {focusAreas.map((area, i) => {
          const Icon = focusIcons[i];
          const tone = focusTones[i % focusTones.length];
          return (
            <li key={area.title} className="pt-4">
              <Reveal delay={0.06 * i} className="h-full">
                <Card className={cn("group stack-press h-full pt-6", tone.under, i % 2 ? "tilt-r" : "tilt-l")}>
                  {/* Icon hangs off the top edge like a folder tab. */}
                  <span
                    className={cn(
                      "absolute -top-5 left-4 inline-flex border-2 border-foreground p-1.5 transition-transform group-hover:-rotate-6",
                      tone.chip,
                    )}
                  >
                    <Icon className="size-4" strokeWidth={2.5} aria-hidden />
                  </span>
                  <span aria-hidden className="index-no">{pad(i + 1)}</span>
                  <CardContent className="flex flex-col gap-2">
                    <h3 className="font-heading text-lg font-bold">{area.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{area.body}</p>
                  </CardContent>
                </Card>
              </Reveal>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
