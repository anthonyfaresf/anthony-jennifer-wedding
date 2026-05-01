"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

/**
 * Entrance splash — the OPENER. Like an iPhone lock screen for the wedding.
 *
 * Composition:
 *   z-0   wine-cheers hero peek behind everything (both faces visible)
 *   z-10  cream paper covers LEFT HALF only → hides Anthony
 *         Right half exposed → Jennifer peeks through (the "she's already
 *         here, you have to swipe to see him too" feel)
 *   z-20  lemons CENTERED in middle of viewport, with the writing directly
 *         below them — the focal point bridging both halves
 *
 * Phase 0 (load):  lemons breathe · text staggers in · ↑ cue bounces
 * Phase 1 (scroll 0-45%):  lemons shrink + drift up · text fades + lifts
 *                          (same fade for text, same shrink for lemons —
 *                          per Anthony 2026-05-02)
 * Phase 2 (scroll 60-100%): LEFT cream paper slides off-screen → Anthony
 *                          revealed → wedding website unlocked.
 */
export default function EntranceSplash() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      const sectionEl = sectionRef.current;
      if (!sectionEl) return;

      if (reduceMotion) return; // honor user preference — keep static

      // === AMBIENT (no scroll required) ===
      gsap.to(".splash-lemons", {
        y: 8,
        rotate: 0.6,
        scale: 1.02,
        duration: 4.6,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        transformOrigin: "center center",
      });

      gsap.to(".splash-cue-arrow", {
        y: -10,
        duration: 1.4,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });

      gsap.to(".splash-cue-arrow", {
        opacity: 0.4,
        duration: 1.4,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });

      // Stagger text reveal on initial load
      gsap.from(".splash-text-line", {
        y: 24,
        opacity: 0,
        duration: 1.1,
        ease: "power3.out",
        stagger: 0.16,
        delay: 0.3,
      });

      // === SCROLL-DRIVEN ===

      // Phase 1: lemons shrink + drift up (kept identical movement)
      gsap.to(".splash-lemons-wrap", {
        scale: 0.42,
        yPercent: -45,
        ease: "none",
        scrollTrigger: {
          trigger: sectionEl,
          start: "top top",
          end: "55% top",
          scrub: 0.6,
        },
      });

      // Text block fades + lifts (kept identical fade)
      gsap.to(".splash-text-block", {
        opacity: 0,
        y: -55,
        scale: 0.92,
        ease: "none",
        scrollTrigger: {
          trigger: sectionEl,
          start: "top top",
          end: "42% top",
          scrub: 0.5,
        },
      });

      // Swipe cue fades early (you don't need to keep telling them to scroll)
      gsap.to(".splash-cue", {
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: sectionEl,
          start: "top top",
          end: "20% top",
          scrub: 0.4,
        },
      });

      // Phase 2: LEFT cream slides off → Anthony unlocked → website opens
      gsap.to(".panel-left", {
        xPercent: -102,
        ease: "power2.in",
        scrollTrigger: {
          trigger: sectionEl,
          start: "55% top",
          end: "bottom top",
          scrub: 0.7,
        },
      });

      // Lemons fade out as the cream parts (don't compete with the reveal)
      gsap.to(".splash-lemons-wrap", {
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: sectionEl,
          start: "55% top",
          end: "80% top",
          scrub: 0.5,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="splash"
      className="relative w-full"
      style={{ height: "240vh" }}
    >
      <div className="sticky top-0 h-[100svh] supports-[height:100dvh]:h-[100dvh] w-full overflow-hidden">
        {/* z-0 — HERO PEEK behind everything (wine-cheers, both visible).
            Anthony is on the LEFT half, Jennifer on the RIGHT half. */}
        <img
          src={`${BP}/frames/hero-wine-cheers/f-01.jpg`}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover z-0 select-none"
        />

        {/* z-10 — CREAM PAPER covers LEFT HALF — hides Anthony.
            Right half exposed → Jennifer peeking through.
            (No paper-grain class — that rule sets position:relative which
            breaks the absolute layout. Solid cream is fine for the curtain.) */}
        <div
          className="panel-left absolute top-0 left-0 w-1/2 h-full bg-cream z-10"
          aria-hidden
        />

        {/* z-10 — Soft seam at the divide so the cream feathers into Jennifer's
            side rather than a hard cut. */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 h-full z-10 pointer-events-none"
          style={{
            width: "16vw",
            background:
              "linear-gradient(to right, var(--cream) 0%, transparent 100%)",
          }}
          aria-hidden
        />

        {/* z-20 — CENTERED FOCAL POINT: lemons + writing as one stacked unit
            in the middle of the viewport, bridging both halves. */}
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-6 pointer-events-none">
          {/* Lemons — directly above the writing */}
          <div className="splash-lemons-wrap mb-2 sm:mb-4">
            <div className="splash-lemons w-[58vw] sm:w-[34vw] max-w-[300px]">
              <img
                src={`${BP}/elements/lemon-hanging.png`}
                alt=""
                aria-hidden
                className="w-full h-auto select-none"
                style={{
                  filter: "drop-shadow(0 12px 32px rgba(73,83,20,0.28))",
                }}
              />
            </div>
          </div>

          {/* Writing — directly below the lemons */}
          <div className="splash-text-block max-w-[90%]">
            <p
              className="splash-text-line text-[10px] sm:text-xs uppercase tracking-[0.55em] mb-5"
              style={{
                color: "var(--display)",
                opacity: 0.85,
                textShadow: "0 1px 10px rgba(244,236,224,0.7)",
              }}
            >
              You are invited
            </p>

            {/* "A & J" with text-clip mask — letters reveal lemon image through them */}
            <h1
              className="splash-text-line text-7xl sm:text-9xl leading-none mb-3 splash-monogram"
              style={{
                fontFamily: "var(--font-display)",
                letterSpacing: "0.02em",
                backgroundImage: `url(${BP}/elements/lemon-hanging.png)`,
                backgroundPosition: "center 35%",
                backgroundSize: "180% auto",
                backgroundRepeat: "no-repeat",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 2px 12px rgba(73,83,20,0.32))",
              }}
            >
              A
              <span
                className="mx-2 sm:mx-3 align-middle inline-block"
                style={{
                  fontFamily: "var(--font-italianno)",
                  backgroundImage: "none",
                  WebkitBackgroundClip: "border-box",
                  backgroundClip: "border-box",
                  color: "var(--gold)",
                  WebkitTextFillColor: "var(--gold)",
                  fontSize: "0.62em",
                  transform: "translateY(-0.05em)",
                }}
              >
                &
              </span>
              J
            </h1>

            <div
              className="splash-text-line w-16 h-px mx-auto my-5"
              style={{ background: "var(--gold)" }}
            />

            <p
              className="splash-text-line text-2xl sm:text-3xl mb-4"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--display)",
                textShadow: "0 1px 10px rgba(244,236,224,0.6)",
              }}
            >
              Anthony · Jennifer
            </p>

            <p
              className="splash-text-line text-[10px] sm:text-xs uppercase tracking-[0.4em] mb-2"
              style={{
                color: "var(--display)",
                textShadow: "0 1px 8px rgba(244,236,224,0.55)",
              }}
            >
              July 18 · 2026
            </p>
            <p
              className="splash-text-line text-[9px] sm:text-[10px] uppercase tracking-[0.35em]"
              style={{
                color: "var(--display)",
                opacity: 0.75,
                textShadow: "0 1px 8px rgba(244,236,224,0.55)",
              }}
            >
              Couvent Saint Jean · Okaibe · Lebanon
            </p>
          </div>
        </div>

        {/* Swipe-up cue — bottom, animated bounce ("unlock" framing) */}
        <div className="splash-cue absolute bottom-14 left-0 right-0 text-center z-20 pointer-events-none">
          <p
            className="text-[10px] uppercase tracking-[0.45em] mb-3"
            style={{
              color: "var(--display)",
              opacity: 0.78,
              textShadow: "0 1px 8px rgba(244,236,224,0.55)",
            }}
          >
            Swipe to unlock
          </p>
          <svg
            className="splash-cue-arrow mx-auto"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: "var(--display)" }}
          >
            <path d="M12 19V5" />
            <path d="M5 12l7-7 7 7" />
          </svg>
        </div>

        {/* z-30 — AF&U credit (always on top, link clickable) */}
        <div className="absolute bottom-3 left-0 right-0 text-center z-30 pointer-events-auto">
          <p
            className="text-[9px] uppercase tracking-[0.3em]"
            style={{
              color: "var(--display)",
              opacity: 0.6,
              textShadow: "0 1px 8px rgba(244,236,224,0.55)",
            }}
          >
            Crafted with care by{" "}
            <a
              href="https://www.afandu.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline-offset-4 hover:underline"
              style={{ color: "var(--display)" }}
            >
              AF&amp;U
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
