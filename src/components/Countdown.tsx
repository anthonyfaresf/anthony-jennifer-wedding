"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

// 18 July 2026 · 17:00 Lebanon (UTC+3, no DST). Anchor to the ceremony hour
// once Anthony confirms; default 17:00 reads as "early evening ceremony."
const WEDDING_AT = new Date("2026-07-18T17:00:00+03:00").getTime();

type Tick = { days: number; hours: number; minutes: number; seconds: number };

function diff(now: number): Tick {
  const ms = Math.max(0, WEDDING_AT - now);
  return {
    days: Math.floor(ms / 86_400_000),
    hours: Math.floor((ms % 86_400_000) / 3_600_000),
    minutes: Math.floor((ms % 3_600_000) / 60_000),
    seconds: Math.floor((ms % 60_000) / 1000),
  };
}

/**
 * Countdown — between Hero and Story.
 *
 * 4 Blosta-olive digit clusters (days · hours · minutes · seconds) on cream
 * paper with paper-grain. Italianno italic-script labels under each. Gold
 * rule below. One line of Gordita italic body: "until we say I do."
 *
 * Per SYNTHESIS-v3 TIER 1 #1 — 5 of 10 IG refs include a live countdown.
 * We were the only one of 10 references without it. Now corrected.
 */
export default function Countdown() {
  const sectionRef = useRef<HTMLElement>(null);
  const [tick, setTick] = useState<Tick | null>(null);

  // Only set state after mount so SSR + client agree on initial render
  // (otherwise the digits would render once at SSR with one value and
  // flip to a different value on hydration → hydration warning).
  useEffect(() => {
    setTick(diff(Date.now()));
    const id = setInterval(() => setTick(diff(Date.now())), 1000);
    return () => clearInterval(id);
  }, []);

  // Scroll-in reveal — eyebrow → digits → labels → rule → footnote.
  useEffect(() => {
    const ctx = gsap.context(() => {
      const reduceMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduceMotion) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
      });

      tl.from(".cd-eyebrow", { y: 20, opacity: 0, duration: 0.7, ease: "power3.out" })
        .from(
          ".cd-cluster",
          { y: 32, opacity: 0, scale: 0.96, duration: 0.9, stagger: 0.12, ease: "power3.out" },
          "-=0.4"
        )
        .from(
          ".cd-rule",
          { width: 0, duration: 0.7, ease: "power3.out" },
          "-=0.3"
        )
        .from(
          ".cd-footnote",
          { y: 14, opacity: 0, duration: 0.6, ease: "power2.out" },
          "-=0.4"
        );
    }, sectionRef);
    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <section
      ref={sectionRef}
      id="countdown"
      className="relative py-28 sm:py-36 px-6 bg-cream paper-grain overflow-hidden"
    >
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <p className="cd-eyebrow text-xs uppercase tracking-[0.5em] text-olive-deep/85 mb-10">
          The countdown
        </p>

        {/* 4 digit clusters — mobile 2×2, desktop single row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-10 gap-x-4 sm:gap-x-8">
          {[
            { value: tick?.days ?? 0, label: "days", padTo: 3 },
            { value: tick?.hours ?? 0, label: "hours", padTo: 2 },
            { value: tick?.minutes ?? 0, label: "minutes", padTo: 2 },
            { value: tick?.seconds ?? 0, label: "seconds", padTo: 2 },
          ].map((c) => (
            <div key={c.label} className="cd-cluster">
              <p
                aria-live={c.label === "seconds" ? "off" : undefined}
                className="font-display text-olive-deep leading-none tabular-nums"
                style={{
                  fontSize: "clamp(56px, 9vw, 112px)",
                  letterSpacing: "-0.01em",
                }}
              >
                {c.padTo === 3
                  ? String(c.value).padStart(3, "0")
                  : pad(c.value)}
              </p>
              <p
                className="mt-3 text-olive-deep/75 italic"
                style={{
                  fontFamily: "var(--font-italianno), 'Italianno', cursive",
                  fontSize: "clamp(22px, 2.4vw, 30px)",
                }}
              >
                {c.label}
              </p>
            </div>
          ))}
        </div>

        <div
          className="cd-rule h-px bg-gold mx-auto mt-12 mb-6"
          style={{ width: 64 }}
        />

        <p
          className="cd-footnote italic text-body/70 text-sm sm:text-base tracking-wide"
        >
          until we say I do · 18 July 2026 · Couvent Saint Jean
        </p>
      </div>

      {/* Soft top + bottom cream fade so it dissolves into Hero above + Story below */}
      <div
        aria-hidden
        className="absolute top-0 left-0 right-0 h-16 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, var(--cream), transparent)" }}
      />
      <div
        aria-hidden
        className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
        style={{ background: "linear-gradient(to top, var(--cream), transparent)" }}
      />
    </section>
  );
}
