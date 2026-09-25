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
        "fixed inset-x-0 top-0 z-50 border-b-[3px] transition-colors duration-200",
        scrolled ? "border-foreground bg-background" : "border-transparent bg-transparent",
      )}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:border-2 focus:border-foreground focus:bg-brass focus:px-3 focus:py-2 focus:font-bold focus:text-foreground"
      >
        Skip to content
      </a>
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8"
      >
        <a
          href="#top"
          className="stack-sm shrink-0 bg-brass px-2 py-0.5 font-heading text-base font-extrabold tracking-tight under-primary sm:text-lg"
        >
          neil<span className="text-primary">.</span>hutcheon
        </a>
        <ul className="-mr-2 flex items-center gap-0 overflow-x-auto font-mono text-xs font-bold uppercase tracking-wider [scrollbar-width:none] sm:gap-1 sm:text-[13px]">
          {links.map((link) => (
            <li key={link.href} className={link.href === "#skills" || link.href === "#about" ? "hidden sm:block" : undefined}>
              <a
                href={link.href}
                className="block border-2 border-transparent px-1.5 py-1 text-foreground transition-colors hover:border-foreground hover:bg-card sm:px-3"
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
        className="absolute inset-x-0 -bottom-[3px] h-[3px] origin-left bg-primary"
      />
    </header>
  );
}
