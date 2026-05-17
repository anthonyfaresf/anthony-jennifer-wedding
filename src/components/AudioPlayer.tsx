"use client";

import { useEffect, useRef, useState } from "react";

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

/**
 * Background music — plays throughout the wedding experience.
 *
 * Currently testing (2026-05-15 — switching tracks for A/B feel):
 *   roi-instrumental-slowed.mp3 (~3:50) · xaoc
 *
 * Browser policy: autoplay-with-sound is hard-blocked on first paint
 * (Chrome/Safari/Firefox — no API bypass exists). So the pattern is:
 *   - <audio> mounted at volume 0 (NOT muted — that's a snap-on UX)
 *   - On the FIRST user gesture (tap/click/scroll), call .play() then
 *     GSAP-fade volume 0 → 1.0 over 4s for a real cinematic entry
 *   - Floating bottom-right toggle pauses/resumes (also fades)
 *   - Preference persists in localStorage so a returning guest doesn't reset
 *   - Native loop on the audio element — track repeats forever
 */
const TRACK = "/audio/roi-instrumental-slowed.mp3";
const FADE_IN_SECONDS = 4;
const FADE_OUT_SECONDS = 1.2;
const TARGET_VOLUME = 0.85; // slightly under full so it sits behind any UI sound

export default function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Smooth fade helper — uses requestAnimationFrame instead of GSAP
  // (avoids importing GSAP just for this; the audio element's volume
  // can be tweened directly).
  const fadeVolume = (from: number, to: number, durationSec: number) => {
    const a = audioRef.current;
    if (!a) return;
    const start = performance.now();
    a.volume = from;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / (durationSec * 1000));
      // ease-in-out cubic
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const aNow = audioRef.current;
      if (!aNow) return;
      // Clamp — floating-point rounding can push the result slightly negative
      // at the tail of a fade-out, which throws DOMException on .volume =
      aNow.volume = Math.max(0, Math.min(1, from + (to - from) * eased));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  // Restore preference on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("aj-audio-on");
    if (stored === "1") {
      // We can't autoplay yet — wait for first gesture
      // (the listener below will pick it up)
    }
  }, []);

  // Music starts automatically once the gate dispatches `aj-music-start`
  // (or, for returning-visitor reloads where the gate is skipped, on the
  // first user gesture after the dispatch). Default: ON unless explicitly
  // muted via the toggle. Per Anthony 2026-05-17 v19: "make sure the
  // music automatically starts playing unless someone mutes it, both on
  // mobile and desktop."
  useEffect(() => {
    if (typeof window === "undefined") return;
    let started = false;

    const tryStart = () => {
      if (started) return;
      const stored = localStorage.getItem("aj-audio-on");
      if (stored === "0") return; // explicitly muted by user

      const a = audioRef.current;
      if (!a) return;
      a.volume = 0;
      a.muted = false;
      a.play()
        .then(() => {
          started = true;
          setIsPlaying(true);
          fadeVolume(0, TARGET_VOLUME, FADE_IN_SECONDS);
          // Once playing, drop the first-gesture fallback listeners.
          detachGestureFallback();
        })
        .catch(() => {
          // Autoplay rejected — wait for ANY user gesture and retry.
          attachGestureFallback();
        });
    };

    // First-gesture fallback — if play() is blocked, retry on the next
    // tap / click / keypress / scroll. Once it succeeds, we detach.
    const onGesture = () => {
      if (started) return;
      tryStart();
    };
    const attachGestureFallback = () => {
      window.addEventListener("pointerdown", onGesture, { passive: true });
      window.addEventListener("keydown", onGesture);
      window.addEventListener("scroll", onGesture, { passive: true });
      window.addEventListener("touchstart", onGesture, { passive: true });
    };
    const detachGestureFallback = () => {
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("keydown", onGesture);
      window.removeEventListener("scroll", onGesture);
      window.removeEventListener("touchstart", onGesture);
    };

    window.addEventListener("aj-music-start", tryStart);
    return () => {
      window.removeEventListener("aj-music-start", tryStart);
      detachGestureFallback();
    };
  }, []);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;

    if (isPlaying) {
      // Fade out, then pause when silent
      fadeVolume(a.volume, 0, FADE_OUT_SECONDS);
      setTimeout(() => {
        const aNow = audioRef.current;
        if (aNow) aNow.pause();
      }, FADE_OUT_SECONDS * 1000);
      setIsPlaying(false);
      localStorage.setItem("aj-audio-on", "0");
    } else {
      a.volume = 0;
      a.muted = false;
      a.play()
        .then(() => {
          setIsPlaying(true);
          localStorage.setItem("aj-audio-on", "1");
          fadeVolume(0, TARGET_VOLUME, FADE_IN_SECONDS);
        })
        .catch(() => {});
    }
  };

  return (
    <>
      <audio
        ref={audioRef}
        src={`${BP}${TRACK}`}
        loop
        preload="auto"
        playsInline
      />
      <button
        type="button"
        onClick={toggle}
        aria-label={isPlaying ? "Mute music" : "Play music"}
        className="fixed bottom-4 right-4 z-50 w-11 h-11 rounded-full backdrop-blur-md flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        style={{
          background: "rgba(244, 236, 224, 0.92)",
          border: "1px solid rgba(73, 83, 20, 0.18)",
          color: "var(--display)",
          boxShadow: "0 4px 16px rgba(43, 43, 43, 0.12)",
        }}
      >
        {isPlaying ? (
          // Music note (playing)
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        ) : (
          // Muted (slashed speaker)
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 5L6 9H2v6h4l5 4V5z" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        )}
      </button>
    </>
  );
}
