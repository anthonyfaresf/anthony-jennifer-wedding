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
export default function Venue() {
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

  return (
    <section
      ref={sectionRef}
      id="venue"
      className="relative overflow-hidden bg-cream paper-grain"
    >
      {/* === HERO STRIP — animated watercolor of Couvent Saint Jean ===
          Full-width cinematic 16:9 establishing shot, scroll-scrubbed. The
          cream-fade-edges-light gives soft top + bottom transitions into
          the surrounding paper. */}
      <div
        ref={heroRef}
        className="venue-hero relative w-full overflow-hidden bg-cream cream-fade-edges-light"
        style={{ aspectRatio: "16 / 9" }}
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

        {/* Title overlay — no card, text floats over the watercolor with
            mix-blend-multiply (the olive numerals darken whatever they sit
            over without competing for color, the way they did before). */}
        <div className="absolute bottom-8 sm:bottom-12 left-0 right-0 px-6 text-center pointer-events-none z-30 mix-blend-multiply">
          <div className="venue-title-card inline-block">
            <p
              className="text-[10px] sm:text-xs uppercase tracking-[0.5em] mb-3"
              style={{ color: "var(--display)", opacity: 0.85 }}
            >
              Where
            </p>
            <h2
              className="leading-none"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(40px, 6vw, 88px)",
                color: "var(--display)",
                letterSpacing: "0.01em",
              }}
            >
              Couvent Saint Jean
            </h2>
            <div className="w-10 h-px bg-gold/50 mx-auto my-3" />
            <p
              className="italic"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(16px, 1.6vw, 22px)",
                color: "var(--display)",
                opacity: 0.78,
              }}
            >
              Okaibe · Lebanon
            </p>
          </div>
        </div>
      </div>

      {/* === CALENDAR MARK — small July 2026 grid, day 18 ringed in gold ===
          Per SYNTHESIS-v3 TIER 1 #2 (yallamabrook ref). Sits between the
          watercolor hero strip and the address grid, on its own breathing
          band so it reads as a physical save-the-date detail. */}
      <div className="venue-calendar-band py-16 sm:py-20 px-6 relative z-10">
        <CalendarMark />
      </div>

      {/* === ADDRESS / ARRIVAL / MAP === */}
      <div className="venue-content pb-24 sm:pb-32 px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div className="venue-reveal space-y-8">
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
                <p className="text-xs text-body/60 mt-2 italic">
                  Full address + Google Maps pin arriving soon
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-olive-deep mb-2">
                  Arrival
                </p>
                <p className="text-body leading-relaxed">
                  Ceremony begins at [time TBD]. We recommend arriving 20
                  minutes early. Parking is available on-site.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
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

            {/* Map */}
            <div className="venue-reveal aspect-square md:aspect-[4/5] bg-parchment rounded-sm overflow-hidden border border-ink/10">
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
    </section>
  );
}
