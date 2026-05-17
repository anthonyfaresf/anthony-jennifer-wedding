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

// Per Anthony 2026-05-16 + 4-brain UNANIMOUS: "Our Story" backstory
// killed. Each scene now carries a chapter of the wedding day itself
// (ceremony → reception → dress/travel) — useful logistics, not
// relationship history. Watercolors stay; only the copy + section
// labels change.
// Schedule overlay shown on Scene 0 (Ceremony) — replaces the old standalone
// Schedule section per Anthony 2026-05-17 ("the schedule should be on the
// photo of the ceremony, not a separate section"). Single source of truth
// for times — every other place on the site that references times reads
// from here. Structure mirrors the old Schedule component's vertical-rail
// pattern (gold line + dots + time/label/note) so the timeline still reads
// as a timeline, just compactly overlaid on the photo.
// Per Anthony 2026-05-17 — keep just time + label, drop notes (no chapel /
// garden terrace / until late suffixes).
const schedule = [
  { time: "18:00", label: "Ceremony" },
  { time: "19:00", label: "Welcome Drink" },
  { time: "20:00", label: "Dinner & Party" },
];

// Scene→frame mapping rotated per Anthony 2026-05-17 v18 (all 3 scenes
// now animated; static Positano photo retired from UI):
//   The Day            → scene-02-promise frames (was the reception watercolor)
//   The Reception      → scene-03-wedding frames (was the wedding watercolor)
//   Celebrate with us  → scene-01-meeting frames (the original meeting/reception watercolor)
const scenes = [
  {
    n: "01",
    title: "The Day",
    year: "",
    body: "",
    sceneFolder: "scene-02-promise",
  },
  {
    n: "02",
    title: "The Reception",
    year: "20:00",
    body: "Welcome drink on the convent terrace at golden hour, dinner and party under the stars.",
    sceneFolder: "scene-03-wedding",
  },
  {
    n: "03",
    title: "Celebrate with us",
    year: "",
    body: "We can't wait to celebrate this day with you.",
    sceneFolder: "scene-01-meeting",
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

/**
 * Optional `only` prop — slices the component into renderable pieces so
 * info cards (Countdown / Venue / Schedule / RSVP / FAQ) can be stacked
 * BETWEEN scenes per Anthony 2026-05-16 ("instead of all story up front
 * and all info at the end, a card stacks on top of each photo").
 *
 *   <Story />              — backwards-compatible: full intro + all 3 scenes
 *   <Story only="intro" /> — just the intro block
 *   <Story only={0} />     — just scene 0 (Meeting)
 *   <Story only={1} />     — just scene 1 (Promise)
 *   <Story only={2} />     — just scene 2 (Wedding)
 *
 * GSAP useEffect queries `.scene-${i}` selectors, so it naturally only
 * binds to whichever scene is rendered.
 */
type StoryProps = { only?: number | "intro" };

export default function Story({ only }: StoryProps = {}) {
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

  // `only` slicing helpers
  const showIntro = only === undefined || only === "intro";
  const showScenes = only !== "intro";
  const showScene = (i: number) => only === undefined || only === i;
  // When sliced (only is a number), suppress narrative dividers — the
  // info card stacked after the scene serves as the breather.
  const showDividers = only === undefined;
  const sectionId =
    only === undefined
      ? "story"
      : only === "intro"
      ? "story-intro"
      : `story-scene-${only}`;

  return (
    <section
      ref={sectionRef}
      id={sectionId}
      className="relative bg-cream paper-grain"
    >
      {/* Intro — unpinned, on cream paper. Per Anthony 2026-05-16:
          "forget our story." Replaced with the wedding-day chapter
          header. */}
      {showIntro && (
        <div className="py-32 px-6 text-center relative z-10">
          <p className="text-xs uppercase tracking-[0.4em] text-olive-deep mb-4">
            The day
          </p>
          <h2 className="font-display text-5xl md:text-6xl text-ink">
            What to expect
          </h2>
          <div className="w-16 h-px bg-gold mx-auto mt-8" />
        </div>
      )}

      {/* === SCENES — full set (3) when un-sliced, single scene when only={n} === */}
      {showScenes && (
      <div className="story-scenes relative">
        {scenes.map((s, i) => (
          !showScene(i) ? null : (
          <Fragment key={s.n}>
            {i === 1 && showDividers && <PhaseDivider text="Three years pass" />}
            {i === 2 && showDividers && <PhaseDivider text="And the day arrives" />}

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

                {/* Year marker — only renders when scene has a year value */}
                {s.year && (
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
                )}

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
                    {/* Scene number "01 / 02 / 03" removed per Anthony
                        2026-05-16 (third pass) — caption now leads with
                        the chapter title + time directly. */}
                    <p
                      className="font-display text-cream leading-none mb-3"
                      style={{
                        fontSize: "clamp(28px, 4vw, 44px)",
                        letterSpacing: "0.02em",
                        textShadow: "0 4px 22px rgba(0,0,0,0.75)",
                      }}
                    >
                      {splitChars(s.title)}
                    </p>
                    {s.year && (
                      <p
                        className="text-[10px] sm:text-xs uppercase tracking-[0.4em] text-cream/85 mb-3"
                        style={{ textShadow: "0 2px 12px rgba(0,0,0,0.75)" }}
                      >
                        {splitChars(s.year)}
                      </p>
                    )}
                    <div
                      className="w-10 h-px bg-gold/70 mx-auto mb-3"
                      style={{ boxShadow: "0 0 8px rgba(0,0,0,0.45)" }}
                    />
                    {i === 0 ? (
                      /* Schedule overlay on the Ceremony scene per Anthony
                         2026-05-17 — vertical-rail timeline (gold hairline
                         + dots) matching the old standalone Schedule's
                         shape, just compactly overlaid on the photo. */
                      <ol
                        className="schedule-rail relative inline-block text-left pl-7 sm:pl-9"
                        style={{ textShadow: "0 2px 14px rgba(0,0,0,0.8)" }}
                      >
                        {/* Gold vertical hairline rail */}
                        <span
                          aria-hidden
                          className="absolute left-[10px] sm:left-[13px] top-2 bottom-2 w-px"
                          style={{
                            background:
                              "linear-gradient(to bottom, transparent 0%, var(--gold) 18%, var(--gold) 82%, transparent 100%)",
                            opacity: 0.7,
                            boxShadow: "0 0 8px rgba(0,0,0,0.5)",
                          }}
                        />
                        {schedule.map((row, ri) => (
                          <li
                            key={ri}
                            className="relative py-1.5 sm:py-2 flex items-baseline gap-2 sm:gap-3"
                          >
                            {/* Disc on the rail */}
                            <span
                              aria-hidden
                              className="absolute top-1/2 -translate-y-1/2 rounded-full"
                              style={{
                                left: "-26px",
                                width: 9,
                                height: 9,
                                background: "rgba(0,0,0,0.45)",
                                border: "1.5px solid var(--gold)",
                                boxShadow:
                                  "0 0 0 3px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.55)",
                              }}
                            />
                            <span className="text-gold text-sm sm:text-base tabular-nums tracking-wide">
                              {row.time}
                            </span>
                            <span className="text-cream text-xs sm:text-sm leading-tight">
                              {row.label}
                            </span>
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <p
                        className="text-cream text-xs sm:text-sm leading-relaxed max-w-sm sm:max-w-md mx-auto"
                        style={{ textShadow: "0 2px 14px rgba(0,0,0,0.8)" }}
                      >
                        {splitChars(s.body)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Scene numbering removed per Anthony 2026-05-16. */}
              </div>
            </div>
          </Fragment>
          )
        ))}

        {/*
          Closing phase divider — only renders for the full un-sliced
          Story. When sliced (only={n}), the info card stacked after the
          scene serves as the breather.
        */}
        {showDividers && <PhaseDivider text="The day is near" />}
      </div>
      )}
    </section>
  );
}
