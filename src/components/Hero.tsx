"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FrameSequence } from "./FrameSequence";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

/**
 * Hero — full-bleed cinematic opener.
 *
 * Wine-cheers watercolor as a 31-frame canvas sequence. 180vh tall.
 *
 * Per Anthony 2026-05-02 ("make the motion cinematic, glass card behind text"):
 *   - All hero text lives inside a SINGLE `glass-card-strong` invitation card,
 *     centered, sitting on the watercolor like a real wedding invite pressed
 *     into the page.
 *   - Names reveal character-by-character (manual span split + GSAP stagger).
 *     Soft slight-up rise per char, ease power3.out, 0.04s stagger.
 *   - Card scales in from 0.96 + opacity 0 + 6px backdrop blur lifting,
 *     synced with the canvas scale pull-in for cohesive entry.
 *   - Gold rule under the names grows from 0 → 48px width as part of the
 *     card reveal sequence.
 *   - Date + venue lifts up after the names land.
 *   - Vignette + cream-page-turn unchanged from the original choreography.
 */
export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const ctx = gsap.context(() => {
      const sectionEl = sectionRef.current;
      if (!sectionEl) return;

      // 1. CREAM PAGE-TURN — fades from 0.75 → 0
      gsap.to(".hero-cream-veil", {
        opacity: 0,
        ease: "power2.out",
        scrollTrigger: {
          trigger: sectionEl,
          start: "top bottom",
          end: "top 60%",
          scrub: 0.4,
        },
      });

      // 2. CANVAS PULL-IN — ON-MOUNT one-shot (was scroll-scrubbed).
      // Per Anthony 2026-05-16: 'hero section, there's no animation at
      // the start of the experience it should have some movement.' Now
      // the watercolor breathes into focus on arrival: scale 1.10 →
      // 1.0 + blur(12px) → 0 over 2.4s with sine.out easing. Reads as
      // a slow camera dolly into the scene, paired with the existing
      // text entrance timeline.
      gsap.fromTo(
        ".hero-frame-wrap",
        { scale: 1.1, filter: "blur(12px)" },
        {
          scale: 1.0,
          filter: "blur(0px)",
          duration: 2.4,
          ease: "sine.out",
        }
      );
      // Ambient post-entrance — slow continuous breath on the watercolor
      // (1.0 ↔ 1.025 over 12s), giving the scene a living quality
      // throughout the time the user lingers on hero.
      gsap.to(".hero-frame-wrap", {
        scale: 1.025,
        duration: 12,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 2.6,
      });

      // 3. INVITATION CARD ENTRY — plays on mount (no scroll trigger because
      //    the hero is the first section and is in view from frame 0).
      //    Card scales in → tagline chars stagger → name chars stagger with
      //    rotateX flip → ampersand pops with back ease → gold rule grows →
      //    date + venue rises.
      const tl = gsap.timeline({ delay: 0.4 });

      tl.fromTo(
        ".hero-card",
        { y: 36, opacity: 0, scale: 0.96 },
        { y: 0, opacity: 1, scale: 1, ease: "power3.out", duration: 1.0 }
      )
        .fromTo(
          ".hero-tagline-char",
          { y: 12, opacity: 0 },
          { y: 0, opacity: 1, ease: "power3.out", duration: 0.5, stagger: 0.018 },
          "-=0.6"
        )
        // Names — slower + more dramatic. Each char enters with a film-
        // title blur-clear (8px → 0), rotateX flip, opacity 0 → 1, lift
        // y:36 → 0. Stagger 0.06s + per-char 1.1s = the names take ~1.8s
        // to fully reveal. Cinematic per Anthony's 'more cinematic or
        // dynamic animation with the texts.'
        .fromTo(
          ".hero-name-char",
          {
            y: 44,
            opacity: 0,
            rotateX: -55,
            filter: "blur(8px)",
            transformPerspective: 600,
          },
          {
            y: 0,
            opacity: 1,
            rotateX: 0,
            filter: "blur(0px)",
            ease: "power3.out",
            duration: 1.1,
            stagger: 0.07,
          },
          "-=0.45"
        )
        .fromTo(
          ".hero-and",
          { scale: 0.55, opacity: 0, rotation: -8 },
          {
            scale: 1,
            opacity: 1,
            rotation: 0,
            ease: "back.out(1.5)",
            duration: 0.7,
          },
          "-=0.35"
        )
        .fromTo(
          ".hero-rule",
          { width: 0 },
          { width: 48, ease: "power3.out", duration: 0.7 },
          "-=0.2"
        )
        .fromTo(
          ".hero-date-line",
          { y: 14, opacity: 0 },
          { y: 0, opacity: 1, ease: "power3.out", duration: 0.55, stagger: 0.06 },
          "-=0.3"
        );

      // AMBIENT BREATH — subtle 6s scale loop on names after entrance
      // settles. Adds the slow living-photograph feel of cinema title
      // cards. Imperceptible per-frame, palpable over time.
      gsap.to(".hero-name-text", {
        scale: 1.012,
        duration: 6,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 4,
      });

      // VIGNETTE softens as scroll deepens
      gsap.to(".hero-vignette", {
        opacity: 0.55,
        ease: "none",
        scrollTrigger: {
          trigger: sectionEl,
          start: "top top",
          end: "top -50%",
          scrub: 0.5,
        },
      });

      // The hero card STAYS fully visible during scroll through the hero
      // section. Anthony 2026-05-16 (fourth pass) called both prior
      // scroll-fade tweens "still disappears" — the harsh (opacity → 0
      // at top -25%) tween was the killer; even with a softer overlay
      // tween, the harsh one took priority. Both REMOVED.
      //
      // The hero is min-h-100svh + the next paper-slot (Countdown)
      // sticks at top:0 with higher z-index. So the next section will
      // physically rise OVER the hero card via the existing paper-stack
      // pattern — no opacity fade needed on the card itself. Names
      // stay 100% visible until covered by the next paper.
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Manual character split — keeps text accessible (the text is still in the
  // DOM as plain content) while letting GSAP target each char.
  const splitChars = (text: string, baseClass: string) =>
    Array.from(text).map((char, i) => (
      <span
        key={i}
        className={`${baseClass} inline-block`}
        style={{ whiteSpace: char === " " ? "pre" : undefined }}
      >
        {char}
      </span>
    ));

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative w-full"
      style={{ height: "180vh" }}
    >
      {/*
        Loading-state fallback: bg-cream (NOT bg-ink) so the first ~500ms
        before the FrameSequence canvas paints reads as cream paper, not a
        black rectangle with floating text. The hero-frame-wrap layers
        f-01.jpg as a static CSS background — when the canvas finally
        paints frame 0 it draws the same image at full fidelity on top,
        so there's no visible swap. NEXT_PUBLIC_BASE_PATH gets baked at
        build time per next.config.ts (empty for Cloudflare, repo prefix
        for GitHub Pages).
      */}
      <div className="cream-fade-edges sticky top-0 h-[100svh] supports-[height:100dvh]:h-[100dvh] w-full overflow-hidden bg-cream">
        {/* Frame canvas */}
        <div
          className="hero-frame-wrap absolute inset-0 w-full h-full"
          style={{
            transformOrigin: "center center",
            backgroundImage: `url("${process.env.NEXT_PUBLIC_BASE_PATH || ""}/frames/hero-wine-cheers/f-01.jpg")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <FrameSequence
            scene="hero-wine-cheers"
            frameCount={31}
            triggerSelector="#hero"
            className="absolute inset-0 w-full h-full"
          />
        </div>

        {/* CREAM PAGE-TURN — initial opacity dropped 0.75 → 0.4 (2026-05-15
            contrast pass). At 0.75 the veil over the watercolor blended cream
            text + cream-tinted watercolor + cream veil into mush. 0.4 keeps
            the "page-turn" feel while letting the dark vignette + name shadow
            do contrast work. */}
        <div
          className="hero-cream-veil absolute inset-0 pointer-events-none z-10"
          style={{ background: "var(--cream)", opacity: 0.22 }}
          aria-hidden
        />

        {/* Vignette — lighter pass per Anthony 2026-05-17 "the overlay on
            the hero is veryyy dark, fix it a bit while making sure the text
            appears properly and there's a nice contrast." Halved the center
            alpha + softened the bottom band. Still gives cream text a darker
            patch to sit on, but the watercolor reads through now. */}
        <div
          aria-hidden
          className="hero-vignette absolute inset-0 pointer-events-none z-20"
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at center, rgba(20,18,14,0.42) 0%, rgba(20,18,14,0.26) 45%, rgba(20,18,14,0.10) 75%, rgba(20,18,14,0) 100%), linear-gradient(180deg, rgba(20,18,14,0.30) 0%, rgba(20,18,14,0.05) 30%, rgba(20,18,14,0.05) 70%, rgba(20,18,14,0.45) 100%)",
            opacity: 1,
          }}
        />

        {/* === HERO TEXT — no card backdrop ===
            All text floats over the watercolor with strong text-shadow for
            contrast. Same character-reveal motion as before, just no glass
            box behind it (per Anthony 2026-05-02 "boxes are ugly"). */}
        <div className="absolute inset-0 flex items-center justify-center px-6 pointer-events-none z-30">
          <div
            className="hero-card text-center"
            style={{
              maxWidth: "min(92vw, 600px)",
              opacity: 0,
              perspective: "800px",
            }}
          >
            {/* INVITATION COPY — formal Lebanese Catholic wedding voice.
                Per Anthony 2026-05-16 + 4-brain (Codex pushed "request the
                pleasure of your company" over "would like to invite",
                Gemini approved family-centric phrasing). */}
            <p
              className="text-[10px] sm:text-xs uppercase tracking-[0.45em] text-cream/85 mb-6"
              style={{ textShadow: "0 2px 14px rgba(0,0,0,0.7)" }}
            >
              {"Together with their families".split(" ").map((word, wi, arr) => (
                <span key={wi} className="inline-block whitespace-nowrap">
                  {splitChars(word, "hero-tagline-char")}
                  {wi < arr.length - 1 && (
                    <span className="hero-tagline-char inline-block">&nbsp;</span>
                  )}
                </span>
              ))}
            </p>

            <h1 className="sr-only">
              Anthony &amp; Jennifer · 18 July 2026 · Couvent Saint Jean, Okaibe, Lebanon
            </h1>

            {/* Names — single line "Anthony & Jennifer" matching the gate's
                placement so the eye reads continuity across the paper-white
                fade (4-brain consensus: crossfade with position continuity,
                FLIP too fragile on iOS Safari). On scroll, this group ZOOMS
                OUT (scale down) instead of fading away — per Anthony
                2026-05-16: "anthony & jennifer should be as if they're
                zooming out not disappear when we're scrolling." */}
            {/* Names — words kept whole inside inline-block wrappers so
                they cannot break mid-character. Desktop cap dropped from
                84px to 68px per live audit 2026-05-16 (the 84px broke
                'Anthony & Jennifer' across two lines on 1440px because
                the card max-width is 600px). 68px fits comfortably. */}
            <p
              aria-hidden
              className="hero-name-text font-display leading-[1.05] mb-6 text-cream whitespace-nowrap"
              style={{
                fontSize: "clamp(32px, 6vw, 68px)",
                letterSpacing: "0.025em",
                fontWeight: 300,
                textShadow:
                  "0 4px 32px rgba(0,0,0,0.9), 0 0 16px rgba(0,0,0,0.7), 0 2px 8px rgba(0,0,0,0.5)",
              }}
            >
              <span className="inline-block whitespace-nowrap">
                {splitChars("Anthony", "hero-name-char")}
              </span>
              <span
                className="inline-block mx-3 sm:mx-4 align-middle"
                style={{
                  color: "#d4b87a",
                  fontSize: "0.85em",
                  textShadow: "0 4px 22px rgba(0,0,0,0.7)",
                }}
              >
                &amp;
              </span>
              <span className="inline-block whitespace-nowrap">
                {splitChars("Jennifer", "hero-name-char")}
              </span>
            </p>

            {/* Tagline — group each word so wraps fall on word boundaries
                (still character-staggered by GSAP via hero-tagline-char). */}
            <p
              className="text-[11px] sm:text-sm uppercase tracking-[0.4em] text-cream/85 mb-6"
              style={{ textShadow: "0 2px 14px rgba(0,0,0,0.65)" }}
            >
              {"request the pleasure of your company"
                .split(" ")
                .map((word, wi, arr) => (
                  <span key={wi} className="inline-block whitespace-nowrap">
                    {splitChars(word, "hero-tagline-char")}
                    {wi < arr.length - 1 && (
                      <span className="hero-tagline-char inline-block">&nbsp;</span>
                    )}
                  </span>
                ))}
            </p>

            <div
              className="hero-rule h-px mx-auto my-2"
              style={{
                background: "var(--gold)",
                width: 0,
                boxShadow: "0 0 12px rgba(0,0,0,0.4)",
              }}
            />
            {/* Date + place removed per Anthony 2026-05-17 — they live on
                the Countdown + Venue slots already; hero stays clean. */}
          </div>
        </div>
        {/* Scroll arrows REMOVED per Anthony 2026-05-16. */}
      </div>
    </section>
  );
}
