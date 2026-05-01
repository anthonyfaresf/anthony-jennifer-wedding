"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FrameSequence } from "./FrameSequence";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

/**
 * Hero — full-bleed cinematic opener.
 *
 * Wine-cheers push-in as a 31-frame canvas sequence (no img.src swapping
 * = no strobe on iOS). 180vh tall (was 220 — feels snappier per Anthony
 * 2026-05-02 "i feel there's something lagging").
 *
 * Appearance choreography (per Anthony 2026-05-02 "make it appear more"):
 *   1. CREAM PAGE-TURN — a warm cream wash starts at 75% opacity and lifts
 *      to 0 as you scroll into the hero. Bridges splash → hero seamlessly.
 *   2. SCALE PULL-IN — frame canvas starts at scale 1.07 and eases to 1
 *      as it appears. Subtle focal pull, like a lens settling.
 *   3. NAMES SLIDE FROM SIDES — Anthony from -40px on the left, Jennifer
 *      from +40px on the right, "and" scales 0.6 → 1. They land together.
 *   4. DATE LIFTS UP — date + venue rises from y=40 with a soft fade.
 *   5. VIGNETTE SOFTENS — heavier bottom shadow at start, eases out.
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

      // 1. CREAM PAGE-TURN — fades from 0.75 → 0 in the first 25% of hero scroll
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

      // 2. SCALE PULL-IN — frame canvas scales 1.07 → 1.0 as hero enters
      gsap.fromTo(
        ".hero-frame-wrap",
        { scale: 1.07 },
        {
          scale: 1.0,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionEl,
            start: "top bottom",
            end: "top 30%",
            scrub: 0.4,
          },
        }
      );

      // 3. NAMES SLIDE FROM SIDES — Anthony from left, Jennifer from right
      gsap.fromTo(
        ".hero-name-anthony",
        { x: -50, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionEl,
            start: "top 75%",
            end: "top 30%",
            scrub: 0.5,
          },
        }
      );
      gsap.fromTo(
        ".hero-name-jennifer",
        { x: 50, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionEl,
            start: "top 75%",
            end: "top 30%",
            scrub: 0.5,
          },
        }
      );
      gsap.fromTo(
        ".hero-name-and",
        { scale: 0.55, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          ease: "back.out(1.4)",
          scrollTrigger: {
            trigger: sectionEl,
            start: "top 70%",
            end: "top 35%",
            scrub: 0.5,
          },
        }
      );
      gsap.fromTo(
        ".hero-name-tagline",
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionEl,
            start: "top 75%",
            end: "top 40%",
            scrub: 0.5,
          },
        }
      );

      // Names fade out as the camera pushes into the cheers ECU
      gsap.to(".hero-names", {
        opacity: 0,
        y: -30,
        ease: "none",
        scrollTrigger: {
          trigger: sectionEl,
          start: "top -20%",
          end: "top -55%",
          scrub: 0.5,
        },
      });

      // 4. DATE + venue rises during close-up moment
      gsap.fromTo(
        ".hero-date",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionEl,
            start: "top -45%",
            end: "top -75%",
            scrub: 0.5,
          },
        }
      );

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

      // 5. VIGNETTE — softens as you scroll deeper
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

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative w-full"
      style={{ height: "180vh" }}
    >
      <div className="sticky top-0 h-[100svh] supports-[height:100dvh]:h-[100dvh] w-full overflow-hidden bg-ink">
        {/* Frame canvas — wrapped so we can scale the wrap without scaling the canvas's drawing context */}
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

        {/* CREAM PAGE-TURN — bridges splash → hero. Fades to 0 as you scroll in. */}
        <div
          className="hero-cream-veil absolute inset-0 pointer-events-none z-10"
          style={{
            background: "var(--cream)",
            opacity: 0.75,
          }}
          aria-hidden
        />

        {/* Vignette — gives text contrast over the warm scene */}
        <div
          aria-hidden
          className="hero-vignette absolute inset-0 pointer-events-none z-20"
          style={{
            background:
              "linear-gradient(180deg, rgba(42,37,32,0.45) 0%, rgba(42,37,32,0.05) 28%, rgba(42,37,32,0.05) 65%, rgba(42,37,32,0.7) 100%)",
            opacity: 1,
          }}
        />

        {/* Couple's names — slide in from sides */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-none z-30">
          <div className="hero-names">
            <p
              className="hero-name-tagline text-[10px] sm:text-xs uppercase tracking-[0.45em] text-cream/85 mb-6"
              style={{ textShadow: "0 2px 14px rgba(0,0,0,0.55)" }}
            >
              Together with their families
            </p>
            <h1
              className="hero-name-anthony font-display text-6xl sm:text-7xl md:text-8xl text-cream leading-none mb-2"
              style={{ textShadow: "0 4px 28px rgba(0,0,0,0.55)" }}
            >
              Anthony
            </h1>
            <p
              className="hero-name-and text-5xl sm:text-6xl md:text-7xl leading-none mb-2"
              style={{
                fontFamily: "var(--font-italianno)",
                color: "#d4b87a",
                textShadow: "0 4px 18px rgba(0,0,0,0.6)",
                display: "inline-block",
              }}
            >
              and
            </p>
            <h1
              className="hero-name-jennifer font-display text-6xl sm:text-7xl md:text-8xl text-cream leading-none"
              style={{ textShadow: "0 4px 28px rgba(0,0,0,0.55)" }}
            >
              Jennifer
            </h1>
          </div>
        </div>

        {/* Date + venue — rises during close-up */}
        <div className="hero-date absolute bottom-20 sm:bottom-28 left-0 right-0 text-center px-6 pointer-events-none opacity-0 z-30">
          <div className="w-12 h-px bg-gold mx-auto mb-5" />
          <p
            className="font-display text-3xl sm:text-4xl text-cream leading-none mb-3"
            style={{ textShadow: "0 4px 18px rgba(0,0,0,0.55)" }}
          >
            July 18 · 2026
          </p>
          <p
            className="text-[10px] sm:text-xs uppercase tracking-[0.4em] text-cream/85"
            style={{ textShadow: "0 2px 12px rgba(0,0,0,0.55)" }}
          >
            Couvent Saint Jean · Okaibe · Lebanon
          </p>
        </div>

        {/* Scroll cue */}
        <div className="hero-scroll-cue absolute bottom-6 left-1/2 -translate-x-1/2 text-center pointer-events-none z-30">
          <p
            className="text-[10px] uppercase tracking-[0.4em] text-cream/70 mb-2"
            style={{ textShadow: "0 2px 8px rgba(0,0,0,0.4)" }}
          >
            Scroll
          </p>
          <p className="text-cream/60 text-xs">↓</p>
        </div>
      </div>
    </section>
  );
}
