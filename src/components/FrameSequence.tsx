"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

interface Props {
  /** Folder under /frames/, e.g. "hero-wine-cheers" */
  scene: string;
  /** Total frame count (named f-01.jpg through f-NN.jpg) */
  frameCount: number;
  /** Element whose scroll progress drives the frame index */
  triggerSelector: string;
  /** Tailwind className for the <canvas> */
  className?: string;
  /** object-position-style hint for desktop crop tuning ("center" / "top" / "bottom") */
  framing?: string;
  /** style override */
  style?: React.CSSProperties;
}

/**
 * Scroll-scrubbed frame sequence — CANVAS-BASED to eliminate the strobe / flash
 * that happens when you swap an <img>'s src on iOS Safari + Chrome (the browser
 * briefly drops opacity during the load even when frames are pre-cached).
 *
 * Strategy:
 *   1. Eager-preload every frame as an HTMLImageElement
 *   2. Bind scroll progress to a frame index
 *   3. On every onUpdate, draw the cached image to the canvas with a
 *      cover-fit calculation (replaces object-fit: cover on the old <img>)
 *
 * Result: smooth playback, no flash, mobile-safe.
 */
export function FrameSequence({
  scene,
  frameCount,
  triggerSelector,
  className,
  framing = "center",
  style,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const loadedRef = useRef<boolean[]>([]);
  const currentFrameRef = useRef<number>(0);

  // Translate framing keyword → object-position fraction (0 = top/left, 0.5 = center, 1 = bottom/right)
  const framingFracY = framing.includes("top") ? 0 : framing.includes("bottom") ? 1 : 0.5;

  // Preload all frames once
  useEffect(() => {
    if (typeof window === "undefined") return;
    imagesRef.current = [];
    loadedRef.current = new Array(frameCount).fill(false);

    for (let i = 1; i <= frameCount; i++) {
      const img = new window.Image();
      const idx = i - 1;
      img.onload = () => {
        loadedRef.current[idx] = true;
        // If this is the current frame, draw it now
        if (idx === currentFrameRef.current) drawFrame(idx);
      };
      img.src = `${BP}/frames/${scene}/f-${String(i).padStart(2, "0")}.jpg`;
      imagesRef.current.push(img);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, frameCount]);

  // Draw one frame to the canvas with a cover-fit calculation
  const drawFrame = (idx: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const img = imagesRef.current[idx];
    if (!img || !loadedRef.current[idx]) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Match canvas pixel size to display size × DPR for sharp output
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2); // cap at 2x to limit GPU load
    const targetW = Math.round(rect.width * dpr);
    const targetH = Math.round(rect.height * dpr);
    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    if (!iw || !ih) return;

    // object-fit: cover math
    const scale = Math.max(cw / iw, ch / ih);
    const sw = iw * scale;
    const sh = ih * scale;
    const x = (cw - sw) / 2;
    const y = (ch - sh) * framingFracY;

    // No clearRect needed — drawImage fully covers
    ctx.drawImage(img, x, y, sw, sh);
    currentFrameRef.current = idx;
  };

  // Bind scroll progress through the trigger element to the frame index
  useEffect(() => {
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const trigger = document.querySelector(triggerSelector) as HTMLElement | null;
    if (!trigger) return;

    const state = { frame: 0 };
    const tween = gsap.to(state, {
      frame: frameCount - 1,
      ease: "none",
      scrollTrigger: {
        trigger,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.6, // slightly higher than before — smooths fast-scroll reversal
      },
      onUpdate: () => {
        drawFrame(Math.round(state.frame));
      },
    });

    const onResize = () => drawFrame(currentFrameRef.current);
    window.addEventListener("resize", onResize);

    // Initial paint after mount
    requestAnimationFrame(() => drawFrame(0));

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      window.removeEventListener("resize", onResize);
    };
  }, [scene, frameCount, triggerSelector, framingFracY]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={className || ""}
      style={{ pointerEvents: "none", display: "block", ...style }}
    />
  );
}
