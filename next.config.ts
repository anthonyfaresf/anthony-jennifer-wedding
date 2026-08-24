import type { NextConfig } from "next";

// DEPLOY_TARGET routes basePath:
//   unset / anything → ""                        (Cloudflare Pages root — the LIVE host)
//   "ghpages"        → /anthony-jennifer-wedding (opt-in only, for the GH Pages mirror)
//
// 🟥 The default is deliberately the SAFE one. It used to default to "ghpages",
// so any build run without DEPLOY_TARGET=cloudflare produced a bundle whose every
// asset lived under /anthony-jennifer-wedding/. Deployed to Cloudflare root that
// build returns HTTP 200 with a blank page — every CSS/JS/image 404s. That is
// exactly what took anthonyandjenni.com down (found 2026-08-24). basePath is now
// opt-in: you must ASK for the ghpages mirror to get it.
const isProd = process.env.NODE_ENV === "production";
const target = process.env.DEPLOY_TARGET ?? "cloudflare";
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
