"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

/**
 * VideoGate — replaces VerseGate per Anthony 2026-05-17.
 *
 * "no text no nothing just this, it opens to the hero section, and it should
 *  be very elegant and seamless the transition."
 *
 * Flow:
 *  1. Fullscreen <video> autoplays muted (browser autoplay-policy compliant)
 *  2. Subtle fade-in over the first 600ms so it doesn't slam onto the page
 *  3. On video `ended` event → fade entire gate out (1.2s) + dispatch
 *     `aj-music-start` so AudioPlayer can begin audio
 *  4. Body is `overflow: hidden` while gate is up; restored when removed
 *  5. sessionStorage flag `video-gate-passed-v1` skips the gate on reloads
 *     within the same tab session (so navigation away and back stays smooth)
 */
const FLAG = "video-gate-passed-v1";

export default function VideoGate() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [skip, setSkip] = useState(false);
  const [removed, setRemoved] = useState(false);

  // First mount: check session flag
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(FLAG) === "1") {
      setSkip(true);
      setRemoved(true);
      return;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Fade-in on mount
  useEffect(() => {
    if (skip) return;
    if (!wrapRef.current) return;
    gsap.fromTo(
      wrapRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.6, ease: "power2.out" }
    );
    // Best-effort start the video — some browsers want an explicit .play()
    videoRef.current?.play().catch(() => {
      // If autoplay is somehow blocked, skip the gate so the hero is reachable
      finish();
    });
  }, [skip]);

  function finish() {
    if (!wrapRef.current) {
      setRemoved(true);
      sessionStorage.setItem(FLAG, "1");
      window.dispatchEvent(new Event("aj-music-start"));
      return;
    }
    // Seamless fade — 1.2s, gentle ease, paper-white through which the hero
    // emerges. We dispatch music-start mid-fade so the soundtrack starts
    // BEHIND the fade-out rather than slamming in after.
    const tl = gsap.timeline({
      onComplete: () => {
        sessionStorage.setItem(FLAG, "1");
        document.body.style.overflow = "";
        setRemoved(true);
      },
    });
    tl.to(wrapRef.current, {
      opacity: 0,
      duration: 1.2,
      ease: "power2.inOut",
    })
      .add(() => {
        window.dispatchEvent(new Event("aj-music-start"));
      }, "-=0.6");
  }

  if (removed) return null;

  return (
    <div
      ref={wrapRef}
      className="fixed inset-0 z-[100] bg-black"
      style={{ opacity: 0 }}
      aria-hidden
    >
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        src="/video/opener.mp4"
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={finish}
      />
    </div>
  );
}
