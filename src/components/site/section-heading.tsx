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
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">{eyebrow}</p>
      <h2 id={id} className="mt-3 font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground text-pretty">{description}</p>
      ) : null}
    </Reveal>
  );
}
