import { Cloud, Code2, Database, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { focusAreas, profile, stats } from "@/content/resume";
import { Reveal } from "./motion";
import { SectionHeading } from "./section-heading";

const focusIcons = [Code2, Database, Cloud, Users];

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
          {stats.map((stat, i) => (
            <Reveal key={stat.label} delay={0.05 * i}>
              <div className="h-full rounded-2xl border border-border bg-card/60 p-5 sm:p-6">
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <span className="block font-heading text-4xl font-semibold text-primary sm:text-5xl">
                    {stat.value}
                  </span>
                  <span className="mt-2 block text-sm leading-snug text-muted-foreground">{stat.label}</span>
                </dd>
              </div>
            </Reveal>
          ))}
        </dl>
      </div>

      <ul className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {focusAreas.map((area, i) => {
          const Icon = focusIcons[i];
          return (
            <li key={area.title}>
              <Reveal delay={0.06 * i} className="h-full">
                <Card className="group h-full transition-colors hover:ring-primary/40">
                  <CardContent className="flex flex-col gap-3">
                    <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:-rotate-6 group-hover:scale-110">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <h3 className="font-heading text-lg font-semibold">{area.title}</h3>
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
