"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowDown, Disc3, Mail, MapPin, Mountain, Music2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { profile } from "@/content/resume";
import { cn } from "@/lib/utils";

// Reason: on paper the hobby accents are too light for text, so phrases are highlighted blocks instead.
const rotatingPhrases = [
  { text: "production web apps", tone: "bg-card" },
  { text: "data & media pipelines", tone: "bg-card" },
  { text: "Terraform-managed AWS", tone: "bg-card" },
  { text: "a clean send", tone: "bg-climb" },
  { text: "a hyzer flip", tone: "bg-disc" },
  { text: "a smooth glissando", tone: "bg-brass" },
];

const orbiters = [
  { href: "#climbing", label: "Rock climbing", Icon: Mountain, className: "bg-climb", angle: -30 },
  { href: "#disc-golf", label: "Disc golf", Icon: Disc3, className: "bg-disc", angle: 90 },
  { href: "#trombone", label: "Trombone", Icon: Music2, className: "bg-brass", angle: 210 },
];

export function Hero() {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % rotatingPhrases.length), 2400);
    return () => window.clearInterval(id);
  }, [reduceMotion]);

  const phrase = rotatingPhrases[index];

  return (
    <section
      id="top"
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-[100svh] items-center overflow-hidden border-b-[3px] border-foreground pt-16"
    >
      <div aria-hidden className="grid-paper absolute inset-0 -z-20" />
      {/* Flat geometric shapes stand in for the old glow blobs. */}
      {/* Reason: on phones the shapes sit behind body copy, so keep them small or hidden until sm. */}
      <div aria-hidden className="absolute -left-16 bottom-16 -z-10 hidden size-56 rotate-12 border-[3px] border-foreground bg-disc shadow-brutal-lg sm:block sm:size-72" />
      <div aria-hidden className="absolute -right-24 -top-8 -z-10 size-44 rounded-full border-[3px] border-foreground bg-brass shadow-brutal-lg sm:-right-20 sm:top-24 sm:size-80" />
      <div aria-hidden className="absolute right-[18%] bottom-10 -z-10 hidden h-10 w-40 -rotate-6 border-[3px] border-foreground bg-climb shadow-brutal lg:block" />

      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-5 py-10 sm:px-8 sm:py-16 lg:gap-14 lg:grid-cols-[1.25fr_1fr]">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="stack-sm inline-flex items-center gap-2 bg-card px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider under-primary"
          >
            <MapPin className="size-3.5 text-primary" aria-hidden />
            {profile.location} · {profile.title}
          </motion.p>

          <motion.h1
            id="hero-title"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="mt-6 font-heading text-5xl font-extrabold leading-[0.95] tracking-tight text-balance sm:text-7xl lg:text-8xl"
          >
            Hi, I&rsquo;m{" "}
            <span className="stack inline-block -rotate-2 bg-brass px-3 under-primary sm:px-4">
              Neil
            </span>
            .
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-8 text-xl font-medium sm:text-2xl"
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
                  className={cn("border-2 border-foreground px-2 font-bold", phrase.tone)}
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
            <a href="#experience" className={cn(buttonVariants({ size: "lg" }), "under-disc")}>
              See my route
              <ArrowDown aria-hidden />
            </a>
            <a href={`mailto:${profile.email}`} className={buttonVariants({ variant: "outline", size: "lg" })}>
              <Mail aria-hidden />
              Get in touch
            </a>
          </motion.div>
        </div>

        <HeroBadge />
      </div>

      <a
        href="#about"
        aria-label="Scroll to About"
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 sm:block"
      >
        <motion.span
          className="stack-sm grid size-10 place-items-center bg-card under-brass"
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
      className="relative order-first mx-auto aspect-square w-full max-w-[14rem] sm:max-w-[20rem] lg:order-none lg:max-w-[22rem]"
    >
      <div aria-hidden className="absolute inset-0 rounded-full border-2 border-dashed border-foreground/40" />
      <div className="stack-lg absolute inset-[11%] rotate-3 overflow-hidden bg-card under-climb">
        <Image
          src="/photos/trombone-portrait-outdoors.jpg"
          alt="Neil smiling outdoors on a leaf-covered path, holding his trombone"
          fill
          priority
          sizes="(min-width: 1024px) 22rem, 80vw"
          className="object-cover object-[50%_30%] scale-[1.12] origin-[50%_25%]"
        />
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
              <span
                className={cn(
                  "stack-sm grid size-11 place-items-center text-foreground under-primary transition-transform hover:scale-110 focus-visible:scale-110 sm:size-14 motion-safe:animate-[spin_40s_linear_infinite_reverse] group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]",
                  className,
                )}
              >
                <Icon className="size-5 sm:size-6" strokeWidth={2.5} aria-hidden />
              </span>
            </a>
          );
        })}
      </div>
    </motion.div>
  );
}
