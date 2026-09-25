import { skills } from "@/content/resume";
import { cn } from "@/lib/utils";
import { Reveal } from "./motion";
import { SectionHeading } from "./section-heading";

const underTones = ["under-climb", "under-brass", "under-disc", "under-primary"];
const pad = (n: number) => String(n).padStart(2, "0");

const practices = [
  "Progressive Web Apps",
  "Data & media pipelines",
  "Infrastructure as code",
  "Agentic AI coding",
  "Agile delivery",
  "FERPA-compliant data handling",
  "Mentoring",
  "SaaS integration & troubleshooting",
];

export function Skills() {
  return (
    <section id="skills" aria-labelledby="skills-title" className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
      <SectionHeading
        id="skills-title"
        eyebrow="Skills"
        title="The rack."
        description="The gear I clip into every day, plus the practices that keep projects moving."
      />

      <ul className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {skills.map((skill, i) => (
          <li key={skill.name}>
            <Reveal delay={0.04 * i} className="h-full">
              <div
                className={cn(
                  "stack stack-press relative h-full bg-card p-4 pt-7",
                  underTones[i % underTones.length],
                  i % 2 ? "tilt-r" : "tilt-l",
                )}
              >
                <span aria-hidden className="index-no">{pad(i + 1)}</span>
                <p className="font-heading text-lg font-bold">{skill.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{"detail" in skill ? skill.detail : " "}</p>
              </div>
            </Reveal>
          </li>
        ))}
      </ul>

      <Reveal delay={0.1}>
        <ul className="mt-8 flex flex-wrap gap-2" aria-label="Practices">
          {practices.map((p) => (
            <li
              key={p}
              className="stack-sm bg-card px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider under-brass transition-colors hover:bg-brass"
            >
              {p}
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
