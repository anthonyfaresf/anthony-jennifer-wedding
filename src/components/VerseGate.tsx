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
    img.onload = () => {
      drawCover(img);
      // SLOW ZOOM-IN entrance per Anthony 2026-05-16: "the first opening
      // page should start slowly zooming in and getting darker with the
      // overlay and the text and button appears." 8s sine zoom from 1.0
      // to 1.06 on the canvas (paired with the entrance timeline that
      // fades the overlay + verse + names + ENTER in over the same window).
      const reduceMotion =
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!reduceMotion && canvas) {
        gsap.fromTo(
          canvas,
          { scale: 1.0, transformOrigin: "50% 50%" },
          { scale: 1.06, duration: 8, ease: "sine.inOut" }
        );
      }
    };
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

  // ENTRANCE TIMELINE — bright photo first, then overlay darkens, then
  // verse + names + ENTER fade in. Per Anthony 2026-05-16: "the first
  // opening page should start slowly zooming in and getting darker with
  // the overlay and the text and button appears."
  useEffect(() => {
    if (phase !== "gate") return;
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.2 });
      // 1. Overlay scrims start CLEAR (bright photo visible) and darken
      //    over ~1.8s — gives the eye time to register the watercolor
      //    before the darkness settles.
      tl.set(
        [
          ".gate-fade-out",
          ".gate-scrim-base",
          ".gate-scrim-radial",
          ".verse-word",
        ],
        { opacity: 0 }
      )
        .to([".gate-scrim-base", ".gate-scrim-radial"], {
          opacity: 1,
          duration: 1.8,
          ease: "sine.out",
        })
        // 2. The verse-WORD-by-WORD reveal — each word rises + un-blurs in
        //    sequence. Cinematic per Anthony 2026-05-16: 'more cinematic
        //    or dynamic animation with the texts.' Word-by-word reads as
        //    deliberate breath, not a block paste.
        .fromTo(
          ".verse-word",
          { y: 18, filter: "blur(6px)" },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 1.0,
            ease: "power2.out",
            stagger: 0.18,
          },
          "-=1.2"
        )
        // 3. Attribution + names + ENTER fade in as a unified bottom block
        //    after the verse settles.
        .to(
          ".gate-fade-out",
          { opacity: 1, duration: 1.0, ease: "power2.out", stagger: 0.22 },
          "-=0.5"
        );
    }, overlayRef);
    return () => ctx.revert();
  }, [phase]);

  const handleEnter = () => {
    if (phase !== "gate") return;
    if (typeof window !== "undefined") {
      sessionStorage.setItem(SESSION_KEY, "true");
      // Trigger music — AudioPlayer listens for this event only,
      // not generic clicks, so music NEVER starts before ENTER.
      window.dispatchEvent(new Event("aj-music-start"));
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
      {/* Scrim balanced: strong enough for cream text to read everywhere,
          light enough that the watercolor breathes through as atmospheric
          texture (not a black screen). Both layers composite to ~0.7
          combined alpha at the verse center — text contrasted, photo visible. */}
      <div
        aria-hidden
        className="gate-scrim-base absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(20,18,14,0.55) 0%, rgba(20,18,14,0.42) 35%, rgba(20,18,14,0.48) 65%, rgba(20,18,14,0.72) 100%)",
        }}
      />
      <div
        aria-hidden
        className="gate-scrim-radial absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 42%, rgba(20,18,14,0.35) 0%, rgba(20,18,14,0.1) 55%, transparent 85%)",
        }}
      />

      {/* Content layer — STRIPPED per Anthony 2026-05-16: 'keep only
          the verse on the first page and the enter button, but raise it,
          it is very at the bottom cant even click it.' Names + date +
          venue removed from gate; they live on the Hero card. ENTER
          moved up so it sits comfortably below the verse, easily tappable. */}
      <div className="relative z-10 flex flex-col items-center text-center min-h-[100lvh] px-6 pt-20 pb-20 sm:pb-24">
        {/* Top spacer */}
        <div className="flex-1" />

        {/* THE VERSE — display serif (Cormorant Garamond) at a more
            readable weight (400 vs 300) + slightly larger + cream-white
            with stacked text-shadow halo so the strokes don't disappear
            into the watercolor. Per Anthony 2026-05-16: 'the font on
            the first page of the verse is very much not readable.' */}
        <div className="flex flex-col items-center max-w-[18ch] sm:max-w-[32ch] lg:max-w-[40ch]">
          {/* Verse — each word kept whole inside an inline-block wrapper
              (cannot break mid-character), each WORD revealed in sequence
              via .verse-word stagger. Char-level stagger felt jittery for
              a serif italic at this size; word-level reads as breath. */}
          <p
            className="italic leading-[1.2]"
            style={{
              fontFamily: "var(--font-display), 'Cormorant Garamond', serif",
              fontWeight: 400, // bumped from 300 — strokes now hold against the watercolor
              fontSize: "clamp(32px, 5.5vw, 64px)",
              letterSpacing: "0.01em",
              color: "#ffffff", // pure white (was warm cream — bled into the olive watercolor)
              textShadow:
                "0 0 24px rgba(0,0,0,0.95), 0 0 12px rgba(0,0,0,0.9), 0 4px 28px rgba(0,0,0,0.85), 0 2px 8px rgba(0,0,0,0.65)",
            }}
          >
            <span className="verse-word inline-block" style={{ opacity: 0 }}>&ldquo;I</span>{" "}
            {[
              "have",
              "found",
              "the",
              "one",
              "whom",
              "my",
              "soul",
              "loves.",
            ].map((w, i, arr) => (
              <span key={i} className="verse-word inline-block" style={{ opacity: 0 }}>
                {w}
                {i === arr.length - 1 ? "”" : ""}
                {i < arr.length - 1 ? " " : ""}
              </span>
            ))}
          </p>
          <p
            className="gate-fade-out mt-7 sm:mt-9 text-cream/80 text-[10px] sm:text-xs uppercase"
            style={{
              letterSpacing: "0.55em",
              textShadow: "0 2px 14px rgba(0,0,0,0.75)",
            }}
          >
            Song of Solomon &nbsp;3&thinsp;:&thinsp;4
          </p>
        </div>

        {/* ELEGANT ENTER directly under the verse — NOT at the bottom edge.
            Per Anthony 2026-05-16: 'raise it, it is very at the bottom
            cant even click it.' Sits ~60-80px below the verse so the
            thumb lands on it naturally. */}
        <div
          aria-hidden
          className="gate-cta-enter mt-16 sm:mt-20 flex items-center gap-4 pointer-events-none"
          style={{ animation: "enter-breathe 2.6s ease-in-out infinite" }}
        >
          <span
            className="h-px"
            style={{
              width: 40,
              background: "#d4b87a",
              boxShadow: "0 0 8px rgba(212,184,122,0.4)",
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(12px, 1.3vw, 15px)",
              letterSpacing: "0.6em",
              textTransform: "uppercase",
              color: "#ffffff",
              textShadow: "0 2px 14px rgba(0,0,0,0.85), 0 0 8px rgba(0,0,0,0.6)",
              paddingLeft: "0.3em",
              fontWeight: 400,
            }}
          >
            Enter
          </span>
          <span
            className="h-px"
            style={{
              width: 40,
              background: "#d4b87a",
              boxShadow: "0 0 8px rgba(212,184,122,0.4)",
            }}
          />
        </div>

        {/* Bottom spacer — keeps the verse+ENTER block balanced in the
            upper-to-middle band instead of crowding the bottom edge. */}
        <div className="flex-[1.4]" />
      </div>

      <style>{`
        @keyframes enter-breathe {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .gate-cta-enter { animation: none !important; opacity: 0.9 !important; }
        }
      `}</style>
    </div>
  );
}
