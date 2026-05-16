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

  // Frame loop — preload all 31 frames, paint to canvas, yo-yo at 12s/cycle
  useEffect(() => {
    if (phase === "done") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const images: HTMLImageElement[] = [];
    let firstReady = false;

    const setCanvasSize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const drawFrame = (rawIdx: number) => {
      const idx = Math.max(0, Math.min(FRAME_COUNT - 1, Math.round(rawIdx)));
      const img = images[idx];
      if (!img || !img.complete || img.naturalWidth === 0) return;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const iar = img.naturalWidth / img.naturalHeight;
      const car = w / h;
      let dw, dh, dx, dy;
      if (iar > car) {
        // image wider than canvas — fit by height, crop sides
        dh = h;
        dw = h * iar;
        dx = (w - dw) / 2;
        dy = 0;
      } else {
        // image taller — fit by width, crop top/bottom
        dw = w;
        dh = w / iar;
        dx = 0;
        dy = (h - dh) / 2;
      }
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(img, dx, dy, dw, dh);
    };

    setCanvasSize();

    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      const idx = i;
      img.onload = () => {
        if (!firstReady) {
          firstReady = true;
          drawFrame(0);
        }
      };
      img.src = `${BP}/frames/opener/f-${String(i + 1).padStart(2, "0")}.jpg`;
      images.push(img);
    }

    if (!reduceMotion) {
      const state = { idx: 0 };
      tweenRef.current = gsap.to(state, {
        idx: FRAME_COUNT - 1,
        duration: LOOP_HALF_DURATION,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        onUpdate: () => drawFrame(state.idx),
      });
    }

    const onResize = () => {
      setCanvasSize();
      const idx = tweenRef.current
        ? (tweenRef.current.targets()[0] as { idx: number }).idx
        : 0;
      drawFrame(idx);
    };
    window.addEventListener("resize", onResize);

    return () => {
      tweenRef.current?.kill();
      tweenRef.current = null;
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

    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 1.1,
      ease: "power3.inOut",
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

      {/* Strong dark scrim — keeps cream text legible everywhere */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(20,18,14,0.55) 0%, rgba(20,18,14,0.40) 35%, rgba(20,18,14,0.48) 65%, rgba(20,18,14,0.80) 100%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 75% 55% at 50% 38%, rgba(20,18,14,0.42) 0%, rgba(20,18,14,0.15) 55%, transparent 85%)",
        }}
      />

      {/* Content layer */}
      <div className="relative z-10 flex flex-col items-center justify-between text-center min-h-[100svh] px-6 pt-14 pb-10 sm:pb-14">
        <div className="flex-1" />

        {/* THE VERSE */}
        <div className="flex flex-col items-center">
          <p
            className="italic leading-[1.22] text-cream max-w-[18ch] sm:max-w-[28ch]"
            style={{
              fontFamily: "var(--font-display), 'Cormorant Garamond', serif",
              fontWeight: 300,
              fontSize: "clamp(28px, 5vw, 58px)",
              letterSpacing: "0.005em",
              textShadow:
                "0 4px 32px rgba(0,0,0,0.7), 0 0 12px rgba(0,0,0,0.45)",
            }}
          >
            &ldquo;I have found the one whom my soul loves.&rdquo;
          </p>
          <p
            className="mt-5 sm:mt-7 text-cream/85 text-[10px] sm:text-xs uppercase"
            style={{
              letterSpacing: "0.5em",
              textShadow: "0 2px 14px rgba(0,0,0,0.7)",
            }}
          >
            Song of Solomon &nbsp;3&thinsp;:&thinsp;4
          </p>
        </div>

        <div className="flex-1" />

        {/* THE COUPLE — cursive "and" in #d4b87a, matching the original Hero. */}
        <div className="flex flex-col items-center">
          <p
            className="font-display leading-none text-cream"
            style={{
              fontSize: "clamp(40px, 7.5vw, 78px)",
              letterSpacing: "0.01em",
              textShadow:
                "0 4px 32px rgba(0,0,0,0.65), 0 0 12px rgba(0,0,0,0.4)",
            }}
          >
            Anthony
          </p>
          <p
            className="my-1 leading-none"
            style={{
              fontFamily: "var(--font-italianno), 'Italianno', cursive",
              fontSize: "clamp(34px, 5.5vw, 60px)",
              color: "#d4b87a",
              textShadow: "0 4px 22px rgba(0,0,0,0.7)",
            }}
          >
            and
          </p>
          <p
            className="font-display leading-none text-cream"
            style={{
              fontSize: "clamp(40px, 7.5vw, 78px)",
              letterSpacing: "0.01em",
              textShadow:
                "0 4px 32px rgba(0,0,0,0.65), 0 0 12px rgba(0,0,0,0.4)",
            }}
          >
            Jennifer
          </p>

          <div
            className="h-px my-5 sm:my-6"
            style={{
              background: "#d4b87a",
              width: 64,
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

        {/* TAP-TO-ENTER cue */}
        <div className="mt-8 flex flex-col items-center gap-3 pointer-events-none">
          <span
            className="text-cream/85 text-[10px] sm:text-xs uppercase"
            style={{
              letterSpacing: "0.45em",
              textShadow: "0 2px 14px rgba(0,0,0,0.7)",
            }}
          >
            tap to enter
          </span>
          <div
            className="w-12 h-px"
            style={{
              background: "#d4b87a",
              animation: "tap-pulse 1.8s ease-in-out infinite",
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes tap-pulse {
          0%, 100% { opacity: 0.45; transform: scaleX(0.75); }
          50% { opacity: 0.95; transform: scaleX(1.25); }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="tap-pulse"] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
