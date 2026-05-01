"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

/**
 * Hero — full-bleed cinematic opener.
 * Video is a 5s slow push-in from a medium two-shot of the couple at a café
 * table to an extreme close-up of two wine glasses cheers-ing. Plays scroll-
 * scrubbed: scrolling drives the camera move. Text overlays fade in at
 * specific scroll points (names, date, venue, scroll cue).
 */
export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      const sectionEl = sectionRef.current;
      const video = videoRef.current;
      if (!sectionEl || !video) return;

      const wireScrub = () => {
        if (!isFinite(video.duration) || video.duration === 0) return;

        // Prime buffer for iOS Safari smooth scrub
        const prime = video.play();
        if (prime && typeof prime.then === "function") {
          prime.then(() => video.pause()).catch(() => video.pause());
        } else {
          video.pause();
        }

        if (reduceMotion) {
          video.currentTime = 0;
          return;
        }

        // Bind currentTime to scroll progress through the hero section
        gsap.to(video, {
          currentTime: video.duration,
          ease: "none",
          scrollTrigger: {
            trigger: sectionEl,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.5,
          },
        });

        // Names start visible at scroll 0 (over the wide two-shot), then fade
        // out as the camera pushes into the cheers ECU.
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
      };

      if (video.readyState >= 3 && isFinite(video.duration)) {
        wireScrub();
      } else {
        video.addEventListener("canplay", wireScrub, { once: true });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full"
      style={{ height: "220vh" }}
    >
      <div className="sticky top-0 h-[100svh] supports-[height:100dvh]:h-[100dvh] w-full overflow-hidden bg-ink">
        {/* Full-bleed wine-cheers video, scrubbed by scroll */}
        <video
          ref={videoRef}
          src="/videos/hero-wine-cheers.mp4"
          poster="/videos/posters/hero-wine-cheers.jpg"
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ pointerEvents: "none" }}
        />

        {/* Soft vignette gradient — gives text contrast over the warm video */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, rgba(42,37,32,0.35) 0%, rgba(42,37,32,0.1) 35%, rgba(42,37,32,0.1) 65%, rgba(42,37,32,0.55) 100%)",
          }}
        />

        {/* Couple's names — center, fade in early then out as camera pushes in */}
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
