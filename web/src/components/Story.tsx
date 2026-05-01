"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

const scenes = [
  {
    n: "01",
    title: "The Meeting",
    year: "2019",
    body: "[A German garden bar in Lebanon. The crowd, the string lights, the specific thing she said when I walked over.]",
    video: "/videos/scene-01-meeting.mp4",
    poster: "/videos/posters/scene-01-meeting.jpg",
    // Desktop object-position — mobile always center (9:16 fits portrait viewport)
    framing: "object-center",
  },
  {
    n: "02",
    title: "The Date",
    year: "2019",
    body: "[A week later. Where we went. The detail I still remember.]",
    video: "/videos/scene-02-date.mp4",
    poster: "/videos/posters/scene-02-date.jpg",
    framing: "object-center",
  },
  {
    n: "03",
    title: "The Distance",
    year: "2019",
    body: "[I flew back to France the next day. A month of texts. The plan to come back.]",
    video: "/videos/scene-03-distance.mp4",
    poster: "/videos/posters/scene-03-distance.jpg",
    // Plane + Eiffel sit in the upper portion; keep that visible on desktop crop
    framing: "object-center md:object-top",
  },
  {
    n: "04",
    title: "The Return",
    year: "2019",
    body: "[A month later. We never parted again.]",
    video: "/videos/scene-04-return.mp4",
    poster: "/videos/posters/scene-04-return.jpg",
    framing: "object-center",
  },
  {
    n: "05",
    title: "The Promise",
    year: "2022",
    body: "[Three years on. Positano, the Amalfi cliff, the moment she said yes.]",
    video: "/videos/scene-05-promise.mp4",
    poster: "/videos/posters/scene-05-promise.jpg",
    // Kneeling figure + lemons sit lower in the panel; keep that visible on desktop
    framing: "object-center md:object-bottom",
  },
  {
    n: "06",
    title: "The Wedding",
    year: "2026",
    body: "[Today. Couvent Saint Jean. Everything that came before brought us here.]",
    video: "/videos/scene-06-wedding.mp4",
    poster: "/videos/posters/scene-06-wedding.jpg",
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

  // Scroll-scrubbed video playback per scene + caption fade
  useEffect(() => {
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      scenes.forEach((_, i) => {
        const sceneEl = document.querySelector<HTMLElement>(`.scene-${i}`);
        const video = videoRefs.current[i];
        if (!sceneEl || !video) return;

        const wireScrub = () => {
          if (!isFinite(video.duration) || video.duration === 0) return;

          // Prime the buffer so iOS Safari can scrub smoothly.
          // Without this, video.currentTime seeks may stall on poster frame.
          const prime = video.play();
          if (prime && typeof prime.then === "function") {
            prime.then(() => video.pause()).catch(() => video.pause());
          } else {
            video.pause();
          }

          if (reduceMotion) {
            // Honor prefers-reduced-motion: keep poster, no scrub, no caption motion.
            video.currentTime = 0;
            return;
          }

          gsap.to(video, {
            currentTime: video.duration,
            ease: "none",
            scrollTrigger: {
              trigger: sceneEl,
              start: "top top",
              end: "bottom bottom",
              scrub: 0.5,
            },
          });

          // Cream fade transition — video fades in from cream at scene start,
          // holds visible through the middle, fades out to cream at scene end.
          // No hard cuts between scenes — they crossfade through the cream BG.
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
              video,
              { opacity: 0 },
              { opacity: 1, ease: "none", duration: 0.18 }
            )
            .to(video, { opacity: 1, ease: "none", duration: 0.64 })
            .to(video, { opacity: 0, ease: "none", duration: 0.18 });

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
        };

        // Wait for `canplay` (frames buffered) — stronger than `loadedmetadata`
        // (just header parsed). On iOS Safari, scrub stalls without buffered frames.
        if (video.readyState >= 3 && isFinite(video.duration)) {
          wireScrub();
        } else {
          video.addEventListener("canplay", wireScrub, { once: true });
        }
      });
    }, sectionRef);

    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, []);

  // Plane zigzag descent + lemon corner parallax
  useEffect(() => {
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return; // honor user preference — no plane / lemon parallax

    const ctx = gsap.context(() => {
      const sectionEl = sectionRef.current;
      if (!sectionEl) return;

      // Plane zigzags DOWN the page over the whole Story scroll range.
      // Multiple keyframes via timeline (scrubbed by scroll) — gliding curve
      // with 5 zigzag legs L→R→L→R→L while descending top to bottom.
      if (planeRef.current) {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionEl,
            start: "top top",
            end: "bottom bottom",
            scrub: 1.2,
          },
        });

        // Plane is anchored at top: 0, left: 0 in CSS. We move it via vw/vh
        // so it traverses the visible viewport on every device.
        tl.set(planeRef.current, { x: "10vw", y: "5vh", rotate: -12, scale: 0.9 })
          .to(planeRef.current, {
            x: "70vw", y: "20vh", rotate: 22, scale: 1,
            ease: "sine.inOut",
            duration: 1,
          })
          .to(planeRef.current, {
            x: "5vw", y: "40vh", rotate: -28, scale: 1.05,
            ease: "sine.inOut",
            duration: 1,
          })
          .to(planeRef.current, {
            x: "75vw", y: "60vh", rotate: 30, scale: 1,
            ease: "sine.inOut",
            duration: 1,
          })
          .to(planeRef.current, {
            x: "10vw", y: "80vh", rotate: -16, scale: 0.95,
            ease: "sine.inOut",
            duration: 1,
          })
          .to(planeRef.current, {
            x: "60vw", y: "98vh", rotate: 8, scale: 0.9,
            ease: "sine.inOut",
            duration: 1,
          });
      }

      // Lemons at all 4 corners — subtle parallax drift on scroll (NOT crossing
      // the screen, just breathing in place for depth).
      const corners: [
        React.RefObject<HTMLImageElement | null>,
        { yPercent: number; xPercent: number }
      ][] = [
        [lemonTLRef, { yPercent: 18, xPercent: -10 }],
        [lemonBRRef, { yPercent: -18, xPercent: 10 }],
        [lemonTRRef, { yPercent: 14, xPercent: 8 }],
        [lemonBLRef, { yPercent: -14, xPercent: -8 }],
      ];
      corners.forEach(([ref, motion]) => {
        if (!ref.current) return;
        gsap.to(ref.current, {
          ...motion,
          ease: "none",
          scrollTrigger: {
            trigger: sectionEl,
            start: "top bottom",
            end: "bottom top",
            scrub: 2,
          },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="story"
      className="relative bg-cream paper-grain"
    >
      {/* Floating decorative layer — fixed to viewport so it overlays every
          pinned scene. pointer-events-none never blocks scroll. */}
      <div
        className="pointer-events-none fixed inset-0 z-30 overflow-hidden"
        aria-hidden
      >
        {/* Four lemon corners — same asset, mirrored/rotated for variety */}
        <img
          ref={lemonTLRef}
          src="/elements/lemon.png"
          alt=""
          className="absolute -top-10 -left-10 w-40 sm:w-52 md:w-60 h-auto opacity-95 select-none"
          style={{ transform: "rotate(-15deg)" }}
        />
        <img
          ref={lemonBRRef}
          src="/elements/lemon.png"
          alt=""
          className="absolute -bottom-10 -right-10 w-40 sm:w-52 md:w-60 h-auto opacity-95 select-none"
          style={{ transform: "rotate(165deg) scaleX(-1)" }}
        />
        <img
          ref={lemonTRRef}
          src="/elements/lemon.png"
          alt=""
          className="absolute -top-8 -right-8 w-32 sm:w-40 md:w-48 h-auto opacity-80 select-none hidden sm:block"
          style={{ transform: "rotate(45deg) scaleX(-1)" }}
        />
        <img
          ref={lemonBLRef}
          src="/elements/lemon.png"
          alt=""
          className="absolute -bottom-8 -left-8 w-32 sm:w-40 md:w-48 h-auto opacity-80 select-none hidden sm:block"
          style={{ transform: "rotate(-145deg)" }}
        />

        {/* Paper plane — anchored top-left, GSAP zigzags it across viewport */}
        <img
          ref={planeRef}
          src="/elements/plane.png"
          alt=""
          className="absolute top-0 left-0 w-24 sm:w-28 md:w-36 h-auto select-none"
          style={{
            filter: "drop-shadow(0 8px 16px rgba(42,37,32,0.15))",
            willChange: "transform",
          }}
        />
      </div>

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
            {/* TRUE full-bleed video — object-cover fills the entire viewport
                edge to edge. On desktop landscape this crops top + bottom of
                the 9:16 portrait video to fit the wider aspect; the storyboard
                panels are composed with the action centered so the crop is
                acceptable. No pillarbox bars, no cream paper visible behind. */}
            <video
              ref={(el) => {
                videoRefs.current[i] = el;
              }}
              src={s.video}
              poster={s.poster}
              muted
              playsInline
              preload="auto"
              className={`absolute inset-0 w-full h-full object-cover ${s.framing}`}
              style={{ pointerEvents: "none" }}
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
