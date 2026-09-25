"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowDown, Disc3, Mail, MapPin, Mountain, Music2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { buttonVariants } from "@/components/ui/button";
import { profile } from "@/content/resume";
import { cn } from "@/lib/utils";

const rotatingPhrases = [
  { text: "production web apps", tone: "text-foreground" },
  { text: "data & media pipelines", tone: "text-foreground" },
  { text: "Terraform-managed AWS", tone: "text-foreground" },
  { text: "a clean send", tone: "text-climb" },
  { text: "a hyzer flip", tone: "text-disc" },
  { text: "a smooth glissando", tone: "text-brass" },
];

const orbiters = [
  { href: "#climbing", label: "Rock climbing", Icon: Mountain, className: "text-climb", angle: -30 },
  { href: "#disc-golf", label: "Disc golf", Icon: Disc3, className: "text-disc", angle: 90 },
  { href: "#trombone", label: "Trombone", Icon: Music2, className: "text-brass", angle: 210 },
];

export function Hero() {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % rotatingPhrases.length), 2400);
    return () => window.clearInterval(id);
  }, [reduceMotion]);

  // Reason: writing CSS variables directly avoids a React re-render on every pointer move.
  const handlePointerMove = (e: PointerEvent<HTMLElement>) => {
    const el = sectionRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--spot-x", `${e.clientX - rect.left}px`);
    el.style.setProperty("--spot-y", `${e.clientY - rect.top}px`);
  };

  const phrase = rotatingPhrases[index];

  return (
    <section
      id="top"
      ref={sectionRef}
      onPointerMove={handlePointerMove}
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-[100svh] items-center overflow-hidden pt-16"
      style={{ ["--spot-x" as string]: "70%", ["--spot-y" as string]: "35%" }}
    >
      <div aria-hidden className="grain absolute inset-0 -z-20 opacity-70" />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 transition-[background] duration-300"
        style={{
          background:
            "radial-gradient(600px circle at var(--spot-x) var(--spot-y), color-mix(in oklch, var(--climb) 18%, transparent), transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="absolute -left-40 bottom-0 -z-10 size-[28rem] rounded-full bg-disc/10 blur-3xl"
      />
      <div aria-hidden className="absolute -right-24 top-10 -z-10 size-[26rem] rounded-full bg-brass/10 blur-3xl" />

      <div className="mx-auto grid w-full max-w-6xl items-center gap-14 px-5 py-16 sm:px-8 lg:grid-cols-[1.25fr_1fr]">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-sm text-muted-foreground backdrop-blur"
          >
            <MapPin className="size-3.5 text-primary" aria-hidden />
            {profile.location} · {profile.title}
          </motion.p>

          <motion.h1
            id="hero-title"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="mt-6 font-heading text-5xl font-semibold leading-[0.95] tracking-tight text-balance sm:text-7xl lg:text-8xl"
          >
            Hi, I&rsquo;m{" "}
            <span className="bg-gradient-to-r from-climb via-brass to-disc bg-clip-text text-transparent">
              Neil
            </span>
            .
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-6 text-xl text-muted-foreground sm:text-2xl"
          >
            I build{" "}
            <span className="relative inline-grid align-bottom">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={phrase.text}
                  initial={{ opacity: 0, y: "60%" }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: "-60%" }}
                  transition={{ duration: 0.35 }}
                  className={cn("font-medium", phrase.tone)}
                >
                  {phrase.text}.
                </motion.span>
              </AnimatePresence>
            </span>
            <span className="sr-only">
              Production web apps, data and media pipelines, and Terraform-managed AWS infrastructure.
            </span>
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground text-pretty"
          >
            Senior engineer with 5+ years turning ideas into production software, from ground-up
            architecture to the infrastructure it runs on. Off the keyboard you&rsquo;ll find me on a
            climbing wall, out on a disc golf course, or behind a trombone.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <a href="#experience" className={cn(buttonVariants({ size: "lg" }), "h-11 px-5 text-base")}>
              See my route
              <ArrowDown className="size-4" aria-hidden />
            </a>
            <a
              href={`mailto:${profile.email}`}
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11 px-5 text-base")}
            >
              <Mail className="size-4" aria-hidden />
              Get in touch
            </a>
          </motion.div>
        </div>

        <HeroBadge />
      </div>

      <a
        href="#about"
        aria-label="Scroll to About"
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 text-muted-foreground transition-colors hover:text-foreground sm:block"
      >
        <motion.span
          className="block"
          animate={reduceMotion ? undefined : { y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowDown className="size-5" aria-hidden />
        </motion.span>
      </a>
    </section>
  );
}

/** Portrait with the three hobbies orbiting it; each orbiter links to its interactive section. */
function HeroBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="relative mx-auto aspect-square w-full max-w-[22rem]"
    >
      <div aria-hidden className="absolute inset-0 rounded-full border border-dashed border-border" />
      <div className="absolute inset-[9%] overflow-hidden rounded-[42%_58%_55%_45%/48%_42%_58%_52%] bg-card shadow-2xl shadow-climb/20 ring-2 ring-climb/40">
        <Image
          src="/photos/trombone-portrait-outdoors.jpg"
          alt="Neil smiling outdoors on a leaf-covered path, holding his trombone"
          fill
          priority
          sizes="(min-width: 1024px) 22rem, 80vw"
          className="object-cover object-[50%_22%] scale-[1.35] origin-[50%_22%]"
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-climb/25 via-transparent to-transparent mix-blend-soft-light" />
      </div>

      <div className="group absolute inset-0 motion-safe:animate-[spin_40s_linear_infinite] hover:[animation-play-state:paused] focus-within:[animation-play-state:paused]">
        {orbiters.map(({ href, label, Icon, className, angle }) => {
          const rad = (angle * Math.PI) / 180;
          const x = 50 + 50 * Math.cos(rad);
          const y = 50 + 50 * Math.sin(rad);
          return (
            <a
              key={href}
              href={href}
              aria-label={`Jump to ${label}`}
              title={label}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <span className="grid size-14 place-items-center rounded-2xl border border-border bg-card shadow-lg transition-transform hover:scale-110 focus-visible:scale-110 motion-safe:animate-[spin_40s_linear_infinite_reverse] group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]">
                <Icon className={cn("size-6", className)} aria-hidden />
              </span>
            </a>
          );
        })}
      </div>
    </motion.div>
  );
}
