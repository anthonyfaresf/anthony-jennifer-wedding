"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * Confetti — tasteful petal-drift particle burst.
 *
 * Per SYNTHESIS-v3 TIER 1 #5. Uses gold + cream + olive small SVG petals
 * (NOT plastic-rainbow confetti). Mounts when `play` flips to true,
 * generates N particles, falls + drifts + fades, auto-cleans after 4s.
 *
 * Usage:
 *   const [burst, setBurst] = useState(false);
 *   ...trigger setBurst(true) on success / on hero name reveal complete...
 *   <Confetti play={burst} count={28} />
 */
type Props = {
  play: boolean;
  count?: number;
  /** Container is `fixed inset-0` (full viewport) by default. Set false to use absolute (relative to nearest positioned parent). */
  fullViewport?: boolean;
};

const PETAL_COLORS = ["#b8924a", "#d4b87a", "#f4ece0", "#6e7a3a", "#e8ddc8"];

export default function Confetti({ play, count = 25, fullViewport = true }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!play) return;
    const container = containerRef.current;
    if (!container) return;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduceMotion) return;

    const particles: HTMLSpanElement[] = [];

    for (let i = 0; i < count; i++) {
      const p = document.createElement("span");
      const size = 6 + Math.random() * 8;
      const color = PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)];
      p.style.cssText = `position:absolute;top:-20px;left:${Math.random() * 100}%;width:${size}px;height:${size * 1.4}px;background:${color};border-radius:60% 40% 60% 40% / 50% 60% 40% 50%;opacity:0;pointer-events:none;transform:translate(0,0) rotate(${Math.random() * 360}deg);`;
      container.appendChild(p);
      particles.push(p);

      const driftX = (Math.random() - 0.5) * 240;
      const fallY = window.innerHeight * (0.55 + Math.random() * 0.45);
      const rotateEnd = Math.random() * 720 - 360;
      const delay = Math.random() * 0.6;
      const duration = 2.4 + Math.random() * 1.6;

      gsap.to(p, {
        opacity: 0.88,
        duration: 0.25,
        delay,
        ease: "power1.out",
      });
      gsap.to(p, {
        y: fallY,
        x: driftX,
        rotate: rotateEnd,
        duration,
        delay,
        ease: "sine.out",
      });
      gsap.to(p, {
        opacity: 0,
        duration: 0.6,
        delay: delay + duration - 0.6,
        ease: "power2.out",
      });
    }

    const cleanup = setTimeout(() => {
      particles.forEach((p) => p.remove());
    }, 4500);

    return () => {
      clearTimeout(cleanup);
      particles.forEach((p) => p.remove());
    };
  }, [play, count]);

  return (
    <div
      ref={containerRef}
      aria-hidden
      className={
        fullViewport
          ? "fixed inset-0 pointer-events-none z-[60] overflow-hidden"
          : "absolute inset-0 pointer-events-none z-50 overflow-hidden"
      }
    />
  );
}
