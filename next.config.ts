import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
const repo = "anthony-jennifer-wedding";
const basePath = isProd ? `/${repo}` : "";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  basePath,
  assetPrefix: isProd ? `${basePath}/` : "",
  env: {
    // Exposed to client so plain <video src> / <img src> can prefix basePath manually
    // (Next.js only auto-prefixes for next/image + next/link, not raw HTML tags)
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
