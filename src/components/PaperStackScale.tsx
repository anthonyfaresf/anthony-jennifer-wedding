"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

/**
 * PaperStackScale — adds the physical "depth" cue to the sticky paper stack.
 *
 * Without this, each paper-slot pins at top:0 and the next slot's higher
 * z-index covers it — but the previous paper STAYS at 1.0 scale under the
 * cover, so the eye doesn't read the stacking. Anthony 2026-05-15:
 * "they should get a bit smaller as they're scrolling while the next one
 * comes on it".
 *
 * Fix: for each paper-slot[n], drive a scroll-bound tween on
 * paper-slot[n-1] (the one being covered) so it scales 1.0 → 0.94 and
 * dims slightly while paper-slot[n] rises over it. Reads as the previous
 * paper receding into the stack.
 *
 * Trigger geometry:
 *   - The rising paper is paper-slot[n]. Its `top` going from
 *     viewport-bottom up to viewport-top is the time window where
 *     paper-slot[n-1] should be shrinking.
 *   - start: "top bottom" — moment next paper enters viewport
 *   - end:   "top top"    — moment next paper fully covers
 *   - scrub: 0.4 (slight inertia for smoothness)
 *
 * Honors prefers-reduced-motion.
 */
export default function PaperStackScale() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const ctx = gsap.context(() => {
      const slots = Array.from(document.querySelectorAll(".paper-slot")) as HTMLElement[];
      if (slots.length < 2) return;

      slots.forEach((slot, i) => {
        if (i === slots.length - 1) return; // last paper never gets covered
        const next = slots[i + 1];

        gsap.fromTo(
          slot,
          {
            scale: 1,
            y: 0,
            filter: "brightness(1)",
            transformOrigin: "50% 50%",
          },
          {
            // Stronger shrink — 12% smaller + 24px back so the receding
            // paper visibly drops into the stack behind the rising one.
            scale: 0.88,
            y: -24,
            filter: "brightness(0.82)",
            ease: "power1.inOut",
            scrollTrigger: {
              trigger: next,
              // Start earlier: when the NEXT paper is 10% into the
              // viewport from the bottom. End when fully covering.
              start: "top 95%",
              end: "top 5%",
              scrub: 0.5,
            },
          }
        );
      });

      ScrollTrigger.refresh();
    });

    return () => ctx.revert();
  }, []);

  return null;
}
