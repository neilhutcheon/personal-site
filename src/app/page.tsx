import { About } from "@/components/site/about";
import { Contact } from "@/components/site/contact";
import { Experience } from "@/components/site/experience";
import { Hero } from "@/components/site/hero";
import { Interests } from "@/components/site/interests";
import { MotionProvider } from "@/components/site/motion";
import { SiteNav } from "@/components/site/site-nav";
import { Skills } from "@/components/site/skills";

export default function Home() {
  return (
    <MotionProvider>
      <SiteNav />
      <main id="main" className="flex-1">
        <Hero />
        <About />
        <Experience />
        <Skills />
        <Interests />
        <Contact />
      </main>
    </MotionProvider>
  );
}
