import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets the dev server's hot reload work when opened via 127.0.0.1 instead of localhost.
  allowedDevOrigins: ["127.0.0.1"],
  devIndicators: false,
};

export default nextConfig;
