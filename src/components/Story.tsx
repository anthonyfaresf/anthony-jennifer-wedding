"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FrameSequence } from "./FrameSequence";

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

const scenes = [
  {
    n: "01",
    title: "The Meeting",
    year: "2019",
    body: "[A German garden bar in Lebanon. The crowd, the string lights, the specific thing she said when I walked over.]",
    sceneFolder: "scene-01-meeting",
    framing: "object-center",
  },
  {
    n: "02",
    title: "The Date",
    year: "2019",
    body: "[A week later. Where we went. The detail I still remember.]",
    sceneFolder: "scene-02-date",
    framing: "object-center",
  },
  {
    n: "03",
    title: "The Distance",
    year: "2019",
    body: "[I flew back to France the next day. A month of texts. The plan to come back.]",
    sceneFolder: "scene-03-distance",
    framing: "object-center md:object-top",
  },
  {
    n: "04",
    title: "The Return",
    year: "2019",
    body: "[A month later. We never parted again.]",
    sceneFolder: "scene-04-return",
    framing: "object-center",
  },
  {
    n: "05",
    title: "The Promise",
    year: "2022",
    body: "[Three years on. Positano, the Amalfi cliff, the moment she said yes.]",
    sceneFolder: "scene-05-promise",
    framing: "object-center md:object-bottom",
  },
  {
    n: "06",
    title: "The Wedding",
    year: "2026",
    body: "[Today. Couvent Saint Jean. Everything that came before brought us here.]",
    sceneFolder: "scene-06-wedding",
    framing: "object-center",
  },
];

export default function Story() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const planeRef = useRef<HTMLImageElement>(null);
  const lemonTLRef = useRef<HTMLImageElement>(null);
  const lemonBRRef = useRef<HTMLImageElement>(null);
  const lemonTRRef = useRef<HTMLImageElement>(null);
  const lemonBLRef = useRef<HTMLImageElement>(null);
  void lemonTLRef; void lemonBRRef; void lemonTRRef; void lemonBLRef; void planeRef; // unused — overlay layer removed

  // Caption fade-in + scene cream-fade-transition.
  // (FrameSequence handles the scroll-scrubbed image swap itself.)
  useEffect(() => {
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const ctx = gsap.context(() => {
      scenes.forEach((_, i) => {
        const sceneEl = document.querySelector<HTMLElement>(`.scene-${i}`);
        if (!sceneEl) return;

        // Caption appears at 50% scroll-into-view
        gsap.fromTo(
          `.scene-${i} .scene-caption`,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            ease: "power2.out",
            duration: 0.7,
            scrollTrigger: {
              trigger: sceneEl,
              start: "top 50%",
              toggleActions: "play none none reverse",
            },
          }
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
            { opacity: 0 },
            { opacity: 1, ease: "none", duration: 0.18 }
          )
          .to(`.scene-${i} .scene-frame`, { opacity: 1, ease: "none", duration: 0.64 })
          .to(`.scene-${i} .scene-frame`, { opacity: 0, ease: "none", duration: 0.18 });
      });
    }, sectionRef);

    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, []);

  // (Lemon corners + paper plane overlay removed per Anthony 2026-05-02 —
  // they were competing with the videos. Cleaner without.)

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
        <p className="text-xs uppercase tracking-[0.3em] text-olive-deep/60 mt-12">
          Scroll to begin
        </p>
        <p className="text-xs text-olive-deep/40 mt-2">↓</p>
      </div>

      {/* Each scene = full viewport pinned · cream paper continuous · video as
          a 9:16 portrait card centered on the page · caption below */}
      {scenes.map((s, i) => (
        <div
          key={s.n}
          className={`scene-${i} relative w-full`}
          style={{ height: "200vh" }}
        >
          <div className="sticky top-0 h-[100svh] supports-[height:100dvh]:h-[100dvh] w-full overflow-hidden bg-cream">
            {/* Full-bleed image sequence — 31 frames per scene, scroll-scrubbed.
                Bulletproof on iOS Safari (which can't reliably scrub <video>). */}
            <FrameSequence
              scene={s.sceneFolder}
              frameCount={31}
              triggerSelector={`.scene-${i}`}
              className="scene-frame absolute inset-0 w-full h-full object-cover"
              framing={s.framing}
            />

            {/* Caption card — overlaid bottom-center on the video */}
            <div className="scene-caption absolute bottom-8 sm:bottom-12 left-0 right-0 px-6 text-center pointer-events-none z-20">
              <div className="inline-block bg-cream/95 backdrop-blur-sm px-7 py-5 sm:px-9 sm:py-6 rounded-sm border border-ink/5 shadow-[0_24px_48px_-20px_rgba(42,37,32,0.45)]">
                <p className="font-display text-5xl sm:text-6xl text-gold leading-none mb-2">
                  {s.n}
                </p>
                <p className="text-[10px] sm:text-xs uppercase tracking-[0.4em] text-olive-deep mb-3">
                  {s.title} · {s.year}
                </p>
                <div className="w-10 h-px bg-gold/40 mx-auto mb-3" />
                <p className="text-body text-xs sm:text-sm leading-relaxed max-w-sm sm:max-w-md mx-auto">
                  {s.body}
                </p>
              </div>
            </div>

            {/* Scene index — discreet top-right */}
            <div className="absolute top-6 right-6 text-[10px] uppercase tracking-[0.3em] text-cream/80 z-20 mix-blend-difference">
              {s.n} / 06
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
