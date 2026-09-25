import { skills } from "@/content/resume";
import { Reveal } from "./motion";
import { SectionHeading } from "./section-heading";

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
              <div className="group relative h-full overflow-hidden rounded-2xl border border-border bg-card/60 p-4 transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-climb via-brass to-disc transition-transform duration-300 group-hover:scale-x-100"
                />
                <p className="font-heading text-lg font-semibold">{skill.name}</p>
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
              className="rounded-full border border-border px-3.5 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
            >
              {p}
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
