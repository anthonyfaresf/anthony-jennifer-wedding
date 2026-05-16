"use client";

/**
 * VerseOpener — replaces both the paper Envelope gate AND the wine-cheers Hero.
 *
 * The first impression of the site. A Bible verse on a soft full-bleed
 * watercolor backdrop, with Anthony + Jennifer's names, date, and venue
 * below. Scroll commits — no tap-to-open gate, no skeuomorphic letter.
 *
 * Anthony 2026-05-16: "everyone is putting letters which is cliche, we can
 * put a verse from the bible with photo (video animated before) the olives,
 * the wine... 'I have found the one whom my soul loves.' — Song of Solomon
 * 3:4. Anthony & Jennifer 18-07-2026."
 *
 * 4-brain consensus (Codex + Gemini + Claude subagent + main Claude):
 *   A: AGREE — replace envelope (friction-gate kill + cultural specificity)
 *   B: AGREE — STATIC poster as LCP first; lazy-load any video AFTER first
 *      paint (autoplay video on first paint tanks mobile LCP, iOS Safari
 *      needs muted+playsinline, 3MB on Lebanese 4G = 3–6s blank screen)
 *
 * Composition:
 *   - Full-bleed background — frame 01 of hero-wine-cheers as a calm
 *     starting still (the wine glasses pre-cheers). Slow 14s Ken Burns
 *     pan so it feels alive without auto-playing video.
 *   - Dark gradient overlay (top + bottom weighted) + soft vignette →
 *     guarantees cream-text legibility over any watercolor brightness.
 *   - Centered: italic-serif verse + caps attribution
 *   - Below: "Anthony & Jennifer" display caps + gold rule + date + venue
 *   - Bottom: subtle pulsing "scroll" cue
 *
 * Reduced-motion: drops the Ken Burns + entrance timeline. Verse + names
 * are immediately visible.
 */

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

const BP = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function VerseOpener() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const ctx = gsap.context(() => {
      // Entrance reveal — verse first, then names, then date, then cue.
      const tl = gsap.timeline({ delay: 0.35 });
      tl.from(".verse-text", {
        opacity: 0,
        y: 24,
        duration: 1.5,
        ease: "power2.out",
      })
        .from(
          ".verse-attribution",
          { opacity: 0, y: 10, duration: 0.9, ease: "power2.out" },
          "-=0.85"
        )
        .from(
          ".verse-names",
          { opacity: 0, y: 20, duration: 1.1, ease: "power3.out" },
          "-=0.45"
        )
        .from(
          ".verse-rule",
          { width: 0, duration: 0.7, ease: "power2.out" },
          "-=0.7"
        )
        .from(
          ".verse-date",
          { opacity: 0, y: 12, duration: 0.85, ease: "power2.out" },
          "-=0.45"
        )
        .from(
          ".verse-venue",
          { opacity: 0, y: 10, duration: 0.8, ease: "power2.out" },
          "-=0.5"
        )
        .from(
          ".verse-scroll-cue",
          { opacity: 0, y: 8, duration: 0.9, ease: "power2.out" },
          "+=0.5"
        );

      // Slow Ken Burns pan on the background — sells "alive" without video.
      gsap.to(".verse-bg", {
        scale: 1.07,
        duration: 14,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });

      // Scroll-driven exit — verse + names rise + fade as we scroll out.
      gsap.to(".verse-content", {
        y: -60,
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
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
      id="opener"
      aria-label="Welcome — Anthony and Jennifer's wedding"
      className="relative w-full min-h-[100svh] overflow-hidden bg-ink"
    >
      {/* Background poster — frame 30 of hero-wine-cheers: pure wine
          glasses + hands + soft olive-tinged backdrop. Matches Anthony's
          stated vision ("the olives, the wine"). Static for LCP. Ken
          Burns pans it 1.0 → 1.07. Future iteration: swap to a dedicated
          olive-branch close-up or short video loop once that asset exists. */}
      <div
        className="verse-bg absolute inset-0"
        style={{
          backgroundImage: `url("${BP}/frames/hero-wine-cheers/f-30.jpg")`,
          backgroundSize: "cover",
          backgroundPosition: "center 35%",
          willChange: "transform",
        }}
        aria-hidden
      />

      {/* Dark scrim — strong + uniform so cream-on-watercolor reads
          everywhere, not just where the watercolor happens to be dark.
          Pushed dark per visual verification 2026-05-16: previous 0.12
          mid-band was invisible over bright watercolor patches. */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(20,18,14,0.62) 0%, rgba(20,18,14,0.48) 35%, rgba(20,18,14,0.55) 65%, rgba(20,18,14,0.78) 100%)",
        }}
      />
      {/* Center radial — extra darkness behind the verse text */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 30%, rgba(20,18,14,0.5) 0%, rgba(20,18,14,0.2) 50%, transparent 80%)",
        }}
      />
      {/* Lower scrim band — pulls extra darkness behind the names + date
          block. Lives at 55-90% of viewport height so names + date sit on
          a calm dark band regardless of watercolor color underneath
          (the wine glasses are dark red — cream text vanishes without
          this band). */}
      <div
        aria-hidden
        className="absolute inset-x-0 pointer-events-none"
        style={{
          top: "55%",
          height: "45%",
          background:
            "linear-gradient(to bottom, transparent 0%, rgba(20,18,14,0.55) 35%, rgba(20,18,14,0.78) 100%)",
        }}
      />

      {/* Content — verse → attribution → names → rule → date → venue */}
      <div className="verse-content relative z-10 flex flex-col items-center justify-between text-center min-h-[100svh] px-6 pt-14 pb-10 sm:pb-14">
        {/* Top spacer — content gravitates toward center + bottom */}
        <div className="flex-1" />

        {/* THE VERSE */}
        <div className="flex flex-col items-center">
          <p
            className="verse-text italic leading-[1.22] text-cream max-w-[18ch] sm:max-w-[28ch]"
            style={{
              fontFamily: "var(--font-display), 'Cormorant Garamond', serif",
              fontWeight: 300,
              fontSize: "clamp(28px, 5vw, 58px)",
              letterSpacing: "0.005em",
              textShadow: "0 2px 24px rgba(20,18,14,0.55)",
            }}
          >
            &ldquo;I have found the one whom my soul loves.&rdquo;
          </p>
          <p
            className="verse-attribution mt-5 sm:mt-7 text-cream/80 text-[10px] sm:text-xs uppercase"
            style={{
              letterSpacing: "0.5em",
              textShadow: "0 1px 12px rgba(20,18,14,0.55)",
            }}
          >
            Song of Solomon &nbsp;3&thinsp;:&thinsp;4
          </p>
        </div>

        {/* Spacer — pushes names to the lower third */}
        <div className="flex-1" />

        {/* THE COUPLE */}
        <div className="flex flex-col items-center">
          <h1
            className="verse-names font-display text-cream leading-none"
            style={{
              fontSize: "clamp(36px, 7vw, 76px)",
              letterSpacing: "0.015em",
              textShadow: "0 2px 24px rgba(20,18,14,0.55)",
            }}
          >
            Anthony{" "}
            <span
              className="text-gold inline-block align-middle"
              style={{
                fontFamily: "var(--font-italianno), 'Italianno', cursive",
                fontWeight: "normal",
                fontSize: "1.15em",
                lineHeight: 1,
                margin: "0 0.05em",
                transform: "translateY(-0.05em)",
              }}
            >
              &amp;
            </span>{" "}
            Jennifer
          </h1>
          <div
            className="verse-rule h-px bg-gold my-5 sm:my-6"
            style={{ width: 64 }}
          />
          <p
            className="verse-date text-cream/90 text-xs sm:text-sm uppercase"
            style={{
              letterSpacing: "0.5em",
              textShadow: "0 1px 12px rgba(20,18,14,0.55)",
            }}
          >
            18 &middot; 07 &middot; 2026
          </p>
          <p
            className="verse-venue mt-3 text-cream/70 text-[10px] sm:text-xs uppercase"
            style={{
              letterSpacing: "0.4em",
              textShadow: "0 1px 12px rgba(20,18,14,0.55)",
            }}
          >
            Couvent Saint Jean &middot; Okaibe &middot; Lebanon
          </p>
        </div>

        {/* SCROLL CUE — subtle pulse, no CTA button */}
        <div
          className="verse-scroll-cue flex flex-col items-center gap-2.5 mt-8"
          aria-hidden
        >
          <span
            className="text-cream/60 text-[9px] uppercase"
            style={{
              letterSpacing: "0.55em",
              textShadow: "0 1px 12px rgba(20,18,14,0.6)",
            }}
          >
            scroll
          </span>
          <div
            className="verse-scroll-line w-px h-12 bg-cream/40 origin-top"
            style={{ animation: "verse-scroll-pulse 2.4s ease-in-out infinite" }}
          />
        </div>
      </div>

      <style>{`
        @keyframes verse-scroll-pulse {
          0%, 100% { opacity: 0.4; transform: scaleY(1); }
          50% { opacity: 0.85; transform: scaleY(0.55); }
        }
        @media (prefers-reduced-motion: reduce) {
          .verse-bg { transform: none !important; }
          .verse-scroll-line { animation: none !important; }
        }
      `}</style>
    </section>
  );
}
