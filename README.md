# Neil Hutcheon — personal site

Personal bio site for Neil Hutcheon, a Minneapolis-based Senior Software Engineer. It covers his
experience, skills, and contact details (all taken from his resume) and his three big hobbies,
each with a small interactive toy:

- **Rock climbing**: a bouldering wall you climb by grabbing holds within reach, graded by how few moves you take.
- **Disc golf**: set power and release angle, then throw for the basket along a curved flight path.
- **Trombone**: drag the slide (or use the keyboard) to play a Web Audio brass synth with real slide-position pitch math.

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- Tailwind CSS v4 + [shadcn/ui](https://ui.shadcn.com) (Base UI primitives)
- [Framer Motion](https://motion.dev) for scroll and interaction animation
- [Vitest](https://vitest.dev) for unit tests of the hobby logic

## Run it locally

Requires Node 20+.

```bash
npm install
npm run dev        # http://localhost:4317
```

Other scripts:

```bash
npm test           # unit tests (tests/)
npm run lint       # ESLint
npm run build      # production build
npm start          # serve the production build on port 4317
```

## Deploy (Cloudflare Workers, static assets)

The site is a static export (`output: "export"` in `next.config.ts`), so `npm run build` writes plain
HTML/JS/images to `out/`. `wrangler.jsonc` declares an assets-only Worker that serves that folder.
In the Cloudflare dashboard (Workers & Pages → the project → Settings → Build), use:

| Setting          | Value                 |
| ---------------- | --------------------- |
| Framework preset | None                  |
| Build command    | `npm run build`       |
| Deploy command   | `npx wrangler deploy` |
| Root directory   | `/`                   |

Do **not** use the "Next.js" preset; it runs `opennextjs-cloudflare`, which expects a server-rendered
app and fails on static exports. Every push to `main` deploys to production; other branches get preview
URLs. Attach the domain under the Worker's Settings → Domains & Routes; if the domain is on Cloudflare
Registrar the DNS record is created for you.

To deploy from your machine instead: `npm run build && npx wrangler deploy` (after `npx wrangler login`).

## Project layout

```
src/
  app/                 # layout, page, global styles/theme
  components/
    site/              # nav, hero, about, experience, skills, interests, contact
    interests/         # climbing wall, disc golf, trombone (+ Web Audio synth hook)
    ui/                # shadcn/ui components
  content/resume.ts    # all professional copy, sourced from the resume
  lib/                 # pure logic: disc-flight, climbing, trombone
public/photos/         # Neil's photos (EXIF stripped, resized)
tests/lib/             # Vitest tests mirroring src/lib
```

## Editing content

Professional copy lives in `src/content/resume.ts`. Keep it factual; it mirrors the resume.
Photos go in `public/photos/` and are rendered with `next/image`.

## Accessibility and motion

- All interactives work with a keyboard (holds are focusable buttons; sliders are accessible; the trombone responds to number keys, arrow keys, and Space).
- Animations respect `prefers-reduced-motion`.
- Sound only plays in response to a user gesture.
