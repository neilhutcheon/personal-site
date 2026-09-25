import { Disc3, Mountain, Music2, type LucideIcon } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";
import { ClimbingWall } from "@/components/interests/climbing-wall";
import { DiscGolf } from "@/components/interests/disc-golf";
import { Trombone } from "@/components/interests/trombone";
import { cn } from "@/lib/utils";
import { Reveal } from "./motion";
import { SectionHeading } from "./section-heading";

const climbingPhotos = [
  {
    src: "/photos/bouldering-river.jpg",
    alt: "Neil bouldering up the face of a huge granite boulder beside a river in a forested canyon, friends spotting below",
    caption: "Riverside bouldering",
    width: 1043,
    height: 598,
    className: "sm:col-span-2 aspect-[16/10] sm:aspect-auto",
    position: "object-[30%_40%]",
  },
  {
    src: "/photos/climbing-spire-sport.jpg",
    alt: "A roped climber high on a tall sandstone spire with snowy peaks and blue sky behind",
    caption: "Up a sandstone spire",
    width: 1034,
    height: 1207,
    className: "sm:row-span-2 aspect-[4/5] sm:aspect-auto",
    position: "object-[35%_30%]",
  },
  {
    src: "/photos/bouldering-overhang-vista.jpg",
    alt: "Neil hanging from the underside of a large overhanging pink granite boulder above a wide forested valley",
    caption: "Overhangs with a view",
    width: 1023,
    height: 802,
    className: "sm:col-span-2 aspect-[16/10] sm:aspect-auto",
    position: "object-[55%_70%]",
  },
];

type HobbyProps = {
  id: string;
  Icon: LucideIcon;
  accent: string;
  kicker: string;
  title: string;
  children: ReactNode;
  media?: ReactNode;
  interactive: ReactNode;
  interactiveTitle: string;
};

function Hobby({ id, Icon, accent, kicker, title, children, media, interactive, interactiveTitle }: HobbyProps) {
  return (
    <article id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24">
      <div className={cn("grid gap-8", media && "lg:grid-cols-[1fr_1.35fr] lg:items-center lg:gap-12")}>
        <Reveal className="max-w-xl">
          <p className={cn("flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em]", accent)}>
            <Icon className="size-4" aria-hidden />
            {kicker}
          </p>
          <h3 id={`${id}-title`} className="mt-3 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            {title}
          </h3>
          <div className="mt-4 space-y-3 text-lg leading-relaxed text-muted-foreground text-pretty">{children}</div>
        </Reveal>
        {media ? <Reveal delay={0.1}>{media}</Reveal> : null}
      </div>

      <Reveal delay={0.05}>
        <div className="mt-8 rounded-3xl border border-border bg-card/60 p-4 shadow-sm backdrop-blur sm:p-8">
          <p className="mb-5 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Try it · {interactiveTitle}
          </p>
          {interactive}
        </div>
      </Reveal>
    </article>
  );
}

function Photo({
  src,
  alt,
  caption,
  width,
  height,
  className,
  position,
  sizes,
}: (typeof climbingPhotos)[number] & { sizes: string }) {
  return (
    <figure className={cn("group relative overflow-hidden rounded-2xl border border-border bg-muted", className)}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        className={cn(
          "size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105",
          position,
        )}
      />
      <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-3 pt-10 text-sm font-medium text-white">
        {caption}
      </figcaption>
    </figure>
  );
}

export function Interests() {
  return (
    <section id="interests" aria-labelledby="interests-title" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-6xl space-y-24 px-5 sm:space-y-32 sm:px-8">
        <SectionHeading
          id="interests-title"
          eyebrow="Off the keyboard"
          title="Climbing, disc golf, and trombone."
          description="The hobbies that keep me curious. Each one comes with a small toy to play with."
        />

        <Hobby
          id="climbing"
          Icon={Mountain}
          accent="text-climb"
          kicker="Rock climbing"
          title="Reading the route."
          interactiveTitle="Send the boulder problem"
          media={
            <div className="grid gap-3 sm:h-[26rem] sm:grid-cols-3 sm:grid-rows-2">
              {climbingPhotos.map((photo) => (
                <Photo
                  key={photo.src}
                  {...photo}
                  sizes={photo.className.includes("row-span") ? "(min-width: 1024px) 14rem, 100vw" : "(min-width: 1024px) 26rem, 100vw"}
                />
              ))}
            </div>
          }
          interactive={<ClimbingWall />}
        >
          <p>
            Bouldering by a river, roped up on a spire, hanging off an overhang: climbing is the
            same loop as debugging. Read the problem, try something, fall off, adjust, and go again.
          </p>
        </Hobby>

        <Hobby
          id="disc-golf"
          Icon={Disc3}
          accent="text-disc"
          kicker="Disc golf"
          title="Chasing chains."
          interactiveTitle="Throw for the basket"
          interactive={<DiscGolf />}
        >
          <p>
            Disc golf is a physics problem you solve with your arm: power, release angle, and how
            the disc fades at the end of its flight. Dial in a throw and see if you can hit the chains.
          </p>
        </Hobby>

        <Hobby
          id="trombone"
          Icon={Music2}
          accent="text-brass"
          kicker="Classically trained trombonist"
          title="Seven positions, infinite glissando."
          interactiveTitle="Play the slide"
          media={
            <figure className="relative overflow-hidden rounded-2xl border border-border">
              <Image
                src="/photos/trombone-performing.jpg"
                alt="Black and white photo of Neil performing on trombone on stage, wearing a bow tie, eyes closed"
                width={2000}
                height={1125}
                sizes="(min-width: 1024px) 38rem, 100vw"
                className="aspect-[16/10] w-full object-cover object-[60%_40%] grayscale"
              />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-3 pt-10 text-sm font-medium text-white">
                On stage
              </figcaption>
            </figure>
          }
          interactive={<Trombone />}
        >
          <p>
            Classical training taught me patience, listening, and that fundamentals practiced
            daily compound. The trombone has no keys, just a slide, so every note is something you
            find by ear.
          </p>
        </Hobby>
      </div>
    </section>
  );
}
