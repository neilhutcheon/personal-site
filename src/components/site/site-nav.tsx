"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const links = [
  { href: "#about", label: "About" },
  { href: "#experience", label: "Experience" },
  { href: "#skills", label: "Skills" },
  { href: "#interests", label: "Interests" },
  { href: "#contact", label: "Contact" },
];

export function SiteNav() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.3 });
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled ? "border-b border-border bg-background/75 backdrop-blur-lg" : "bg-transparent",
      )}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8"
      >
        <a href="#top" className="shrink-0 font-heading text-base font-semibold tracking-tight sm:text-lg">
          neil<span className="text-primary">.</span>hutcheon
        </a>
        <ul className="-mr-2 flex items-center gap-0 overflow-x-auto text-[13px] sm:text-sm [scrollbar-width:none] sm:gap-1">
          {links.map((link) => (
            <li key={link.href} className={link.href === "#skills" || link.href === "#about" ? "hidden sm:block" : undefined}>
              <a
                href={link.href}
                className="block rounded-md px-1.5 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:px-3"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <motion.div
        aria-hidden
        style={{ scaleX: progress }}
        className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-gradient-to-r from-climb via-brass to-disc"
      />
    </header>
  );
}
