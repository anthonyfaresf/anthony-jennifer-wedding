import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Tenor_Sans, Italianno } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const tenor = Tenor_Sans({
  variable: "--font-tenor",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const italianno = Italianno({
  variable: "--font-italianno",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Anthony & Jennifer · 18 July 2026",
  description:
    "Anthony Fares Faraj and Jennifer Haddad invite you to celebrate their wedding at Couvent Saint Jean, Okaibe — 18 July 2026.",
  openGraph: {
    title: "Anthony & Jennifer · 18 July 2026",
    description: "Couvent Saint Jean, Okaibe — Lebanon",
    type: "website",
    locale: "en_US",
  },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#f4ece0",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Bake basePath into the preload href at SSG time. Empty for Cloudflare,
  // /anthony-jennifer-wedding for GitHub Pages — see next.config.ts.
  const bp = process.env.NEXT_PUBLIC_BASE_PATH || "";
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${tenor.variable} ${italianno.variable} h-full antialiased`}
    >
      <head>
        {/*
          Preload hero frame 1 + story scene-1 frame 1. Both are inside the
          first viewport (hero) or the very next scroll position (story
          opener). Preloading kills the 1-8s "calculator" loading state
          where bg-ink showed through under unloaded canvas frames.
        */}
        <link rel="preload" as="image" href={`${bp}/frames/hero-wine-cheers/f-01.jpg`} fetchPriority="high" />
        <link rel="preload" as="image" href={`${bp}/frames/scene-01-meeting/f-01.jpg`} />
        <link rel="preload" as="image" href={`${bp}/video/opener-poster.jpg`} fetchPriority="high" />
        <link rel="preload" as="video" href={`${bp}/video/opener.mp4`} />
        {/*
          Pre-paint gate cover. SSR renders an opaque black wall + paused
          wax-seal frame above everything from the very first paint, so the
          hero never flashes through before <VideoGate> hydrates. Cleared by
          VideoGate.tsx once the gate dismounts (sessionStorage flag OR fade
          complete). Inline so it ships in the first HTML byte.
        */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html.aj-prepaint-gate, html.aj-prepaint-gate body { overflow: hidden !important; }
              .aj-prepaint-cover {
                position: fixed; inset: 0; z-index: 99;
                background: #000 url(${bp}/video/opener-poster.jpg) center/cover no-repeat;
                pointer-events: none;
              }
              html.aj-gate-passed .aj-prepaint-cover { display: none; }
            `,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
              try {
                if (sessionStorage.getItem('video-gate-passed-v1') === '1') {
                  document.documentElement.classList.add('aj-gate-passed');
                } else {
                  document.documentElement.classList.add('aj-prepaint-gate');
                }
              } catch (e) {}
            })();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
