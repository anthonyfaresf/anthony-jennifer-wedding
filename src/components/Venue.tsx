"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FrameSequence } from "./FrameSequence";
import CalendarMark from "./CalendarMark";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

/**
 * Venue — Couvent Saint Jean section.
 *
 * Composition (per Anthony 2026-05-02 + Gemini-Pro architecture review):
 *   - Animated watercolor establishing shot of the venue at top, full-bleed
 *     cinematic 16:9 — NOT an underpainting, the visual centerpiece.
 *     31-frame canvas sequence scrubbed by the section's scroll.
 *   - Address + arrival details + map below, on cream paper.
 *
 * Why hero strip instead of underpainting (the prior approach):
 *   Scroll-scrubbed canvas underneath text creates visual conflict — the
 *   eye can't decide between motion and copy. Lifting the animation above
 *   the text band gives it a proper cinematic moment, then the text reads
 *   cleanly on plain cream paper.
 */
type VenueProps = { slice?: "hero" | "details" };

export default function Venue({ slice }: VenueProps = {}) {
  const showHero = !slice || slice === "hero";
  const showDetails = !slice || slice === "details";
  const sectionRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title overlay reveal — fires when the venue HERO strip enters view
      // (not the address grid below, which has its own animation).
      gsap.from(".venue-title-card", {
        y: 24,
        opacity: 0,
        scale: 0.96,
        duration: 1.0,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".venue-hero",
          start: "top 70%",
          toggleActions: "play none none reverse",
        },
      });

      // Address-grid stagger reveal
      gsap.from(".venue-reveal", {
        y: 30,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".venue-content",
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
      });

      // Subtle Ken Burns on the venue hero strip — slow 1.0 → 1.04 over its
      // own scroll range. Pure CSS transform on the wrapper, not the canvas
      // (avoids canvas-pixel resize churn). Pairs with the source
      // animation's slight push-in for a layered cinematic feel.
      gsap.fromTo(
        ".venue-hero-wrap",
        { scale: 1.0 },
        {
          scale: 1.04,
          ease: "none",
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.2,
          },
        }
      );
    }, sectionRef);
    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, []);

  /**
   * `slice` prop — Venue is split into TWO paper-slots so the user
   * doesn't get the 100+vh of "stuck" scroll seen in Anthony's
   * 2026-05-16 audit (the slot was 200vh tall + sticky-pinned, which
   * means the user scrolled ~100vh seeing the same hero before the
   * calendar/address even came into view).
   *
   *   <Venue slice="hero" />     — just the Couvent watercolor (photo slot)
   *   <Venue slice="details" /> — calendar band + address grid + map (white slot)
   *   <Venue />                  — full layout (backwards-compatible)
   */
  return (
    <section
      ref={sectionRef}
      id={slice === "hero" ? "venue" : slice === "details" ? "venue-details" : "venue"}
      className="relative overflow-hidden bg-cream paper-grain"
    >
      {showHero && (<>
      {/* === HERO STRIP — animated watercolor of Couvent Saint Jean ===
          Full-width cinematic full-screen establishing shot, scroll-scrubbed. */}
      <div
        ref={heroRef}
        className="venue-hero relative w-full overflow-hidden bg-cream cream-fade-edges-light h-[100svh]"
      >
        <div className="venue-hero-wrap absolute inset-0">
          <FrameSequence
            scene="venue-animated"
            frameCount={31}
            triggerSelector=".venue-hero"
            className="venue-frame absolute inset-0 w-full h-full"
            framing="object-center"
          />
        </div>

        {/* Soft cream cloud at the very corners so the watercolor bleeds
            into the paper instead of cutting hard against it. */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none z-20"
          style={{
            background:
              "radial-gradient(ellipse 120% 130% at center, transparent 60%, rgba(244,236,224,0.4) 88%, var(--cream) 100%)",
          }}
        />

        {/* Bottom scrim — soft dark wash behind the venue title for stable
            contrast across watercolor brightness variations (per 2026-05-15
            contrast pass). */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 pointer-events-none z-25"
          style={{
            height: "45%",
            background:
              "linear-gradient(to top, rgba(20,18,14,0.55) 0%, rgba(20,18,14,0.30) 40%, rgba(20,18,14,0.10) 75%, transparent 100%)",
          }}
        />

        {/* Title overlay — no card, text floats over the watercolor with
            mix-blend-multiply (the olive numerals darken whatever they sit
            over without competing for color, the way they did before). */}
        {/* Title overlay — cream text on watercolor with strong text-shadow
            for stable legibility (replaces the mix-blend-multiply approach
            which read unpredictably across watercolor light/dark patches). */}
        {/* Title — no box. Per Anthony 2026-05-16: "remove the box or
            change the color because the contrast is not visible."
            Cream-on-watercolor with strong text-shadow + a dedicated
            bottom dark-gradient scrim does the work. Box gone. */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 pointer-events-none z-20"
          style={{
            height: "65%",
            background:
              "linear-gradient(to top, rgba(20,18,14,0.92) 0%, rgba(20,18,14,0.85) 15%, rgba(20,18,14,0.6) 40%, rgba(20,18,14,0.25) 70%, transparent 100%)",
          }}
        />
        {/* Pure white + heavy stacked text-shadow halo. Lifted higher
            (bottom-32 mobile) so it sits in the densest part of the
            bottom gradient. Per Anthony 2026-05-16: no box, contrast
            still needs to read clearly. */}
        <div className="absolute bottom-28 sm:bottom-32 left-0 right-0 px-6 text-center pointer-events-none z-30">
          <p
            className="text-[11px] sm:text-xs uppercase tracking-[0.5em] mb-3"
            style={{
              color: "#ffffff",
              textShadow:
                "0 0 18px rgba(0,0,0,0.95), 0 3px 18px rgba(0,0,0,0.9)",
            }}
          >
            Where
          </p>
          <h2
            className="leading-none"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(40px, 6vw, 88px)",
              letterSpacing: "0.015em",
              color: "#ffffff",
              textShadow:
                "0 0 28px rgba(0,0,0,0.98), 0 0 14px rgba(0,0,0,0.95), 0 4px 22px rgba(0,0,0,0.9), 0 2px 8px rgba(0,0,0,0.7)",
            }}
          >
            Couvent Saint Jean
          </h2>
          <div
            className="w-12 h-px mx-auto my-4"
            style={{
              background: "#d4b87a",
              boxShadow: "0 0 12px rgba(0,0,0,0.55)",
            }}
          />
          <p
            className="italic"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(16px, 1.7vw, 22px)",
              color: "#ffffff",
              textShadow:
                "0 0 16px rgba(0,0,0,0.95), 0 2px 14px rgba(0,0,0,0.9)",
            }}
          >
            Okaibe · Lebanon
          </p>
        </div>
      </div>
      </>)}

      {showDetails && (<>
      {/* Slot fills exactly 100svh so the sticky paper-stack pin shows ALL
          content during its lock (per Anthony 2026-05-17: "you only see it
          when scrolling but you dont get to see the page"). Mobile is the
          binding constraint — 664px iPhone viewport. Calendar + address +
          map fit by aggressively compacting padding + dropping the [TBD]
          arrival block (placeholder copy; will be restored when times are
          locked). Desktop gets restored breathing room via sm: breakpoints. */}
      <div className="venue-details-fill min-h-[100svh] flex flex-col justify-center px-6 py-8 sm:py-16 relative z-10">
        <div className="max-w-5xl mx-auto w-full">
          {/* Calendar — desktop only. On mobile it pushes the address+map
              out of the sticky pin window; the date is already shown on
              the Gate, Hero card, and Countdown so removing it from
              mobile loses nothing. */}
          <div className="venue-calendar-band hidden sm:block pb-12">
            <CalendarMark />
          </div>

          <div className="grid md:grid-cols-2 gap-6 sm:gap-12 items-center">
            <div className="venue-reveal space-y-4 sm:space-y-8">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-olive-deep mb-2">
                  Address
                </p>
                <p className="text-body leading-relaxed">
                  Couvent Saint Jean
                  <br />
                  Okaibe, Mont Liban
                  <br />
                  Lebanon
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <a
                  href="https://maps.google.com/?q=Couvent+Saint+Jean+Okaibe+Lebanon"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-xs uppercase tracking-[0.3em] text-olive-deep hover:text-olive border border-olive-deep/30 hover:border-olive px-5 py-3 transition-colors"
                >
                  Open in Maps
                </a>
                <a
                  href="https://maps.google.com/?daddr=Couvent+Saint+Jean+Okaibe+Lebanon"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-xs uppercase tracking-[0.3em] text-cream bg-olive-deep hover:bg-olive px-5 py-3 transition-colors"
                >
                  Get directions
                </a>
              </div>
            </div>

            {/* Map — mobile 16:9 so the whole pin window stays in viewport.
                Desktop 4/5 portrait for the editorial column feel. */}
            <div className="venue-reveal aspect-[16/9] md:aspect-[4/5] bg-parchment rounded-sm overflow-hidden border border-ink/10">
              <iframe
                src="https://www.google.com/maps?q=Okaibe,+Lebanon&output=embed"
                className="w-full h-full grayscale"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Couvent Saint Jean Okaibe map"
              />
            </div>
          </div>
        </div>
      </div>
      </>)}
    </section>
  );
}
