import {
  ArrowDown,
  ArrowUpRight,
  ClipboardList,
  Cloud,
  Cpu,
  Database,
  Dices,
  FileVideo,
  Lock,
  MapPinned,
  Megaphone,
  MessageSquareText,
  MessagesSquare,
  ScanFace,
  Send,
  UsersRound,
} from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { projects, type Project } from "@/content/resume";
import { cn } from "@/lib/utils";
import { Reveal } from "./motion";
import { SectionHeading } from "./section-heading";

const projectTones = [
  { bg: "bg-disc", under: "under-disc" },
  { bg: "bg-brass", under: "under-brass" },
  { bg: "bg-climb", under: "under-climb" },
];

export function Projects() {
  const [own, featured, flagship, ...rest] = projects;
  return (
    <section
      id="projects"
      aria-labelledby="projects-title"
      className="relative py-24 sm:py-32"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          id="projects-title"
          eyebrow="Selected work"
          title="Problems I've owned end to end."
          description="My own business and the client systems I've built: the problem, how I solved it, and what it runs on."
        />

        <div className="mt-12 space-y-8">
          <ProjectCard project={own} tone={projectTones[1]} diagram={<GigFlow />} />
          <ProjectCard project={featured} tone={projectTones[0]} diagram={<FerpaPipeline />} />
          <ProjectCard project={flagship} tone={projectTones[2]} diagram={<GameDay />} />
          <div className="grid gap-8 lg:grid-cols-2">
            {rest.map((project, i) => (
              <ProjectCard key={project.id} project={project} tone={projectTones[(i + 1) % 2]} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProjectCard({
  project,
  tone,
  diagram,
}: {
  project: Project;
  tone: (typeof projectTones)[number];
  diagram?: ReactNode;
}) {
  return (
    <Reveal className="h-full">
      <article
        id={project.id}
        aria-labelledby={`${project.id}-title`}
        className={cn("stack relative h-full scroll-mt-24 bg-card p-6 pt-9 sm:p-8 sm:pt-10", tone.under)}
      >
        <span className={cn("tab", tone.bg)}>
          {project.client}
          {project.period ? ` · ${project.period}` : null}
        </span>
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <h3 id={`${project.id}-title`} className="font-heading text-2xl font-extrabold tracking-tight sm:text-3xl">
            {project.name}
          </h3>
          {project.url ? (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ size: "sm" }), "under-disc")}
            >
              Visit {new URL(project.url).hostname}
              <ArrowUpRight aria-hidden />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          ) : null}
        </div>

        <div className={cn("mt-6 grid gap-6", diagram && "lg:grid-cols-[1fr_1.1fr] lg:gap-10")}>
          <dl className="space-y-4 text-[0.95rem] leading-relaxed">
            <div>
              <dt className="font-mono text-xs font-bold uppercase tracking-[0.2em]">Problem</dt>
              <dd className="mt-1.5 text-muted-foreground">{project.problem}</dd>
            </div>
            <div>
              <dt className="font-mono text-xs font-bold uppercase tracking-[0.2em]">Architecture</dt>
              <dd className="mt-1.5">
                <ul className="space-y-2 text-muted-foreground">
                  {project.architecture.map((step) => (
                    <li key={step} className="flex gap-3">
                      <span aria-hidden className="mt-2 size-2.5 shrink-0 border-2 border-foreground bg-primary" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
            <div>
              <dt className="font-mono text-xs font-bold uppercase tracking-[0.2em]">Result</dt>
              <dd className="mt-1.5 text-muted-foreground">{project.result}</dd>
            </div>
            <div>
              <dt className="sr-only">Stack</dt>
              <dd>
                <ul className="flex flex-wrap gap-2" aria-label="Stack">
                  {project.stack.map((tech) => (
                    <li key={tech}>
                      <Badge variant="outline">{tech}</Badge>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          </dl>

          {diagram}
        </div>
      </article>
    </Reveal>
  );
}

const pipelineSteps = [
  { label: "Upload", where: "AWS S3", Icon: FileVideo, identifiable: true },
  { label: "Face blur", where: "Paperspace GPU", Icon: ScanFace, identifiable: true },
  { label: "Transcription", where: "AWS ECS", Icon: Cloud, identifiable: false },
  { label: "AI analysis", where: "AWS ECS", Icon: Cpu, identifiable: false },
  { label: "Teacher feedback", where: "Delivered", Icon: MessageSquareText, identifiable: false },
];

/** Flow of the classroom video pipeline, showing where footage stops being identifiable. */
function FerpaPipeline() {
  return (
    <figure className="ruled self-start border-2 border-foreground bg-card p-4 sm:p-5">
      <figcaption className="font-mono text-xs font-bold uppercase tracking-[0.2em]">
        Pipeline · where FERPA is enforced
      </figcaption>
      <ol className="mt-4 grid gap-1" aria-label="Classroom video pipeline steps">
        {pipelineSteps.map(({ label, where, Icon, identifiable }, i) => (
          <li key={label} className="grid gap-1">
            {i === 2 ? (
              <div
                aria-hidden
                className="my-1 flex items-center gap-2 font-mono text-[0.6875rem] font-bold uppercase tracking-wider"
              >
                <span className="h-0 flex-1 border-t-2 border-dashed border-foreground" />
                Faces blurred · de-identified from here
                <span className="h-0 flex-1 border-t-2 border-dashed border-foreground" />
              </div>
            ) : null}
            <div
              className={cn(
                "flex items-center gap-3 border-2 border-foreground px-3 py-1.5 shadow-brutal-sm",
                identifiable ? "bg-primary/15" : "bg-disc/40",
              )}
            >
              <span className="grid size-7 shrink-0 place-items-center border-2 border-foreground bg-card">
                <Icon className="size-4" strokeWidth={2.5} aria-hidden />
              </span>
              <span className="font-heading font-bold">{label}</span>
              <span className="ml-auto font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {where}
              </span>
              <span className="sr-only">
                {identifiable ? "(footage still identifiable)" : "(de-identified footage only)"}
              </span>
            </div>
            {i < pipelineSteps.length - 1 && i !== 1 ? (
              <ArrowDown aria-hidden className="mx-auto size-3.5" strokeWidth={2.5} />
            ) : null}
          </li>
        ))}
      </ol>
    </figure>
  );
}

const gigSteps = [
  { label: "Director posts the gig and chairs", where: "Supabase", Icon: Megaphone },
  { label: "Musicians find it on the map", where: "Mapbox", Icon: MapPinned },
  { label: "Apply with profile and references", where: "Supabase", Icon: UsersRound },
  { label: "Director books the players", where: "Resend", Icon: Send },
  { label: "Booked: parts, details, group thread", where: "Supabase", Icon: MessageSquareText },
];

/** How a gig gets filled on Descant, and which service carries each step. */
function GigFlow() {
  return (
    <figure className="ruled self-start border-2 border-foreground bg-card p-4 sm:p-5">
      <figcaption className="font-mono text-xs font-bold uppercase tracking-[0.2em]">
        How a gig gets filled
      </figcaption>
      <ol className="mt-4 grid gap-1" aria-label="Descant gig flow">
        {gigSteps.map(({ label, where, Icon }, i) => (
          <li key={label} className="grid gap-1">
            <div
              className={cn(
                "flex items-center gap-3 border-2 border-foreground px-3 py-1.5 shadow-brutal-sm",
                i === gigSteps.length - 1 ? "bg-brass/50" : "bg-card",
              )}
            >
              <span className="grid size-7 shrink-0 place-items-center border-2 border-foreground bg-card">
                <Icon className="size-4" strokeWidth={2.5} aria-hidden />
              </span>
              <span className="font-heading font-bold">{label}</span>
              <span className="ml-auto shrink-0 font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {where}
              </span>
            </div>
            {i < gigSteps.length - 1 ? <ArrowDown aria-hidden className="mx-auto size-3.5" strokeWidth={2.5} /> : null}
          </li>
        ))}
      </ol>
    </figure>
  );
}

const gameDaySteps = [
  { label: "Lock lineups at noon", where: "EventBridge", Icon: Lock },
  { label: "Import real play-by-play", where: "Step Functions", Icon: Database },
  { label: "Simulate every game", where: "SQS · Lambda", Icon: Dices, engine: true },
  { label: "Release box scores", where: "Scheduled Lambda", Icon: ClipboardList },
  { label: "Owners follow along", where: "React · Socket.IO", Icon: MessagesSquare },
];

/** Dominus's nightly game-day pipeline, from locked lineups to released scores. */
function GameDay() {
  return (
    <figure className="ruled self-start border-2 border-foreground bg-card p-4 sm:p-5">
      <figcaption className="font-mono text-xs font-bold uppercase tracking-[0.2em]">
        Game day · lineups to box scores
      </figcaption>
      <ol className="mt-4 grid gap-1" aria-label="Dominus game-day steps">
        {gameDaySteps.map(({ label, where, Icon, engine }, i) => (
          <li key={label} className="grid gap-1">
            <div
              className={cn(
                "flex items-center gap-3 border-2 border-foreground px-3 py-1.5 shadow-brutal-sm",
                engine ? "bg-climb/50" : "bg-card",
              )}
            >
              <span className="grid size-7 shrink-0 place-items-center border-2 border-foreground bg-card">
                <Icon className="size-4" strokeWidth={2.5} aria-hidden />
              </span>
              <span className="font-heading font-bold">{label}</span>
              <span className="ml-auto shrink-0 font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {where}
              </span>
              {engine ? <span className="sr-only">(the simulation engine, one worker per game)</span> : null}
            </div>
            {i < gameDaySteps.length - 1 ? <ArrowDown aria-hidden className="mx-auto size-3.5" strokeWidth={2.5} /> : null}
          </li>
        ))}
      </ol>
    </figure>
  );
}
