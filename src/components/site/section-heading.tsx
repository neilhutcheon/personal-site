import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "./motion";

type SectionHeadingProps = {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  className?: string;
  id?: string;
};

export function SectionHeading({ eyebrow, title, description, className, id }: SectionHeadingProps) {
  return (
    <Reveal className={cn("max-w-2xl", className)}>
      <p className="stack-sm inline-block bg-brass px-2 py-0.5 font-mono text-xs font-bold uppercase tracking-[0.2em] under-primary">
        {eyebrow}
      </p>
      <h2 id={id} className="mt-5 font-heading text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground text-pretty">{description}</p>
      ) : null}
    </Reveal>
  );
}
