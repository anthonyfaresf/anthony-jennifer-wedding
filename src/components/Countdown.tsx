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
 * FlipDigit — split-flap board aesthetic. When `value` changes, the top
 * half folds down with a brief perspective flip (cubic-bezier ease-in)
 * revealing the new value underneath. Per 2026 wedding-site research —
 * vintage split-flap is the canonical "elevated countdown" pattern
 * (Bliss & Bone Hannah + Matt).
 */
function FlipDigit({ value }: { value: string }) {
  const [displayed, setDisplayed] = useState(value);
  const [flipping, setFlipping] = useState(false);

  useEffect(() => {
    if (value === displayed) return;
    setFlipping(true);
    const t = setTimeout(() => {
      setDisplayed(value);
      setFlipping(false);
    }, 280);
    return () => clearTimeout(t);
  }, [value, displayed]);

  return (
    <span
      className="flip-digit relative inline-block"
      style={{ perspective: "240px" }}
    >
      <span
        className={`inline-block ${flipping ? "flip-anim" : ""}`}
        style={{
          transformOrigin: "center bottom",
          transformStyle: "preserve-3d",
        }}
      >
        {displayed}
      </span>
    </span>
  );
}

/**
 * Countdown — between Hero and Story.
 *
 * 4 Blosta-olive digit clusters (days · hours · minutes · seconds) on cream
 * paper with paper-grain. Italianno italic-script labels under each. Gold
 * rule below. One line of italic body: "until we say I do."
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
      className="relative min-h-[100svh] flex items-center justify-center px-6 py-20 sm:py-28 bg-cream paper-grain overflow-hidden"
    >
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <p className="cd-eyebrow text-xs uppercase tracking-[0.5em] text-olive-deep/85 mb-10">
          The countdown
        </p>

        {/* MOBILE — single elegant line with seconds back per Anthony
            2026-05-16: "add back seconds." Format: "63 · 03 · 53 · 12"
            (days · hours · min · sec) on one line. */}
        <div className="sm:hidden cd-cluster">
          <p
            className="font-display text-olive-deep leading-none tabular-nums"
            style={{
              fontSize: "clamp(30px, 9vw, 52px)",
              letterSpacing: "-0.005em",
              whiteSpace: "nowrap",
            }}
          >
            <span>{tick?.days ?? 0}</span>
            <span className="text-olive-deep/55 px-1.5" style={{ fontSize: "0.7em" }}>·</span>
            <span>{pad(tick?.hours ?? 0)}</span>
            <span className="text-olive-deep/55 px-1.5" style={{ fontSize: "0.7em" }}>·</span>
            <span>{pad(tick?.minutes ?? 0)}</span>
            <span className="text-olive-deep/55 px-1.5" style={{ fontSize: "0.7em" }}>·</span>
            <span>{pad(tick?.seconds ?? 0)}</span>
          </p>
          <p
            className="mt-4 text-olive-deep/75 uppercase"
            style={{
              fontFamily: "var(--font-tenor), system-ui, sans-serif",
              fontSize: "11px",
              letterSpacing: "0.4em",
            }}
          >
            Days · Hours · Minutes · Seconds
          </p>
        </div>

        {/* DESKTOP — 4 digit clusters with split-flap aesthetic.
            Hidden on mobile (< 640px). */}
        <div className="hidden sm:grid sm:grid-cols-4 gap-y-10 gap-x-4 sm:gap-x-8">
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
                {(c.padTo === 3
                  ? String(c.value).padStart(3, "0")
                  : pad(c.value))
                  .split("")
                  .map((ch, i) => (
                    <FlipDigit key={i} value={ch} />
                  ))}
              </p>
              <p
                className="mt-3 text-olive-deep/80 uppercase"
                style={{
                  fontFamily: "var(--font-tenor), system-ui, sans-serif",
                  fontSize: "clamp(11px, 1.1vw, 13px)",
                  letterSpacing: "0.4em",
                }}
              >
                {c.label}
              </p>
            </div>
          ))}
        </div>

        <div
          className="cd-rule h-px bg-gold mx-auto mt-12 mb-8"
          style={{ width: 64 }}
        />

        {/* 3-line footnote per Anthony 2026-05-16 — was a single line. */}
        <div className="cd-footnote space-y-2.5">
          <p
            className="text-body/85 uppercase"
            style={{
              fontFamily: "var(--font-tenor), system-ui, sans-serif",
              fontSize: "clamp(13px, 1.5vw, 17px)",
              letterSpacing: "0.35em",
            }}
          >
            Until We Say I Do
          </p>
          <p
            className="text-body/75 uppercase"
            style={{
              fontSize: "clamp(12px, 1.3vw, 15px)",
              letterSpacing: "0.4em",
            }}
          >
            18 July 2026
          </p>
          <p
            className="text-body/65 uppercase"
            style={{
              fontSize: "clamp(10px, 1.1vw, 13px)",
              letterSpacing: "0.35em",
            }}
          >
            Couvent Saint Jean &middot; Okaibe
          </p>
        </div>
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
