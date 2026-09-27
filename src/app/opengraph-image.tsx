import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { profile } from "@/content/resume";

// Rendered once at build time (static export), so link previews on LinkedIn, Slack, etc. get a card.
export const alt = `${profile.name}, ${profile.title}. ${profile.availability}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
// Reason: required under `output: "export"` so the image is written to out/ at build time.
export const dynamic = "force-static";

// Hex copies of the theme tokens in globals.css; satori can't read CSS variables or oklch.
const paper = "#fbf7e9";
const ink = "#130e0b";
const primary = "#386bfa";
const climb = "#ff723a";
const disc = "#a2eb3c";
const brass = "#ffd32e";

export default async function Image() {
  const [display, portrait] = await Promise.all([
    readFile(join(process.cwd(), "src/assets/fonts/BricolageGrotesque-Bold.ttf")),
    readFile(join(process.cwd(), "public/photos/trombone-portrait-outdoors.jpg")),
  ]);
  const portraitSrc = `data:image/jpeg;base64,${portrait.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          padding: "0 72px",
          gap: 64,
          backgroundColor: paper,
          backgroundImage:
            "linear-gradient(to right, rgba(0,0,0,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.07) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          color: ink,
          borderBottom: `12px solid ${ink}`,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              border: `3px solid ${ink}`,
              backgroundColor: "white",
              boxShadow: `5px 5px 0 ${primary}`,
              padding: "6px 14px",
              fontSize: 22,
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            {profile.location} · {profile.title}
          </div>
          <div style={{ display: "flex", alignItems: "center", marginTop: 28, fontFamily: "Bricolage", fontSize: 96, lineHeight: 1 }}>
            Neil
            <span
              style={{
                marginLeft: 24,
                padding: "0 18px 8px",
                backgroundColor: brass,
                border: `4px solid ${ink}`,
                boxShadow: `8px 8px 0 ${primary}`,
                transform: "rotate(-2deg)",
              }}
            >
              Hutcheon
            </span>
          </div>
          <div style={{ display: "flex", marginTop: 36, fontSize: 30, lineHeight: 1.3, maxWidth: 640 }}>
            Production web apps, data &amp; media pipelines, and Terraform-managed AWS.
          </div>
          <div style={{ display: "flex", alignItems: "center", marginTop: 28, fontSize: 24, gap: 14, maxWidth: 680 }}>
            <div style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: disc, border: `2px solid ${ink}` }} />
            {profile.availability}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            width: 330,
            height: 330,
            border: `4px solid ${ink}`,
            boxShadow: `12px 12px 0 ${climb}`,
            transform: "rotate(3deg)",
            overflow: "hidden",
          }}
        >
          <img src={portraitSrc} alt="" width={330} height={330} style={{ objectFit: "cover", objectPosition: "50% 30%" }} />
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Bricolage", data: display, weight: 700, style: "normal" }] },
  );
}
