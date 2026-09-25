"use client";

import { Check, Copy, Mail, MapPin } from "lucide-react";
import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { profile } from "@/content/resume";
import { cn } from "@/lib/utils";
import { Reveal } from "./motion";

export function Contact() {
  const [copied, setCopied] = useState<"idle" | "copied" | "error">("idle");

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied("copied");
    } catch {
      setCopied("error");
    }
    window.setTimeout(() => setCopied("idle"), 2200);
  };

  return (
    <section id="contact" aria-labelledby="contact-title" className="px-5 pb-16 sm:px-8">
      <Reveal className="stack-lg relative mx-auto max-w-6xl bg-brass px-6 py-16 text-center under-primary sm:px-12 sm:py-24">
        <div aria-hidden className="grid-paper absolute inset-0" />
        <p className="tab bg-card">Contact</p>
        <div className="relative">
          <h2 id="contact-title" className="mx-auto mt-5 max-w-3xl font-heading text-4xl font-extrabold tracking-tight text-balance sm:text-6xl">
            Let&rsquo;s build something worth sending.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg font-medium text-pretty">
            Whether it&rsquo;s an architecture problem, a pipeline, or a recommendation for the local crag or
            course, my inbox is open.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a href={`mailto:${profile.email}`} className={cn(buttonVariants({ size: "lg" }), "under-disc normal-case tracking-normal")}>
              <Mail aria-hidden />
              {profile.email}
            </a>
            <Button variant="outline" size="lg" className="under-climb" onClick={copyEmail}>
              {copied === "copied" ? <Check aria-hidden /> : <Copy aria-hidden />}
              {copied === "copied" ? "Copied" : copied === "error" ? "Copy failed" : "Copy email"}
            </Button>
          </div>
          <p aria-live="polite" className="sr-only">
            {copied === "copied" ? "Email address copied to clipboard" : ""}
          </p>
          <p className="mt-8 inline-flex items-center gap-2 font-mono text-sm font-bold">
            <MapPin className="size-4" aria-hidden />
            Based in {profile.location}
          </p>
        </div>
      </Reveal>

      <footer className="mx-auto mt-16 flex max-w-6xl flex-col items-center justify-between gap-2 border-t-[3px] border-foreground pt-6 font-mono text-xs font-bold uppercase tracking-wider sm:flex-row">
        <p>© {new Date().getFullYear()} {profile.name}</p>
        <p>Built with Next.js, Tailwind, and a little chalk.</p>
      </footer>
    </section>
  );
}
