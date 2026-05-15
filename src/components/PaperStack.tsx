"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

/**
 * PaperStack — adds an Apple/Linear-style "papers stacking" reveal to every
 * top-level `<section>` (excluding Hero + Story which have their own internal
 * scrub timelines we don't want to compete with).
 *
 * Pattern (research: 2026 cinematic landing-page wiki +
 * `awesome-design-md` Linear/Stripe/Cursor refs):
 *
 *   - As a section's TOP edge approaches the viewport bottom (entry), its
 *     contents rise from below + scale 0.96 → 1.0 + fade 0 → 1, with a
 *     subtle drop-shadow ramp so it reads as a sheet of paper being laid
 *     down on top of the previous one.
 *   - The previous section, while it's still visible above, scales SLIGHTLY
 *     down (1.0 → 0.985) + fades opacity 1 → 0.85 as it leaves, so the eye
 *     reads "the one behind". Equivalent to the Apple AirPods scroll-stack.
 *
 * Why no layout/DOM restructuring:
 *   We deliberately do NOT switch sections to `position: sticky` + z-index
 *   gradient. That would conflict with the FrameSequence pins inside Hero
 *   and Story, AND it would create a jarring "every section is fullscreen"
 *   feel. Instead this is a pure GSAP scroll-bound transform on each
 *   section's inner content, layered on top of the existing flow.
 *
 * Skips Hero (has its own scrub) + Story (has its own scrub) by ID.
 *
 * Honors prefers-reduced-motion: no transforms applied, returns early.
 */
const SKIP_IDS = new Set(["hero", "story"]);

export default function PaperStack() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const ctx = gsap.context(() => {
      const sections = Array.from(document.querySelectorAll("main > section")) as HTMLElement[];

      sections.forEach((section) => {
        if (SKIP_IDS.has(section.id)) return;

        // Wrap the section in a transform layer so we can move it
        // without disrupting layout / pinning.
        // Use the section itself as the trigger; transform its first
        // child wrapper.

        // ENTRY — rise + scale + fade in as section approaches
        gsap.fromTo(
          section,
          {
            y: 80,
            scale: 0.965,
            opacity: 0,
          },
          {
            y: 0,
            scale: 1,
            opacity: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: section,
              start: "top 92%",
              end: "top 55%",
              scrub: 0.6,
              // No pin — pure transform tween. Keeps native scroll feel.
            },
          }
        );

        // EXIT — slight scale-down + fade as section leaves the top
        // so the next paper feels "laid on top" of this one.
        gsap.fromTo(
          section,
          {
            scale: 1,
            opacity: 1,
            filter: "brightness(1)",
          },
          {
            scale: 0.985,
            opacity: 0.7,
            filter: "brightness(0.94)",
            ease: "power1.in",
            scrollTrigger: {
              trigger: section,
              start: "bottom 80%",
              end: "bottom 30%",
              scrub: 0.6,
            },
          }
        );
      });

      // Refresh once on mount to align with the loaded DOM
      ScrollTrigger.refresh();
    });

    return () => ctx.revert();
  }, []);

  return null;
}
