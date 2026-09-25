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
      <Reveal className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-border bg-card px-6 py-16 text-center sm:px-12 sm:py-24">
        <div aria-hidden className="grain absolute inset-0 opacity-60" />
        <div aria-hidden className="absolute -top-24 left-1/2 size-96 -translate-x-1/2 rounded-full bg-climb/20 blur-3xl" />
        <div className="relative">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">Contact</p>
          <h2 id="contact-title" className="mx-auto mt-4 max-w-3xl font-heading text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
            Let&rsquo;s build something worth sending.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground text-pretty">
            Whether it&rsquo;s an architecture problem, a pipeline, or a recommendation for the local crag or
            course, my inbox is open.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href={`mailto:${profile.email}`} className={cn(buttonVariants({ size: "lg" }), "h-12 px-6 text-base")}>
              <Mail className="size-4" aria-hidden />
              {profile.email}
            </a>
            <Button variant="outline" size="lg" className="h-12 px-5 text-base" onClick={copyEmail}>
              {copied === "copied" ? <Check aria-hidden /> : <Copy aria-hidden />}
              {copied === "copied" ? "Copied" : copied === "error" ? "Copy failed" : "Copy email"}
            </Button>
          </div>
          <p aria-live="polite" className="sr-only">
            {copied === "copied" ? "Email address copied to clipboard" : ""}
          </p>
          <p className="mt-8 inline-flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="size-4" aria-hidden />
            Based in {profile.location}
          </p>
        </div>
      </Reveal>

      <footer className="mx-auto mt-12 flex max-w-6xl flex-col items-center justify-between gap-2 text-sm text-muted-foreground sm:flex-row">
        <p>© {new Date().getFullYear()} {profile.name}</p>
        <p>Built with Next.js, Tailwind, and a little chalk.</p>
      </footer>
    </section>
  );
}
