import type { NextConfig } from "next";

// DEPLOY_TARGET routes basePath:
//   "ghpages"     → /anthony-jennifer-wedding   (anthonyfaresf.github.io/anthony-jennifer-wedding/)
//   "cloudflare"  → ""                          (anthony-jennifer-wedding.pages.dev/ root)
//   unset (dev)   → ""                          (localhost:3000/)
// Cloudflare is the canonical host per vault doctrine; ghpages stays as the
// stopgap mirror until DNS is pointed at Pages.
const isProd = process.env.NODE_ENV === "production";
const target = process.env.DEPLOY_TARGET ?? "ghpages";
const repo = "anthony-jennifer-wedding";
const basePath = isProd && target === "ghpages" ? `/${repo}` : "";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  basePath,
  assetPrefix: basePath ? `${basePath}/` : "",
  env: {
    // Exposed to client so plain <video src> / <img src> can prefix basePath manually
    // (Next.js only auto-prefixes for next/image + next/link, not raw HTML tags)
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
