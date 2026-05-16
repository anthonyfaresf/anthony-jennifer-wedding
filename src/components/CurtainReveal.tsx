"use client";

/**
 * CurtainReveal — the moment the wedding actually begins.
 *
 * Once the envelope dismisses, this overlay plays the 31-frame wine-cheers
 * sequence to the clink, holds for a beat at the touch, then splits the
 * image in two and pulls each half outward like stage curtains. Behind
 * the curtains: the hero of the website, ready to scroll.
 *
 * State machine: cheers → hold → splitting → done.
 *
 * Anthony 2026-05-16: "the glasses touch each other and then move back as
 * a curtain effect, and the website starts, we can scroll down — this is
 * where the story begins."
 *
 * Reduced motion: skips straight to `done` so guests with the OS-level
 * preference don't get a stalled blank screen.
 */

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const BP = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const FRAME_COUNT = 31;
const FRAMES_DURATION = 1.4; // seconds — play f-01 → f-31
const CLINK_HOLD = 0.45; // seconds — pause at the touch
const CURTAIN_DURATION = 1.15; // seconds — split outward
const CURTAIN_FADE_OVERLAP = 0.25; // seconds before curtain finishes, fade the whole layer

type Phase = "cheers" | "hold" | "splitting" | "done";

interface Props {
  /** Called once the curtain has fully cleared. Parent can then unlock scroll. */
  onComplete: () => void;
}

export default function CurtainReveal({ onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>("cheers");
  const [frame, setFrame] = useState(1);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Preload all frames so the sequence is buttery, not stuttery
  useEffect(() => {
    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image();
      img.src = `${BP}/frames/hero-wine-cheers/f-${String(i).padStart(2, "0")}.jpg`;
    }
  }, []);

  useEffect(() => {
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      // No animation — leave the page immediately scrollable.
      setPhase("done");
      onCompleteRef.current();
      return;
    }

    // Lock scroll while curtain plays — guests can't scroll until reveal lands.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    let raf = 0;
    const startTime = performance.now();
    let holdTimer: ReturnType<typeof setTimeout> | null = null;
    let splitTl: gsap.core.Timeline | null = null;

    const tick = () => {
      const elapsed = (performance.now() - startTime) / 1000;
      const progress = Math.min(elapsed / FRAMES_DURATION, 1);
      // Ease the playback so the clink lands with weight
      const eased = 1 - Math.pow(1 - progress, 2.2);
      const f = Math.max(1, Math.min(FRAME_COUNT, Math.ceil(eased * FRAME_COUNT)));
      setFrame(f);
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
        return;
      }

      // 2. Hold on the clink
      setPhase("hold");
      holdTimer = setTimeout(() => {
        // 3. Curtain splits outward
        setPhase("splitting");
        splitTl = gsap.timeline({
          onComplete: () => {
            setPhase("done");
            document.body.style.overflow = prevOverflow;
            onCompleteRef.current();
          },
        });
        splitTl
          .to(
            leftRef.current,
            {
              xPercent: -105,
              duration: CURTAIN_DURATION,
              ease: "expo.inOut",
            },
            0
          )
          .to(
            rightRef.current,
            {
              xPercent: 105,
              duration: CURTAIN_DURATION,
              ease: "expo.inOut",
            },
            0
          )
          // Subtle whole-layer fade so the seam disappears just before the
          // halves clear the viewport.
          .to(
            containerRef.current,
            {
              opacity: 0,
              duration: CURTAIN_FADE_OVERLAP,
              ease: "power2.in",
            },
            CURTAIN_DURATION - CURTAIN_FADE_OVERLAP
          );
      }, CLINK_HOLD * 1000);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      if (holdTimer) clearTimeout(holdTimer);
      if (splitTl) splitTl.kill();
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  if (phase === "done") return null;

  const frameSrc = `${BP}/frames/hero-wine-cheers/f-${String(frame).padStart(2, "0")}.jpg`;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[55] overflow-hidden pointer-events-none bg-cream"
      aria-hidden
    >
      {/* LEFT HALF — a full-viewport image masked by clip-path to show only
          its left 50%. Animating translateX slides the whole masked element
          off-screen, taking the visible half with it. */}
      <div
        ref={leftRef}
        className="absolute inset-0"
        style={{ willChange: "transform", clipPath: "inset(0 50% 0 0)" }}
      >
        <img
          src={frameSrc}
          alt=""
          draggable={false}
          className="absolute inset-0 w-full h-full select-none"
          style={{ objectFit: "cover", objectPosition: "center center" }}
        />
      </div>
      {/* RIGHT HALF — same image, clip-path masks to right 50%. */}
      <div
        ref={rightRef}
        className="absolute inset-0"
        style={{ willChange: "transform", clipPath: "inset(0 0 0 50%)" }}
      >
        <img
          src={frameSrc}
          alt=""
          draggable={false}
          className="absolute inset-0 w-full h-full select-none"
          style={{ objectFit: "cover", objectPosition: "center center" }}
        />
      </div>
      {/* Theatrical vignette — sells the curtain. */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 55%, rgba(20,18,14,0.42) 100%)",
        }}
      />
    </div>
  );
}
