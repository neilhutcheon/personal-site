import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Reason: the site is a single static page with no server features, so it's exported to
  // plain HTML/JS in `out/` and hosted for free on Cloudflare Pages.
  output: "export",
  // Reason: next/image optimization needs a server; the photos are already resized, so serve them as-is.
  images: { unoptimized: true },
  // Lets the dev server's hot reload work when opened via 127.0.0.1 instead of localhost.
  allowedDevOrigins: ["127.0.0.1"],
  devIndicators: false,
};

export default nextConfig;
