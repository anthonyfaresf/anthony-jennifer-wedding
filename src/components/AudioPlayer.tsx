"use client";

import { useEffect, useRef, useState } from "react";

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

/**
 * Background music — plays throughout the wedding experience.
 *
 * Browser policy: autoplay-with-sound is blocked everywhere on first paint.
 * Strategy:
 *   - <audio> mounted muted + loop + preload
 *   - Floating bottom-right toggle (cream pill, olive icon) controls play/mute
 *   - On the FIRST user gesture (tap, click, scroll), if the user hasn't muted,
 *     unmute + play
 *   - Preference persists in localStorage so a returning guest doesn't reset
 *
 * To activate: drop an MP3 at `public/audio/ambient.mp3`. Until then the
 * component renders the toggle but the audio element will 404 silently.
 */
export default function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Restore preference on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("aj-audio-on");
    if (stored === "1") {
      // We can't autoplay yet — wait for first gesture
      // (the listener below will pick it up)
    }
  }, []);

  // Try to start on the first user gesture (browsers require this)
  useEffect(() => {
    const tryStart = () => {
      if (typeof window === "undefined") return;
      const stored = localStorage.getItem("aj-audio-on");
      // Default ON — only stay silent if user explicitly muted before
      if (stored === "0") return;

      const a = audioRef.current;
      if (!a) return;
      a.muted = false;
      a.play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          // Some browsers still refuse — user can click the toggle
        });
    };

    window.addEventListener("touchstart", tryStart, { once: true, passive: true });
    window.addEventListener("click", tryStart, { once: true });
    window.addEventListener("scroll", tryStart, { once: true, passive: true });

    return () => {
      window.removeEventListener("touchstart", tryStart);
      window.removeEventListener("click", tryStart);
      window.removeEventListener("scroll", tryStart);
    };
  }, []);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;

    if (isPlaying) {
      a.pause();
      setIsPlaying(false);
      localStorage.setItem("aj-audio-on", "0");
    } else {
      a.muted = false;
      a.play()
        .then(() => {
          setIsPlaying(true);
          localStorage.setItem("aj-audio-on", "1");
        })
        .catch(() => {});
    }
  };

  return (
    <>
      <audio
        ref={audioRef}
        src={`${BP}/audio/ambient.mp3`}
        loop
        muted
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
