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

      // 2. CANVAS SCALE PULL-IN + blur-clear — 1.07 → 1.0, blur(8) → blur(0)
      gsap.fromTo(
        ".hero-frame-wrap",
        { scale: 1.07, filter: "blur(8px)" },
        {
          scale: 1.0,
          filter: "blur(0px)",
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionEl,
            start: "top bottom",
            end: "top 30%",
            scrub: 0.4,
          },
        }
      );

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
        .fromTo(
          ".hero-name-char",
          { y: 36, opacity: 0, rotateX: -45 },
          {
            y: 0,
            opacity: 1,
            rotateX: 0,
            ease: "power3.out",
            duration: 0.85,
            stagger: 0.04,
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

      // Card lifts + fades as the camera pushes deeper into the cheers ECU
      gsap.to(".hero-card", {
        opacity: 0,
        y: -40,
        scale: 0.97,
        ease: "none",
        scrollTrigger: {
          trigger: sectionEl,
          start: "top -25%",
          end: "top -65%",
          scrub: 0.5,
        },
      });

      // Scroll indicator fades out
      gsap.to(".hero-scroll-cue", {
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: sectionEl,
          start: "top top",
          end: "top -20%",
          scrub: 0.5,
        },
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
      <div className="cream-fade-edges sticky top-0 h-[100svh] supports-[height:100dvh]:h-[100dvh] w-full overflow-hidden bg-ink">
        {/* Frame canvas */}
        <div
          className="hero-frame-wrap absolute inset-0 w-full h-full"
          style={{ transformOrigin: "center center" }}
        >
          <FrameSequence
            scene="hero-wine-cheers"
            frameCount={31}
            triggerSelector="#hero"
            className="absolute inset-0 w-full h-full"
          />
        </div>

        {/* CREAM PAGE-TURN */}
        <div
          className="hero-cream-veil absolute inset-0 pointer-events-none z-10"
          style={{ background: "var(--cream)", opacity: 0.75 }}
          aria-hidden
        />

        {/* Vignette */}
        <div
          aria-hidden
          className="hero-vignette absolute inset-0 pointer-events-none z-20"
          style={{
            background:
              "linear-gradient(180deg, rgba(42,37,32,0.45) 0%, rgba(42,37,32,0.05) 28%, rgba(42,37,32,0.05) 65%, rgba(42,37,32,0.7) 100%)",
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
            <p
              className="text-[10px] sm:text-xs uppercase tracking-[0.5em] text-cream/90 mb-7"
              style={{ textShadow: "0 2px 14px rgba(0,0,0,0.7)" }}
            >
              {splitChars("Together with their families", "hero-tagline-char")}
            </p>

            <h1
              className="font-display leading-none mb-3 text-cream"
              style={{
                fontSize: "clamp(56px, 9vw, 110px)",
                letterSpacing: "0.01em",
                textShadow: "0 4px 32px rgba(0,0,0,0.65), 0 0 12px rgba(0,0,0,0.4)",
              }}
            >
              {splitChars("Anthony", "hero-name-char")}
            </h1>

            <p
              className="hero-and leading-none mb-3 inline-block"
              style={{
                fontFamily: "var(--font-italianno)",
                fontSize: "clamp(40px, 6vw, 72px)",
                color: "#d4b87a",
                textShadow: "0 4px 22px rgba(0,0,0,0.7)",
              }}
            >
              and
            </p>

            <h1
              className="font-display leading-none mb-7 text-cream"
              style={{
                fontSize: "clamp(56px, 9vw, 110px)",
                letterSpacing: "0.01em",
                textShadow: "0 4px 32px rgba(0,0,0,0.65), 0 0 12px rgba(0,0,0,0.4)",
              }}
            >
              {splitChars("Jennifer", "hero-name-char")}
            </h1>

            <div
              className="hero-rule h-px mx-auto my-6"
              style={{
                background: "var(--gold)",
                width: 0,
                boxShadow: "0 0 12px rgba(0,0,0,0.4)",
              }}
            />

            <p
              className="hero-date-line leading-none mb-3 text-cream"
              style={{
                fontSize: "clamp(18px, 2.1vw, 26px)",
                letterSpacing: "0.04em",
                opacity: 0,
                textShadow: "0 3px 18px rgba(0,0,0,0.65)",
              }}
            >
              July 18 · 2026
            </p>
            <p
              className="hero-date-line text-[10px] sm:text-xs uppercase tracking-[0.4em] text-cream/90"
              style={{
                opacity: 0,
                textShadow: "0 2px 12px rgba(0,0,0,0.65)",
              }}
            >
              Couvent Saint Jean · Okaibe · Lebanon
            </p>
          </div>
        </div>

        {/* Scroll cue — text only, no pill backdrop */}
        <div className="hero-scroll-cue absolute bottom-6 left-1/2 -translate-x-1/2 text-center pointer-events-none z-30">
          <p
            className="text-[10px] uppercase tracking-[0.4em] text-cream/75 mb-2"
            style={{ textShadow: "0 2px 8px rgba(0,0,0,0.55)" }}
          >
            Scroll
          </p>
          <p
            className="text-cream/60 text-xs"
            style={{ textShadow: "0 2px 6px rgba(0,0,0,0.5)" }}
          >
            ↓
          </p>
        </div>
      </div>
    </section>
  );
}
