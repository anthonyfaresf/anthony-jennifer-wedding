"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FrameSequence } from "./FrameSequence";
import { useMediaQuery } from "@/lib/useMediaQuery";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

/**
 * Story — 3-scene VERTICAL-SCROLL timeline (Meeting → Promise → Wedding).
 *
 * (Reverted to vertical per Anthony 2026-05-02 — horizontal didn't feel right.)
 *
 * Architecture:
 *   - Each scene = 200vh outer with a 100svh sticky inner. FrameSequence
 *     scrubs its 31 frames over the pin range as the user scrolls.
 *   - Mobile pulls vertical 9:16 source from /frames/scene-N-name/.
 *   - Desktop pulls horizontal 16:9 source from /frames/scene-N-name-h/.
 *   - Phase divider sections ("Three years pass" / "And the day arrives")
 *     sit between scenes as 40vh cream-paper breathers.
 *
 * Cinematic motion (per Anthony 2026-05-02 "make it cinematic"):
 *   - Caption pill = `glass-card-strong` with character-reveal stagger on
 *     title + body (left-to-right, 0.04s stagger, power3.out)
 *   - Year marker rises from y:32 + opacity 0 over scene entry, with a
 *     subtle mask-clip from bottom that lets it appear like ink staining
 *     onto the paper
 *   - Frame canvas = scrubbed cream-fade in/out + Ken Burns counter-zoom
 *     (existing, kept)
 *   - Phase divider = gold rule grow from 0 → 48px width as it scrolls in,
 *     italic text fades up below
 */

const scenes = [
  {
    n: "01",
    title: "The Meeting",
    year: "2019",
    body: "[A German garden bar in Lebanon. The crowd, the string lights, the specific thing she said when I walked over.]",
    sceneFolder: "scene-01-meeting",
  },
  {
    n: "02",
    title: "The Promise",
    year: "2022",
    body: "[Three years on. Positano, the Amalfi cliff, the moment she said yes.]",
    sceneFolder: "scene-02-promise",
  },
  {
    n: "03",
    title: "The Wedding",
    year: "2026",
    body: "[Today. Couvent Saint Jean. Everything that came before brought us here.]",
    sceneFolder: "scene-03-wedding",
  },
];

/**
 * Phase divider — thin breather between year-groups.
 * Gold rule grows from 0 → 48px as the divider scrolls into view, italic
 * text fades up underneath.
 */
function PhaseDivider({ text }: { text: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduceMotion) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });
      tl.fromTo(
        ".divider-rule",
        { width: 0 },
        { width: 48, ease: "power3.out", duration: 0.8 }
      )
        .fromTo(
          ".divider-text",
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, ease: "power2.out", duration: 0.7 },
          "-=0.4"
        );
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={ref}
      className="phase-divider relative h-[40vh] flex items-center justify-center bg-cream paper-grain z-0"
      role="separator"
      aria-label={text}
    >
      <div className="text-center px-6">
        <div className="divider-rule h-px bg-gold/50 mx-auto mb-3" style={{ width: 0 }} />
        <p
          className="divider-text text-[10px] uppercase tracking-[0.5em] text-olive-deep/65"
          style={{ fontStyle: "italic", opacity: 0 }}
        >
          {text}
        </p>
        <div className="divider-rule h-px bg-gold/50 mx-auto mt-3" style={{ width: 0 }} />
      </div>
    </div>
  );
}

export default function Story() {
  const sectionRef = useRef<HTMLElement>(null);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Caption character-reveal + frame fade-in/out + Ken Burns + year-marker
  // breathe. Gated on `mounted` so the FrameSequence canvas exists before
  // GSAP binds (per Codex GPT-5.4 review 2026-05-02).
  useEffect(() => {
    if (!mounted) return;
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const ctx = gsap.context(() => {
      scenes.forEach((_, i) => {
        const sceneEl = document.querySelector<HTMLElement>(`.scene-${i}`);
        if (!sceneEl) return;

        // Caption pill enters with scale + fade, then characters in title +
        // body reveal letter by letter. Per Anthony 2026-05-15: animations
        // need to play BOTH directions (forward on scroll down INTO scene,
        // reverse on scroll up OUT). "play reverse play reverse" matches
        // the year-marker pattern that already works.
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sceneEl,
            start: "top 60%",
            end: "bottom 40%",
            toggleActions: "play reverse play reverse",
          },
        });
        tl.fromTo(
          `.scene-${i} .scene-caption-card`,
          { y: 28, opacity: 0, scale: 0.97 },
          { y: 0, opacity: 1, scale: 1, ease: "power3.out", duration: 0.85 }
        )
          .fromTo(
            `.scene-${i} .caption-char`,
            { y: 14, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              ease: "power3.out",
              duration: 0.6,
              stagger: 0.018,
            },
            "-=0.5"
          );

        // Cream-fade transition — image sequence fades in/out at scene boundaries
        gsap
          .timeline({
            scrollTrigger: {
              trigger: sceneEl,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.5,
            },
          })
          .fromTo(
            `.scene-${i} .scene-frame`,
            { opacity: 0, filter: "blur(8px)" },
            { opacity: 1, filter: "blur(0px)", ease: "none", duration: 0.18 }
          )
          .to(`.scene-${i} .scene-frame`, {
            opacity: 1,
            filter: "blur(0px)",
            ease: "none",
            duration: 0.64,
          })
          .to(`.scene-${i} .scene-frame`, {
            opacity: 0,
            filter: "blur(6px)",
            ease: "none",
            duration: 0.18,
          });

        // Ken Burns counter-zoom — watercolor breathes outward 1.04 → 1.0
        // as scene plays. Pure CSS transform on the wrapper.
        gsap.fromTo(
          `.scene-${i} .scene-frame-wrap`,
          { scale: 1.04 },
          {
            scale: 1.0,
            ease: "none",
            scrollTrigger: {
              trigger: sceneEl,
              start: "top top",
              end: "bottom bottom",
              scrub: 1,
            },
          }
        );

        // Year marker rises with mask-reveal (clip-path from bottom up).
        gsap.fromTo(
          `.scene-${i} .year-marker`,
          {
            opacity: 0,
            y: 38,
            clipPath: "inset(100% 0 0 0)",
          },
          {
            opacity: 0.45,
            y: 0,
            clipPath: "inset(0% 0 0 0)",
            ease: "power3.out",
            duration: 1.2,
            scrollTrigger: {
              trigger: sceneEl,
              start: "top 70%",
              end: "bottom 30%",
              toggleActions: "play reverse play reverse",
            },
          }
        );
      });
    }, sectionRef);

    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [mounted]);

  /**
   * Split a string into character spans for letter-by-letter reveal.
   * Spaces preserved as zero-width spans that still take width.
   */
  const splitChars = (text: string, baseClass = "caption-char") =>
    Array.from(text).map((char, i) => (
      <span
        key={i}
        className={`${baseClass} inline-block`}
        style={{ whiteSpace: char === " " ? "pre" : undefined }}
      >
        {char}
      </span>
    ));

  return (
    <section
      ref={sectionRef}
      id="story"
      className="relative bg-cream paper-grain"
    >
      {/* Intro — unpinned, on cream paper */}
      <div className="py-32 px-6 text-center relative z-10">
        <p className="text-xs uppercase tracking-[0.4em] text-olive-deep mb-4">
          Our story
        </p>
        <h2 className="font-display text-5xl md:text-6xl text-ink">
          How we got here
        </h2>
        <div className="w-16 h-px bg-gold mx-auto mt-8" />
        <p className="text-xs uppercase tracking-[0.3em] text-olive-deep/80 mt-12">
          Scroll to begin
        </p>
        <p className="text-sm text-olive-deep/70 mt-2" aria-hidden>↓</p>
      </div>

      {/* === 3-SCENE VERTICAL TIMELINE === */}
      <div className="story-scenes relative">
        {scenes.map((s, i) => (
          <Fragment key={s.n}>
            {i === 1 && <PhaseDivider text="Three years pass" />}
            {i === 2 && <PhaseDivider text="And the day arrives" />}

            <div
              className={`scene-${i} relative w-full`}
              style={{ height: "200vh" }}
            >
              <div className="cream-fade-edges-light sticky top-0 h-[100svh] supports-[height:100dvh]:h-[100dvh] w-full overflow-hidden bg-cream">
                {/* Full-bleed canvas — vertical 9:16 on mobile, horizontal
                    16:9 on desktop. FrameSequence default vertical scrub. */}
                <div className="scene-frame-wrap absolute inset-0">
                  {mounted && (
                    <FrameSequence
                      scene={isDesktop ? `${s.sceneFolder}-h` : s.sceneFolder}
                      frameCount={31}
                      triggerSelector={`.scene-${i}`}
                      className="scene-frame absolute inset-0 w-full h-full"
                    />
                  )}
                </div>

                {/* Year marker overlaid on the watercolor */}
                <div
                  aria-hidden
                  className="year-marker absolute z-10 pointer-events-none mix-blend-multiply select-none"
                  style={{
                    left: "max(4vw, 24px)",
                    bottom: "max(22vh, 180px)",
                    opacity: 0,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "clamp(72px, 11vw, 200px)",
                      lineHeight: "0.85",
                      color: "var(--olive-deep)",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {s.year}
                  </span>
                </div>

                {/* === CAPTION SCRIM — soft darkening gradient behind the
                    caption text so cream text is readable on bright watercolor
                    patches (fixes contrast issue Anthony flagged 2026-05-15).
                    Sits below the text z-30, above the watercolor frame. */}
                <div
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 pointer-events-none z-20"
                  style={{
                    height: "55%",
                    background:
                      "linear-gradient(to top, rgba(20,18,14,0.65) 0%, rgba(20,18,14,0.45) 30%, rgba(20,18,14,0.15) 70%, transparent 100%)",
                  }}
                />

                {/* === CAPTION — no card, text floats over the watercolor +
                    sits above the scrim. Strong text-shadow + scrim = legible
                    on every watercolor patch. */}
                {/* Caption block — wrapped in a soft cream-blur scrim so
                    olive/cream text always lands on a dark patch regardless
                    of which watercolor frame the scrub is showing. Backdrop-
                    filter blurs the watercolor underneath; the dark gradient
                    layer guarantees minimum contrast for text-shadow + cream
                    text. Installed 2026-05-15 contrast pass. */}
                <div className="scene-caption absolute bottom-8 sm:bottom-12 left-0 right-0 px-6 text-center pointer-events-none z-30">
                  <div
                    className="scene-caption-card inline-block max-w-md sm:max-w-lg px-6 py-5 sm:px-8 sm:py-6 rounded-sm"
                    style={{
                      background:
                        "radial-gradient(ellipse 75% 100% at center, rgba(20,18,14,0.42) 0%, rgba(20,18,14,0.28) 55%, rgba(20,18,14,0) 100%)",
                      backdropFilter: "blur(2px)",
                      WebkitBackdropFilter: "blur(2px)",
                    }}
                  >
                    <p
                      className="font-display text-5xl sm:text-6xl text-gold leading-none mb-2"
                      style={{ textShadow: "0 4px 22px rgba(0,0,0,0.65)" }}
                    >
                      <span className="caption-char inline-block">{s.n}</span>
                    </p>
                    <p
                      className="text-[10px] sm:text-xs uppercase tracking-[0.4em] text-cream mb-3"
                      style={{ textShadow: "0 2px 12px rgba(0,0,0,0.75)" }}
                    >
                      {splitChars(`${s.title} · ${s.year}`)}
                    </p>
                    <div
                      className="w-10 h-px bg-gold/70 mx-auto mb-3"
                      style={{ boxShadow: "0 0 8px rgba(0,0,0,0.45)" }}
                    />
                    <p
                      className="text-cream text-xs sm:text-sm leading-relaxed max-w-sm sm:max-w-md mx-auto"
                      style={{ textShadow: "0 2px 14px rgba(0,0,0,0.8)" }}
                    >
                      {splitChars(s.body)}
                    </p>
                  </div>
                </div>

                {/* Scene index — text only, top-right */}
                <div
                  className="absolute top-6 right-6 text-[11px] uppercase tracking-[0.3em] text-cream z-30"
                  style={{ textShadow: "0 2px 10px rgba(0,0,0,0.7), 0 0 4px rgba(0,0,0,0.4)" }}
                >
                  {s.n} / 03
                </div>
              </div>
            </div>
          </Fragment>
        ))}

        {/*
          Closing phase divider — matches the rhythm of the two
          inter-scene dividers ("Three years pass" before scene 2,
          "And the day arrives" before scene 3). Without this, scene 3
          ended abruptly into the paper stack. Per Anthony 2026-05-15:
          "the space between the wedding slide and the church is super
          close, they should have the same spacing like the rest".
        */}
        <PhaseDivider text="The day is near" />
      </div>
    </section>
  );
}
