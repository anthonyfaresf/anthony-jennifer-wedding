"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FrameSequence } from "./FrameSequence";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

/**
 * Entrance splash — the OPENER (loading screen).
 *
 * Composition (per Anthony 2026-05-02):
 *   - Watercolor opener as a 31-frame canvas sequence (NOT an MP4 — matches
 *     the hero's strobe-free canvas pattern). Frames live at
 *     /public/frames/opener/f-01.jpg ... f-31.jpg.
 *   - Cream wash overlay (~50%) softens the frames so the splash text reads
 *     and the loading-screen mood is preserved.
 *   - Edge feather — soft cream cloud at corners so the canvas never has
 *     hard rectangular edges against the surrounding paper.
 *   - Lemons + A&J + names + date + venue + AF&U sit on top.
 *   - 180vh tall (matches hero) with sticky inner content. As the user
 *     scrolls down, frames advance (camera dollies through the tablescape
 *     toward the lemon centerpiece). After frames finish (~80vh of scroll),
 *     the splash content fades + lifts away → Hero appears.
 *
 * Animation:
 *   - lemons breathe gently (ambient yoyo)
 *   - text staggers in on first paint
 *   - on scroll, frames advance + content holds visible until frames finish
 *   - then content fades + lifts away → Hero appears
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

      if (reduceMotion) return;

      // Ambient lemon breathing
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

      // Bouncing arrow
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

      // Scroll-driven fade — content holds visible while frames play (first
      // ~80vh of scroll), then fades + lifts as the user continues past it.
      // start: "top -80%" → fade kicks in right when frames finish.
      // end: "bottom top" → fully gone by the time the splash exits viewport.
      gsap.to(".splash-content, .splash-cue", {
        opacity: 0,
        y: -55,
        ease: "none",
        scrollTrigger: {
          trigger: sectionEl,
          start: "top -80%",
          end: "bottom top",
          scrub: 0.6,
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
      style={{ height: "180vh" }}
    >
      {/* Sticky inner — frames + content stay pinned at top:0 while the outer
          180vh section scrolls beneath. Same structural pattern as Hero.tsx. */}
      <div className="cream-fade-edges sticky top-0 h-[100svh] supports-[height:100dvh]:h-[100dvh] w-full overflow-hidden bg-cream">
        {/* Frame canvas — opener watercolor scene. Scrolls advance frames. */}
        <FrameSequence
          scene="opener"
          frameCount={31}
          triggerSelector="#splash"
          className="absolute inset-0 w-full h-full"
        />

        {/* Cream wash — softens the frames so text reads, loading-screen feel.
            Heavier at top + bottom (where text sits), lighter through middle
            so the watercolor scene shows through. */}
        <div
          className="absolute inset-0 pointer-events-none z-10"
          aria-hidden
          style={{
            background:
              "linear-gradient(to bottom, rgba(244,236,224,0.65) 0%, rgba(244,236,224,0.42) 28%, rgba(244,236,224,0.38) 50%, rgba(244,236,224,0.45) 72%, rgba(244,236,224,0.72) 100%)",
          }}
        />

        {/* Edge feather — soft cream cloud bleed at corners so the frame
            canvas never has hard rectangular edges against the paper. */}
        <div
          className="absolute inset-0 pointer-events-none z-10"
          aria-hidden
          style={{
            background:
              "radial-gradient(ellipse 100% 100% at center, transparent 50%, rgba(244,236,224,0.55) 85%, var(--cream) 100%)",
          }}
        />

        {/* Splash content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-30">
          <div className="splash-content w-full max-w-md">
            {/* Lemons — centered, focal */}
            <div className="splash-lemons-wrap mb-6 sm:mb-8">
              <div className="splash-lemons mx-auto w-[62vw] sm:w-[36vw] max-w-[320px]">
                <img
                  src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/elements/lemon-hanging.png`}
                  alt=""
                  aria-hidden
                  className="w-full h-auto select-none"
                  style={{
                    filter: "drop-shadow(0 14px 40px rgba(73,83,20,0.30))",
                  }}
                />
              </div>
            </div>

            {/* "You are invited" */}
            <p
              className="splash-text-line text-[10px] sm:text-xs uppercase tracking-[0.55em] mb-5"
              style={{ color: "var(--display)", opacity: 0.85 }}
            >
              You are invited
            </p>

            {/* "A & J" monogram — visually a heading, but NOT an h1 (Hero owns the
                single page h1 for SEO/a11y). Using <p> with role="heading" aria-level
                so screen readers still announce it as a heading inside the splash. */}
            <p
              role="heading"
              aria-level={2}
              className="splash-text-line text-7xl sm:text-9xl leading-none mb-3"
              style={{
                fontFamily: "var(--font-display)",
                letterSpacing: "0.02em",
                color: "var(--display)",
              }}
            >
              A
              <span
                className="mx-2 sm:mx-3 align-middle inline-block"
                style={{
                  fontFamily: "var(--font-italianno)",
                  color: "var(--gold)",
                  fontSize: "0.62em",
                  transform: "translateY(-0.05em)",
                }}
              >
                &
              </span>
              J
            </p>

            {/* Gold rule */}
            <div
              className="splash-text-line w-16 h-px mx-auto my-5"
              style={{ background: "var(--gold)" }}
            />

            {/* Names */}
            <p
              className="splash-text-line text-2xl sm:text-3xl mb-4"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--display)",
              }}
            >
              Anthony · Jennifer
            </p>

            {/* Date */}
            <p
              className="splash-text-line text-[10px] sm:text-xs uppercase tracking-[0.4em] mb-2"
              style={{ color: "var(--display)" }}
            >
              July 18 · 2026
            </p>
            <p
              className="splash-text-line text-[9px] sm:text-[10px] uppercase tracking-[0.35em]"
              style={{ color: "var(--display)", opacity: 0.75 }}
            >
              Couvent Saint Jean · Okaibe · Lebanon
            </p>
          </div>
        </div>

        {/* Swipe cue */}
        <div className="splash-cue absolute bottom-16 left-0 right-0 text-center pointer-events-none z-30">
          <p
            className="text-[10px] uppercase tracking-[0.45em] mb-3"
            style={{ color: "var(--display)", opacity: 0.7 }}
          >
            Swipe to begin
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

        {/* AF&U credit */}
        <div className="absolute bottom-3 left-0 right-0 text-center pointer-events-auto z-30">
          <p
            className="text-[9px] uppercase tracking-[0.3em]"
            style={{ color: "var(--display)", opacity: 0.6 }}
          >
            By{" "}
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
