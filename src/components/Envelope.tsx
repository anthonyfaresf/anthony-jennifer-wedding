"use client";

/**
 * Envelope — fullscreen "tap to open the wedding invitation" overlay.
 *
 * Replaces the prior `EntranceSplash`. NOT a scroll section — sits as a fixed
 * overlay (z-50) above the entire page until the user opens + dismisses it.
 * Once dismissed in the session, it doesn't return.
 *
 * Composition:
 *   - Cream paper backdrop (matches paper-grain texture of the rest of the
 *     site) with feTurbulence-driven warm grain at higher density than the
 *     site default — sells the "this is paper, not a screen" illusion.
 *   - Paper envelope (warm cream, watercolor-feathered edges, drop shadow)
 *   - Olive WAX SEAL engraved A&J — rendered as TWO halves with a jagged
 *     clip-path seam down the middle. The break is the moment the eye buys
 *     in.
 *   - On tap: micro-pulse → halves separate + rotate apart → flap lifts in
 *     3D → letter slides up out of envelope with names, date, venue.
 *   - "Enter" CTA after open → fade overlay → reveal hero underneath.
 *
 * State machine: sealed → opening → opened → dismissed.
 *
 * Inspiration synthesis (per the 2026-05-02 wedding-site research pass):
 * DeltaFrog GSAP envelope architecture for the 3D flap, Codrops feTurbulence
 * for paper grain, CSS-Tricks clip-path break for the wax-seal half-tear.
 */

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import CurtainReveal from "./CurtainReveal";

// Collapsed 2026-05-15 per Anthony — single-tap entrance, no intermediate
// "ENTER" pause state. One click on the seal runs the full open animation,
// holds the invite card on-screen for absorption, then hands off to the
// CurtainReveal which plays the wine-cheers clink and parts as curtains
// to reveal the hero (Anthony 2026-05-16).
type Phase = "sealed" | "opening" | "curtain" | "dismissed";

const SESSION_KEY = "envelope-opened-v1";

export default function Envelope() {
  const [phase, setPhase] = useState<Phase>("sealed");

  const overlayRef = useRef<HTMLDivElement>(null);
  const flapRef = useRef<SVGGElement>(null);
  const sealGroupRef = useRef<SVGGElement>(null);
  const sealLeftRef = useRef<SVGGElement>(null);
  const sealRightRef = useRef<SVGGElement>(null);
  const letterRef = useRef<HTMLDivElement>(null);
  const sealedHintRef = useRef<HTMLParagraphElement>(null);

  // Skip on second visit in the same browser session
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SESSION_KEY) === "true") {
      setPhase("dismissed");
    }
  }, []);

  // Lock page scroll while the overlay is up
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (phase === "dismissed") {
      document.body.style.overflow = "";
    } else {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [phase]);

  const handleOpen = () => {
    if (phase !== "sealed") return;
    setPhase("opening");

    const dismiss = () => {
      if (typeof window !== "undefined") {
        sessionStorage.setItem(SESSION_KEY, "true");
      }
      // Mount the curtain underneath, then fade the envelope so the cheers
      // sequence is already playing as the invite lifts away.
      setPhase("curtain");
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.55,
        ease: "power2.inOut",
        // body overflow stays locked — CurtainReveal manages its own lock
        // and releases it when the split completes.
      });
    };

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      // Honor the motion preference — instant dismiss with no animation.
      gsap.set(overlayRef.current, { opacity: 0 });
      setPhase("dismissed");
      document.body.style.overflow = "";
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        // Hold the invite card on-screen ~1.4s so the names + date land,
        // then auto-fade. Single-tap commitment per Anthony 2026-05-15.
        gsap.delayedCall(1.4, dismiss);
      },
    });

    tl
      // Hint fades out the moment the user commits
      .to(sealedHintRef.current, { opacity: 0, duration: 0.25 }, 0)
      // Pre-break MICRO-PULSE — the seal swells like wax under pressure
      .to(
        sealGroupRef.current,
        { scale: 1.08, duration: 0.16, ease: "power2.out" },
        0.05
      )
      // The CRACK — two halves rotate + translate apart and fade
      .to(
        sealLeftRef.current,
        {
          x: -28,
          y: 14,
          rotation: -12,
          opacity: 0,
          duration: 0.55,
          ease: "power3.in",
          transformOrigin: "50% 50%",
        },
        "+=0.02"
      )
      .to(
        sealRightRef.current,
        {
          x: 28,
          y: 14,
          rotation: 12,
          opacity: 0,
          duration: 0.55,
          ease: "power3.in",
          transformOrigin: "50% 50%",
        },
        "<"
      )
      // FLAP opens — 3D rotateX hinged from the top edge
      .to(
        flapRef.current,
        {
          rotationX: -175,
          duration: 0.95,
          ease: "power3.inOut",
          transformOrigin: "50% 0%",
        },
        "-=0.3"
      )
      // LETTER slides up out of the envelope, scaling in
      .fromTo(
        letterRef.current,
        { y: 90, opacity: 0, scale: 0.96 },
        { y: 0, opacity: 1, scale: 1, duration: 0.75, ease: "power3.out" },
        "-=0.55"
      );
  };

  if (phase === "dismissed") return null;

  return (
    <>
      {/* Wine-cheers curtain reveal — mounts the moment the envelope begins
          its dismissal. Plays the cheers, holds at the touch, parts as
          curtains to unveil the hero. Lives at z-55, underneath the
          fading envelope (z-60). */}
      {phase === "curtain" && (
        <CurtainReveal onComplete={() => setPhase("dismissed")} />
      )}
      <div
      ref={overlayRef}
      className="fixed inset-0 z-[60] bg-cream flex items-center justify-center px-6"
      role="dialog"
      aria-label="Wedding invitation"
      aria-modal="true"
    >
      {/* Paper grain noise overlay — applied as a child so its
          `position: relative` rule (from globals.css) doesn't override the
          parent overlay's `position: fixed`. */}
      <div className="absolute inset-0 paper-grain pointer-events-none" aria-hidden />
      {/* ============================================================
          GLOBAL SVG DEFS — paper texture filter + seal clip-paths +
          reusable seal content. Lives in a 0×0 SVG so the IDs are
          referenceable from any later SVG inside the component.
         ============================================================ */}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
        <defs>
          {/* Watercolor-paper feel: low-frequency turbulence displaces
              the source slightly, giving organic edges + grain. */}
          <filter
            id="env-paper-texture"
            x="-2%"
            y="-2%"
            width="104%"
            height="104%"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.045"
              numOctaves="3"
              seed="2"
            />
            <feDisplacementMap in="SourceGraphic" scale="1.4" />
          </filter>

          {/* Wax surface — slightly higher frequency = pebbly, hand-pressed */}
          <filter id="env-wax-texture">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.7"
              numOctaves="2"
              seed="5"
            />
            <feDisplacementMap in="SourceGraphic" scale="0.5" />
          </filter>

          {/* Paper drop shadow */}
          <filter id="env-paper-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow
              dx="0"
              dy="14"
              stdDeviation="22"
              floodColor="#2b2b2b"
              floodOpacity="0.18"
            />
          </filter>

          {/* Wax drop shadow (tighter, denser) */}
          <filter id="env-wax-shadow">
            <feDropShadow
              dx="0"
              dy="2.5"
              stdDeviation="2.4"
              floodColor="#1d1f08"
              floodOpacity="0.55"
            />
          </filter>

          {/* === Envelope paper gradient === */}
          <linearGradient id="env-paper-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f0e3cf" />
            <stop offset="100%" stopColor="#e6d5b8" />
          </linearGradient>
          <linearGradient id="env-flap-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f4ece0" />
            <stop offset="100%" stopColor="#e8dcc4" />
          </linearGradient>
          <linearGradient id="env-flap-back-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e6d5b8" />
            <stop offset="100%" stopColor="#d6c39e" />
          </linearGradient>

          {/* === Wax seal radial gradient === */}
          <radialGradient id="env-seal-wax" cx="0.4" cy="0.32" r="0.78">
            <stop offset="0%" stopColor="#7a8a3f" />
            <stop offset="40%" stopColor="#5a6a25" />
            <stop offset="78%" stopColor="#384418" />
            <stop offset="100%" stopColor="#1d250a" />
          </radialGradient>

          {/* === Jagged seam clip-paths === */}
          <clipPath id="env-seal-left-clip" clipPathUnits="userSpaceOnUse">
            <polygon
              points="0,0 50,0 48,8 52,14 46,22 54,28 48,36 53,42 45,50 53,58 47,64 52,72 46,78 54,86 48,94 50,100 0,100"
            />
          </clipPath>
          <clipPath id="env-seal-right-clip" clipPathUnits="userSpaceOnUse">
            <polygon
              points="50,0 100,0 100,100 50,100 48,94 54,86 46,78 52,72 47,64 53,58 45,50 53,42 48,36 54,28 46,22 52,14 48,8"
            />
          </clipPath>

          {/* === Reusable seal content (rendered twice via <use>) === */}
          <g id="env-seal-content">
            {/* Wax body — slightly irregular circle for hand-pressed feel.
                The drop-shadow filter would clip when transformed, so it's
                applied directly to this path. */}
            <path
              d="M 50 6 C 73 7 92 24 94 47 C 95 70 78 90 53 94 C 28 95 8 78 6 53 C 5 28 24 8 50 6 Z"
              fill="url(#env-seal-wax)"
              filter="url(#env-wax-shadow)"
            />
            {/* Pebbly wax surface — turbulence-displaced overlay tints */}
            <path
              d="M 50 6 C 73 7 92 24 94 47 C 95 70 78 90 53 94 C 28 95 8 78 6 53 C 5 28 24 8 50 6 Z"
              fill="url(#env-seal-wax)"
              filter="url(#env-wax-texture)"
              opacity="0.5"
            />
            {/* Inner debossed ring (engraved feel) */}
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke="#1d250a"
              strokeOpacity="0.6"
              strokeWidth="0.9"
            />
            {/* Highlight ring 1px up + left of the deboss = shows a "carved"
                edge catching ambient light */}
            <circle
              cx="49.4"
              cy="49.4"
              r="38"
              fill="none"
              stroke="#a8b76a"
              strokeOpacity="0.32"
              strokeWidth="0.6"
            />
            {/* === Engraved A&J monogram ===
                Two text layers offset: a darker "carved-into-wax" layer +
                a brighter "lit edge" layer offset 0.5px up/left. */}
            {/* Engraved depth (dark recess) */}
            <text
              x="50"
              y="59"
              textAnchor="middle"
              fontFamily='"Blosta", Georgia, serif'
              fontSize="32"
              fontWeight="400"
              fill="#1d250a"
              fillOpacity="0.85"
            >
              A
              <tspan
                fontFamily='"Italianno", cursive'
                fontSize="22"
                dy="-1"
                fill="#1d250a"
                fillOpacity="0.85"
              >
                &amp;
              </tspan>
              <tspan dy="1">J</tspan>
            </text>
            {/* Lit highlight edge (offset up/left, brighter olive) */}
            <text
              x="49.5"
              y="58.5"
              textAnchor="middle"
              fontFamily='"Blosta", Georgia, serif'
              fontSize="32"
              fontWeight="400"
              fill="#b8c87c"
              fillOpacity="0.4"
            >
              A
              <tspan
                fontFamily='"Italianno", cursive'
                fontSize="22"
                dy="-1"
                fill="#b8c87c"
                fillOpacity="0.55"
              >
                &amp;
              </tspan>
              <tspan dy="1">J</tspan>
            </text>
          </g>
        </defs>
      </svg>

      {/* ============================================================
          THE ENVELOPE — clickable while sealed. Once opened the click
          handler is a no-op; the user uses the Enter CTA below.
         ============================================================ */}
      <button
        type="button"
        onClick={phase === "sealed" ? handleOpen : undefined}
        disabled={phase !== "sealed"}
        className={`relative block ${
          phase === "sealed" ? "cursor-pointer" : "cursor-default"
        } focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 focus-visible:ring-offset-4 focus-visible:ring-offset-cream rounded-sm`}
        style={{ width: "min(86vw, 480px)" }}
        aria-label={phase === "sealed" ? "Open the invitation" : "Invitation"}
      >
        {/* PERSPECTIVE WRAPPER — gives the flap real 3D rotation */}
        <div
          className="relative w-full"
          style={{ aspectRatio: "5 / 3.4", perspective: "1600px" }}
        >
          {/* === ENVELOPE BODY (back layer) === */}
          <svg
            viewBox="0 0 500 340"
            className="absolute inset-0 w-full h-full"
            preserveAspectRatio="none"
          >
            {/* Drop-shadowed paper rectangle */}
            <rect
              x="0"
              y="0"
              width="500"
              height="340"
              rx="3"
              fill="url(#env-paper-fill)"
              filter="url(#env-paper-shadow)"
            />
            {/* Watercolor texture overlay — turbulence-displaced copy */}
            <rect
              x="0"
              y="0"
              width="500"
              height="340"
              rx="3"
              fill="url(#env-paper-fill)"
              filter="url(#env-paper-texture)"
              opacity="0.55"
            />
            {/* Inside-of-envelope tint visible once flap opens — gives the
                "letter is inside this dark cavity" cue */}
            <path
              d="M 0 0 L 250 168 L 500 0 L 500 340 L 0 340 Z"
              fill="#3a2f24"
              opacity="0.16"
            />
            {/* Diagonal seam lines — back-of-envelope construction */}
            <path
              d="M 0 340 L 250 172 L 500 340"
              fill="none"
              stroke="#2b2b2b"
              strokeOpacity="0.08"
              strokeWidth="1"
            />
          </svg>

          {/* === LETTER (initially hidden behind the flap) === */}
          <div
            ref={letterRef}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[88%] opacity-0 z-10 pointer-events-none"
          >
            <div className="bg-cream paper-grain rounded-sm shadow-[0_18px_44px_-22px_rgba(42,37,32,0.5)] border border-ink/[0.04] px-6 py-7 text-center">
              <p
                className="text-[10px] uppercase tracking-[0.5em] mb-3"
                style={{ color: "var(--display)", opacity: 0.85 }}
              >
                You are invited
              </p>
              <h1
                className="leading-none mb-2"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(48px, 14vw, 96px)",
                  letterSpacing: "0.02em",
                  color: "var(--display)",
                }}
              >
                A
                <span
                  className="mx-1.5 sm:mx-2 align-middle inline-block"
                  style={{
                    fontFamily: "var(--font-italianno)",
                    color: "var(--gold)",
                    fontSize: "0.62em",
                    transform: "translateY(-0.05em)",
                  }}
                >
                  &
                </span>
                J
              </h1>
              <div
                className="w-12 h-px mx-auto my-3"
                style={{ background: "var(--gold)" }}
              />
              <p
                className="text-base sm:text-lg mb-2"
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--display)",
                }}
              >
                Anthony · Jennifer
              </p>
              <p
                className="text-[9px] sm:text-[10px] uppercase tracking-[0.4em] mb-1"
                style={{ color: "var(--display)" }}
              >
                July 18 · 2026
              </p>
              <p
                className="text-[9px] uppercase tracking-[0.32em]"
                style={{ color: "var(--display)", opacity: 0.7 }}
              >
                Couvent Saint Jean · Okaibe · Lebanon
              </p>
            </div>
          </div>

          {/* === FLAP (top half, hinges from top edge) === */}
          <svg
            viewBox="0 0 500 200"
            className="absolute inset-x-0 top-0 w-full h-1/2 z-20"
            preserveAspectRatio="none"
            style={{ transformOrigin: "50% 0%", overflow: "visible" }}
          >
            <g
              ref={flapRef}
              style={{
                transformOrigin: "50% 0%",
                transformStyle: "preserve-3d",
              }}
            >
              {/* Front of flap (cream paper) */}
              <path d="M 0 0 L 500 0 L 250 200 Z" fill="url(#env-flap-fill)" />
              {/* Watercolor texture overlay on flap */}
              <path
                d="M 0 0 L 500 0 L 250 200 Z"
                fill="url(#env-flap-fill)"
                filter="url(#env-paper-texture)"
                opacity="0.5"
              />
              {/* Subtle fold-line shadow along flap edges */}
              <path
                d="M 0 0 L 250 200 L 500 0"
                fill="none"
                stroke="#2b2b2b"
                strokeOpacity="0.1"
                strokeWidth="1"
              />
            </g>
          </svg>

          {/* === WAX SEAL (TWO HALVES with jagged clip-path seam) ===
              Sits on top of the flap (z-30). Click on the envelope triggers
              handleOpen, which animates the halves apart. */}
          <svg
            viewBox="0 0 100 100"
            className="absolute z-30"
            style={{
              width: "23%",
              left: "50%",
              top: "44%",
              transform: "translate(-50%, -50%)",
              overflow: "visible",
            }}
            preserveAspectRatio="xMidYMid meet"
          >
            <g
              ref={sealGroupRef}
              style={{ transformOrigin: "50% 50%" }}
            >
              {/* Left half — clipped to the jagged left side */}
              <g
                ref={sealLeftRef}
                clipPath="url(#env-seal-left-clip)"
                style={{ transformOrigin: "50% 50%" }}
              >
                <use href="#env-seal-content" />
              </g>
              {/* Right half — clipped to the jagged right side */}
              <g
                ref={sealRightRef}
                clipPath="url(#env-seal-right-clip)"
                style={{ transformOrigin: "50% 50%" }}
              >
                <use href="#env-seal-content" />
              </g>
            </g>
          </svg>
        </div>
      </button>

      {/* "Tap the seal" hint while sealed */}
      <p
        ref={sealedHintRef}
        className="absolute left-0 right-0 text-center text-[10px] uppercase tracking-[0.45em] pointer-events-none"
        style={{
          bottom: "max(20vh, 96px)",
          color: "var(--display)",
          opacity: 0.65,
        }}
      >
        {phase === "sealed" ? "Tap the seal to open" : ""}
      </p>

      {/* AF&U credit */}
      <p
        className="absolute bottom-3 left-0 right-0 text-center text-[9px] uppercase tracking-[0.3em] pointer-events-auto"
        style={{ color: "var(--display)", opacity: 0.5 }}
      >
        By{" "}
        <a
          href="https://www.afandu.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline-offset-4 hover:underline"
          style={{ color: "var(--display)" }}
        >
          AF&amp;U
        </a>
      </p>
      </div>
    </>
  );
}
