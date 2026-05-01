"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FrameSequence } from "./FrameSequence";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

/**
 * Hero — full-bleed cinematic opener.
 * Wine-cheers push-in as a 31-frame image sequence (not <video>) — bulletproof
 * scroll-scrub on every device including iOS Safari (video.currentTime seeks
 * are unreliable on mobile Safari due to buffer eviction).
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

      // Names fade out as the camera pushes into the cheers ECU
      gsap.to(".hero-names", {
        opacity: 0,
        y: -30,
        ease: "none",
        scrollTrigger: {
          trigger: sectionEl,
          start: "top -30%",
          end: "top -65%",
          scrub: 0.5,
        },
      });

      // Date + venue appear during the close-up moment
      gsap.fromTo(
        ".hero-date",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionEl,
            start: "top -55%",
            end: "top -90%",
            scrub: 0.5,
          },
        }
      );

      // Scroll indicator fades out as the user scrolls
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
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative w-full"
      style={{ height: "220vh" }}
    >
      <div className="sticky top-0 h-[100svh] supports-[height:100dvh]:h-[100dvh] w-full overflow-hidden bg-ink">
        {/* Wine-cheers push-in as image sequence (31 frames, scroll-scrubbed) */}
        <FrameSequence
          scene="hero-wine-cheers"
          frameCount={31}
          triggerSelector="#hero"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Soft vignette gradient — gives text contrast over the warm scene */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, rgba(42,37,32,0.35) 0%, rgba(42,37,32,0.1) 35%, rgba(42,37,32,0.1) 65%, rgba(42,37,32,0.55) 100%)",
          }}
        />

        {/* Couple's names — center, fade out as camera pushes in */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-none">
          <div className="hero-names">
            <p
              className="text-[10px] sm:text-xs uppercase tracking-[0.45em] text-cream/80 mb-6"
              style={{ textShadow: "0 2px 12px rgba(0,0,0,0.4)" }}
            >
              Together with their families
            </p>
            <h1
              className="font-display text-6xl sm:text-7xl md:text-8xl text-cream leading-none mb-2"
              style={{ textShadow: "0 4px 24px rgba(0,0,0,0.45)" }}
            >
              Anthony
            </h1>
            <p
              className="text-5xl sm:text-6xl md:text-7xl leading-none mb-2"
              style={{
                fontFamily: "var(--font-italianno)",
                color: "#d4b87a",
                textShadow: "0 4px 16px rgba(0,0,0,0.5)",
              }}
            >
              and
            </p>
            <h1
              className="font-display text-6xl sm:text-7xl md:text-8xl text-cream leading-none"
              style={{ textShadow: "0 4px 24px rgba(0,0,0,0.45)" }}
            >
              Jennifer
            </h1>
          </div>
        </div>

        {/* Date + venue — bottom block, fades in during close-up moment */}
        <div className="hero-date absolute bottom-20 sm:bottom-28 left-0 right-0 text-center px-6 pointer-events-none opacity-0">
          <div className="w-12 h-px bg-gold mx-auto mb-5" />
          <p
            className="font-display text-3xl sm:text-4xl text-cream leading-none mb-3"
            style={{ textShadow: "0 4px 16px rgba(0,0,0,0.5)" }}
          >
            July 18 · 2026
          </p>
          <p
            className="text-[10px] sm:text-xs uppercase tracking-[0.4em] text-cream/85"
            style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}
          >
            Couvent Saint Jean · Okaibe · Lebanon
          </p>
        </div>

        {/* Scroll cue — bottom-center on first viewport */}
        <div className="hero-scroll-cue absolute bottom-6 left-1/2 -translate-x-1/2 text-center pointer-events-none">
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
