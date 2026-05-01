"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

/**
 * Entrance splash — the OPENER. Pure cream paper.
 *
 * Composition (per Anthony 2026-05-02):
 *   - lemons centered (the focal point)
 *   - "A & J" + names + date + venue right below
 *   - AF&U credit at the bottom
 *   - swipe cue
 *   - NO photo behind, NO curtain split — just a clean invitation card.
 *
 * Animation:
 *   - lemons breathe gently (ambient yoyo)
 *   - text staggers in on first paint
 *   - on scroll past the splash, the whole block fades + lifts away → Hero appears
 *
 * (Future: replace cream background with the opener video — a Mediterranean
 * tablescape that ends on the lemon centerpiece. Prompt is in `prompts/opener-video.md`.)
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

      // Scroll-driven fade — the whole splash gently lifts as you leave
      gsap.to(".splash-content, .splash-cue", {
        opacity: 0,
        y: -55,
        ease: "none",
        scrollTrigger: {
          trigger: sectionEl,
          start: "top top",
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
      className="relative w-full bg-cream"
      style={{ height: "100svh" }}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
        <div className="splash-content w-full max-w-md">
          {/* Lemons — centered, focal */}
          <div className="splash-lemons-wrap mb-6 sm:mb-8">
            <div className="splash-lemons mx-auto w-[62vw] sm:w-[36vw] max-w-[320px]">
              <img
                src={`${BP}/elements/lemon-hanging.png`}
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

          {/* "A & J" monogram */}
          <h1
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
          </h1>

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
      <div className="splash-cue absolute bottom-16 left-0 right-0 text-center pointer-events-none">
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
      <div className="absolute bottom-3 left-0 right-0 text-center pointer-events-auto">
        <p
          className="text-[9px] uppercase tracking-[0.3em]"
          style={{ color: "var(--display)", opacity: 0.6 }}
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
    </section>
  );
}
