"use client";

/**
 * VerseGate — cinematic click-to-enter overlay. THE first thing every
 * guest sees.
 *
 * Animated 31-frame watercolor of the Mediterranean table (olives, lemon,
 * salami board, wine bottle, two wine glasses, Couvent in the sunset
 * background) yo-yos at ~10s per cycle, painted to a canvas with cover
 * scaling. Over it: the verse, the names, the date, the venue, and a
 * "tap to enter" cue.
 *
 * Anthony 2026-05-16: "wtf is this first section??? i told you to make
 * it cinematic. step 1, first thing people see when they click on the
 * link, it opens with the verse, on the photo we had before the one
 * with the olives, table, wine (you have it somewhere, it is also a
 * video animated)... and this should be like a separate page, people
 * should click somewhere so it starts."
 *
 * Restored: cursive "and" in #d4b87a between Anthony + Jennifer
 * (matching original Hero). The previous gold "&" read as green on
 * dark scrim and was almost invisible.
 *
 * State machine: gate → exiting → done.
 * SessionStorage: skipped on second visit in the same session.
 */

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const BP = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const SESSION_KEY = "verse-gate-passed-v1";
const FRAME_COUNT = 31;
const LOOP_HALF_DURATION = 6; // seconds for forward OR reverse (yo-yo = 12s/cycle)

type Phase = "gate" | "exiting" | "done";

export default function VerseGate() {
  const [phase, setPhase] = useState<Phase>("gate");
  const overlayRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  // Skip if guest already passed in this session
  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem(SESSION_KEY)) {
      setPhase("done");
    }
  }, []);

  // Lock body scroll while the gate is open
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (phase === "gate" || phase === "exiting") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [phase]);

  // Per Anthony 2026-05-16 second pass: the gate background should NOT
  // animate by default. Static still until the user taps; then on tap,
  // the photo briefly plays + fades to paper-white revealing the Hero.
  // (Was a 12s yoyo loop; killed per 4-brain consensus — read as a
  // portfolio loop, not a wedding invitation.) Single static frame
  // from the opener set (f-15: the full composition with olives +
  // lemons + wine + Couvent at sunset).
  useEffect(() => {
    if (phase === "done") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const setCanvasSize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const img = new Image();
    let onTapPlayback: gsap.core.Tween | null = null;

    const drawCover = (image: HTMLImageElement) => {
      if (!image.complete || image.naturalWidth === 0) return;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const iar = image.naturalWidth / image.naturalHeight;
      const car = w / h;
      let dw, dh, dx, dy;
      if (iar > car) {
        dh = h;
        dw = h * iar;
        dx = (w - dw) / 2;
        dy = 0;
      } else {
        dw = w;
        dh = w / iar;
        dx = 0;
        dy = (h - dh) / 2;
      }
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(image, dx, dy, dw, dh);
    };

    // Preload ALL frames so the on-tap play-through is buttery, but
    // only PAINT the static still until the user taps.
    const frames: HTMLImageElement[] = [];
    for (let i = 0; i < FRAME_COUNT; i++) {
      const f = new Image();
      f.src = `${BP}/frames/opener/f-${String(i + 1).padStart(2, "0")}.jpg`;
      frames.push(f);
    }

    setCanvasSize();
    img.onload = () => drawCover(img);
    img.src = `${BP}/frames/opener/f-15.jpg`;
    frames[14] = img;

    // Expose a play-on-tap fn via ref to be triggered by handleEnter
    (canvas as HTMLCanvasElement & { __playOnTap?: () => void }).__playOnTap = () => {
      const state = { idx: 14 };
      onTapPlayback = gsap.to(state, {
        idx: FRAME_COUNT - 1,
        duration: 1.6,
        ease: "power2.out",
        onUpdate: () => drawCover(frames[Math.round(state.idx)] ?? img),
      });
    };

    const onResize = () => {
      setCanvasSize();
      drawCover(img);
    };
    window.addEventListener("resize", onResize);

    return () => {
      onTapPlayback?.kill();
      window.removeEventListener("resize", onResize);
    };
  }, [phase]);

  const handleEnter = () => {
    if (phase !== "gate") return;
    if (typeof window !== "undefined") {
      sessionStorage.setItem(SESSION_KEY, "true");
    }
    setPhase("exiting");

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      gsap.set(overlayRef.current, { opacity: 0 });
      setPhase("done");
      document.body.style.overflow = "";
      return;
    }

    // 1. Play the watercolor through (1.6s)
    const canvas = canvasRef.current as
      | (HTMLCanvasElement & { __playOnTap?: () => void })
      | null;
    canvas?.__playOnTap?.();

    // 2. Fade the OVERLAY (gradient scrim + verse text) out slightly
    //    so the watercolor breathes briefly, then the whole gate
    //    transitions to a paper-white wash that reveals the Hero
    //    underneath. Per Anthony 2026-05-16 + 4-brain consensus.
    gsap.to(overlayRef.current, {
      backgroundColor: "var(--cream)",
      duration: 1.4,
      ease: "power2.inOut",
      delay: 0.6,
    });
    gsap.to(overlayRef.current?.querySelectorAll(".gate-fade-out") ?? [], {
      opacity: 0,
      duration: 0.9,
      ease: "power2.in",
      delay: 0.4,
    });
    // Keep the names + verse visible longer — they hold while paper-white
    // rises, providing visual continuity into the Hero (Anthony: "anthony
    // & jennifer should animate from opening page to hero while remaining
    // the same").
    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.6,
      ease: "power2.in",
      delay: 1.8,
      onComplete: () => {
        setPhase("done");
        document.body.style.overflow = "";
      },
    });
  };

  if (phase === "done") return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[60] overflow-hidden bg-ink cursor-pointer"
      role="button"
      tabIndex={0}
      aria-label="Tap to enter Anthony and Jennifer's wedding invitation"
      onClick={handleEnter}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleEnter();
        }
      }}
    >
      {/* Animated watercolor — the table with olives, wine, sunset, Couvent. */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        aria-hidden
      />

      {/* MUCH stronger dark scrim — per Anthony 2026-05-16: "verse should
          be taking the full screen with an overlay stronger on the
          background so the text is visible." Was readable but soft;
          now opaque enough that the verse + names pop clearly while the
          watercolor sits as atmospheric texture, not competing content. */}
      <div
        aria-hidden
        className="gate-fade-out absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(20,18,14,0.72) 0%, rgba(20,18,14,0.62) 35%, rgba(20,18,14,0.68) 65%, rgba(20,18,14,0.88) 100%)",
        }}
      />
      <div
        aria-hidden
        className="gate-fade-out absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 75% 55% at 50% 38%, rgba(20,18,14,0.55) 0%, rgba(20,18,14,0.2) 55%, transparent 85%)",
        }}
      />

      {/* Content layer */}
      <div className="relative z-10 flex flex-col items-center justify-between text-center min-h-[100svh] px-6 pt-14 pb-10 sm:pb-14">
        <div className="flex-1" />

        {/* THE VERSE — full-screen, dominant. The hero element of the gate. */}
        <div className="gate-fade-out flex flex-col items-center">
          <p
            className="italic leading-[1.22] text-cream max-w-[18ch] sm:max-w-[28ch]"
            style={{
              fontFamily: "var(--font-display), 'Cormorant Garamond', serif",
              fontWeight: 300,
              fontSize: "clamp(32px, 5.5vw, 64px)",
              letterSpacing: "0.005em",
              textShadow:
                "0 4px 32px rgba(0,0,0,0.7), 0 0 12px rgba(0,0,0,0.45)",
            }}
          >
            &ldquo;I have found the one whom my soul loves.&rdquo;
          </p>
          <p
            className="mt-5 sm:mt-7 text-cream/90 text-[10px] sm:text-xs uppercase"
            style={{
              letterSpacing: "0.5em",
              textShadow: "0 2px 14px rgba(0,0,0,0.7)",
            }}
          >
            Song of Solomon &nbsp;3&thinsp;:&thinsp;4
          </p>
        </div>

        <div className="flex-1" />

        {/* THE COUPLE — single small line "Anthony & Jennifer" per Anthony
            2026-05-16. Was a 3-line stacked display (Anthony / and /
            Jennifer); now a single elegant smaller line with the literal
            ampersand. Positioned to roughly match the Hero's name position
            so the visual reads as continuity across the paper-white fade
            (crossfade-with-position-continuity per 4-brain consensus —
            FLIP is too fragile on iOS Safari). */}
        <div className="hero-name-anchor flex flex-col items-center">
          <p
            className="hero-name-text font-display text-cream"
            style={{
              fontSize: "clamp(28px, 4.5vw, 48px)",
              letterSpacing: "0.04em",
              fontWeight: 300,
              textShadow:
                "0 4px 32px rgba(0,0,0,0.7), 0 0 12px rgba(0,0,0,0.45)",
            }}
          >
            Anthony &amp; Jennifer
          </p>

          <div
            className="h-px my-5 sm:my-6"
            style={{
              background: "#d4b87a",
              width: 56,
              boxShadow: "0 0 12px rgba(0,0,0,0.4)",
            }}
          />

          <p
            className="text-cream/90 text-xs sm:text-sm uppercase"
            style={{
              letterSpacing: "0.5em",
              textShadow: "0 2px 14px rgba(0,0,0,0.7)",
            }}
          >
            18 &middot; 07 &middot; 2026
          </p>
          <p
            className="mt-3 text-cream/70 text-[10px] sm:text-xs uppercase"
            style={{
              letterSpacing: "0.4em",
              textShadow: "0 2px 14px rgba(0,0,0,0.7)",
            }}
          >
            Couvent Saint Jean &middot; Okaibe &middot; Lebanon
          </p>
        </div>

        {/* DYNAMIC TAP-TO-ENTER cue — per Anthony 2026-05-16: "tap to enter
            should be a bit more dynamic for people to see it." Pulsing
            gold pill button with a label, chevron, and breathing ring —
            unmistakable interaction signal. */}
        <div className="gate-fade-out mt-10 flex flex-col items-center gap-3 pointer-events-none">
          <button
            type="button"
            tabIndex={-1}
            aria-hidden
            className="gate-cta-pill relative px-7 py-3.5 rounded-full text-[11px] sm:text-xs uppercase pointer-events-none"
            style={{
              border: "1px solid rgba(212, 184, 122, 0.55)",
              background: "rgba(20, 18, 14, 0.32)",
              color: "#f4ecde",
              letterSpacing: "0.42em",
              textShadow: "0 2px 14px rgba(0,0,0,0.7)",
              backdropFilter: "blur(2px)",
              WebkitBackdropFilter: "blur(2px)",
            }}
          >
            <span className="gate-cta-text inline-block">Tap to enter</span>
            <span
              aria-hidden
              className="ml-3 inline-block"
              style={{
                color: "#d4b87a",
                animation: "tap-chevron 1.6s ease-in-out infinite",
              }}
            >
              ↓
            </span>
            {/* Breathing ring — pulsing gold halo around the button */}
            <span
              aria-hidden
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                border: "1px solid rgba(212, 184, 122, 0.4)",
                animation: "tap-ring 2.2s ease-out infinite",
              }}
            />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes tap-chevron {
          0%, 100% { transform: translateY(-2px); opacity: 0.8; }
          50% { transform: translateY(4px); opacity: 1; }
        }
        @keyframes tap-ring {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.22); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .gate-cta-pill * { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
