import { FileDown } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { profile } from "@/content/resume";
import { cn } from "@/lib/utils";
import { GitHubIcon, LinkedInIcon } from "./brand-icons";

/** Resume download plus GitHub and LinkedIn, shared by the hero and contact sections. */
export function ProfileLinks({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <a
        href={profile.resume}
        download
        className={cn(buttonVariants({ variant: "outline", size: "lg" }), "under-climb")}
      >
        <FileDown aria-hidden />
        Resume (PDF)
      </a>
      <a
        href={profile.github}
        target="_blank"
        rel="noreferrer"
        aria-label="GitHub (opens in a new tab)"
        title="GitHub"
        className={cn(buttonVariants({ variant: "outline", size: "icon-lg" }), "size-11 under-disc")}
      >
        <GitHubIcon className="size-5" />
      </a>
      <a
        href={profile.linkedin}
        target="_blank"
        rel="noreferrer"
        aria-label="LinkedIn (opens in a new tab)"
        title="LinkedIn"
        className={cn(buttonVariants({ variant: "outline", size: "icon-lg" }), "size-11 under-brass")}
      >
        <LinkedInIcon className="size-5" />
      </a>
    </div>
  );
}
