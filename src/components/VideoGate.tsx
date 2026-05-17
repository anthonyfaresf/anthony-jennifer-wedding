"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

/**
 * VideoGate v2 — tap-to-open + cinematic seamless transition.
 *
 * Anthony 2026-05-17:
 *  - "it should not automatically play, the person should press on the wax
 *    for it to open"
 *  - "transition in a cinematic way after it lights after it becomes very
 *    light, remove the last frames"
 *  - "hero section loading should be more cinematic, maybe also it start by
 *    coming from the bottom like the motion of the rest of the website but
 *    without scrolling, then the experience starts once the hero section is
 *    fully visible and people can start scrolling"
 *
 * Flow:
 *  1. Mount: paused video, first frame visible (wax seal poster). Subtle
 *     breathing pulse + cursor=pointer hint at tappability. Body locked.
 *  2. Tap anywhere → video.play(). The pulse stops.
 *  3. timeupdate watches for the white peak (~t=4.3s — verified via ffmpeg
 *     signalstats: luminance climbs from 156 → 217 between 4.0–4.6s then
 *     drops back as the video "lands"). The LAST frames are skipped — when
 *     t reaches WHITE_PEAK, we trigger finish() instead of waiting for
 *     `ended`.
 *  4. finish():
 *     a. Hero card + canvas pre-set to y:60vh opacity:0 BEFORE the fade so
 *        they can rise from below into place (same paper-stack motion as
 *        the rest of the site, but without scrolling).
 *     b. Gate fades to white (1.0s) — feels like the brightness keeps
 *        climbing past the video's last visible frame.
 *     c. Music dispatches at the bright peak (mid-fade, -0.4s offset).
 *     d. Hero rises from y:60vh→0 with `power3.out` over 1.6s, slightly
 *        OVERLAPPING the gate fade so the transition is one continuous
 *        motion rather than fade-then-rise.
 *     e. Body unlocked once hero is in place — scrolling enabled.
 *  5. sessionStorage flag prevents replay on same-tab reload.
 */
const FLAG = "video-gate-passed-v1";
// Verified via `ffmpeg signalstats`: peak luminance at ~4.4s, then the video
// dips back as it "lands". We hard-cut at 4.3s and let our own fade carry the
// brightness the rest of the way.
const WHITE_PEAK_SECONDS = 4.3;

export default function VideoGate() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const pulseRef = useRef<HTMLDivElement>(null);
  const triggeredRef = useRef(false);
  const [skip, setSkip] = useState(false);
  const [removed, setRemoved] = useState(false);
  const [playing, setPlaying] = useState(false);

  // First mount — session flag + body lock + pre-set hero offstage
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (sessionStorage.getItem(FLAG) === "1") {
      setSkip(true);
      setRemoved(true);
      document.documentElement.classList.add("aj-gate-passed");
      // Returning visitor — gate was already passed earlier in this
      // session. Still dispatch aj-music-start so the audio resumes
      // when the FIRST user interaction this load happens (browser
      // autoplay-policy permitting). AudioPlayer handles the play()-
      // rejected fallback via first-gesture listener.
      window.dispatchEvent(new Event("aj-music-start"));
      return;
    }

    document.body.style.overflow = "hidden";

    // Hero plays its own entrance animation on mount and settles to
    // y:0,opacity:1 behind the opaque gate within ~3s. When the user taps
    // (possibly seconds or minutes later), we snap hero offstage at the
    // moment finish() fires and animate it back up — invisible behind the
    // still-opaque gate, so the user only sees the rise during the fade.
    // (See finish() below.)

    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Fade in the gate itself + start the tap-cue breathing pulse
  useEffect(() => {
    if (skip) return;
    if (!wrapRef.current) return;

    gsap.fromTo(
      wrapRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.7, ease: "power2.out" }
    );

    // Subtle breathing on the tap cue — only fires until first interaction
    if (pulseRef.current) {
      gsap.to(pulseRef.current, {
        scale: 1.06,
        opacity: 0.75,
        duration: 1.6,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
    }
  }, [skip]);

  const handleStart = () => {
    if (playing) return;
    setPlaying(true);
    if (pulseRef.current) gsap.killTweensOf(pulseRef.current);
    if (pulseRef.current) gsap.to(pulseRef.current, { opacity: 0, duration: 0.4 });
    videoRef.current?.play().catch(() => {
      // If play() is blocked despite the user tap, skip directly to hero.
      finish();
    });
  };

  const handleTimeUpdate = () => {
    if (triggeredRef.current) return;
    if (!videoRef.current) return;
    if (videoRef.current.currentTime >= WHITE_PEAK_SECONDS) {
      triggeredRef.current = true;
      finish();
    }
  };

  function finish() {
    if (!wrapRef.current) {
      cleanup();
      return;
    }

    // Hide the SSR prepaint cover BEFORE the gate fade starts. Otherwise
    // the wax-seal poster sits at z=99 BEHIND the gate (z=100) — and once
    // the gate fades to opacity:0, the seal re-appears mid-fade for a
    // beat before we finally remove it in cleanup(). Hiding it now means
    // the fade reveals the hero directly. (Anthony 2026-05-17 v18.)
    document.documentElement.classList.add("aj-gate-passed");

    const heroCard = document.querySelector(".hero-card");
    const heroFrame = document.querySelector(".hero-frame-wrap");

    // Snap hero offstage INSTANTLY — invisible to the user because the
    // opaque gate is still covering everything. Then we rise it during the
    // fade.
    if (heroCard) gsap.set(heroCard, { y: "60vh", opacity: 0 });
    if (heroFrame) gsap.set(heroFrame, { y: "30vh", opacity: 0.25, scale: 1.04 });

    const tl = gsap.timeline({ onComplete: cleanup });

    // Gate fades to white-out feel. We start the hero rise BEFORE the gate
    // is fully gone so the motion overlaps and reads as one continuous gesture.
    tl.to(
      wrapRef.current,
      {
        opacity: 0,
        duration: 1.1,
        ease: "power2.inOut",
      },
      0
    );

    // Music swells with the brightness peak — slightly ahead of the gate
    // fade's midpoint so audio is already present when the visual clears.
    tl.add(() => {
      window.dispatchEvent(new Event("aj-music-start"));
    }, 0.2);

    // Hero canvas pushes in first (subtle, behind the card)
    if (heroFrame) {
      tl.to(
        heroFrame,
        {
          y: 0,
          opacity: 1,
          scale: 1.0,
          duration: 1.8,
          ease: "power3.out",
        },
        0.15
      );
    }

    // Hero card rises last, all the way from below — like the paper-stack
    // motion the rest of the page uses, but driven by time not scroll.
    if (heroCard) {
      tl.to(
        heroCard,
        {
          y: 0,
          opacity: 1,
          duration: 1.6,
          ease: "power3.out",
        },
        0.35
      );
    }
  }

  function cleanup() {
    sessionStorage.setItem(FLAG, "1");
    document.body.style.overflow = "";
    document.documentElement.classList.remove("aj-prepaint-gate");
    document.documentElement.classList.add("aj-gate-passed");
    setRemoved(true);
  }

  if (removed) return null;

  return (
    <div
      ref={wrapRef}
      className="fixed inset-0 z-[100] bg-black"
      style={{ opacity: 0, cursor: playing ? "default" : "pointer" }}
      aria-label="Tap the wax seal to open the invitation"
      role="button"
      onClick={handleStart}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-cover pointer-events-none"
        src="/video/opener.mp4"
        poster="/video/opener-poster.jpg"
        muted
        playsInline
        preload="auto"
        onTimeUpdate={handleTimeUpdate}
      />
      {/* Breathing tap-cue ring — centered, soft gold, only visible until
          the user taps. Pure visual hint, no text per the brief. */}
      {!playing && (
        <div
          ref={pulseRef}
          aria-hidden
          className="absolute left-1/2 top-1/2 pointer-events-none"
          style={{
            width: 72,
            height: 72,
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
            border: "1.5px solid rgba(212, 184, 122, 0.65)",
            boxShadow:
              "0 0 32px rgba(212, 184, 122, 0.35), inset 0 0 24px rgba(212, 184, 122, 0.25)",
            opacity: 0.6,
          }}
        />
      )}
    </div>
  );
}
