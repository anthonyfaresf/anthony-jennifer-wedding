"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

/**
 * CalendarMark — small July 2026 grid with day 18 highlighted as the wedding.
 *
 * Per SYNTHESIS-v3 TIER 1 #2 — distinctive move from yallamabrook reference.
 * Reads as a physical save-the-date detail: month name in Blosta olive,
 * 7×5 grid of small numerals, day 18 ringed in gold with a "we marry" italic
 * caption below.
 *
 * Calendar logic: July 2026 starts on Wednesday (3 = day-of-week index).
 * 31 days. Days 1–31 placed left-to-right, top-to-bottom.
 */
export default function CalendarMark() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduceMotion) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });
      tl.from(".cal-title", { y: 18, opacity: 0, duration: 0.7, ease: "power3.out" })
        .from(
          ".cal-cell",
          { opacity: 0, y: 6, duration: 0.4, stagger: 0.012, ease: "power3.out" },
          "-=0.3"
        )
        .fromTo(
          ".cal-mark",
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.7, ease: "back.out(1.5)" },
          "-=0.2"
        )
        .from(
          ".cal-caption",
          { y: 14, opacity: 0, duration: 0.6, ease: "power2.out" },
          "-=0.3"
        );
    }, el);
    return () => ctx.revert();
  }, []);

  // July 2026 calendar layout: starts on Wednesday (Sun=0 index → 3 empty leading)
  const FIRST_WEEKDAY = 3; // Wednesday
  const DAYS_IN_JULY = 31;
  const cells: Array<number | null> = [];
  for (let i = 0; i < FIRST_WEEKDAY; i++) cells.push(null);
  for (let d = 1; d <= DAYS_IN_JULY; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div
      ref={ref}
      className="cal-wrap mx-auto max-w-xs sm:max-w-sm text-center"
      aria-label="July 2026 calendar showing wedding date 18 July highlighted"
    >
      <p
        className="cal-title text-olive-deep mb-1 uppercase"
        style={{ fontSize: "clamp(13px, 1.3vw, 15px)", letterSpacing: "0.4em" }}
      >
        July 2026
      </p>
      <div className="w-8 h-px bg-gold/60 mx-auto mb-5" />

      {/* Weekday header — bumped to 11px + /75 opacity for legibility (was 9px /55, failed AA) */}
      <div className="grid grid-cols-7 gap-1 mb-2 text-[11px] uppercase tracking-[0.22em] text-olive-deep/75 font-medium">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>

      {/* Date grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => (
          <div
            key={i}
            className="cal-cell relative aspect-square flex items-center justify-center text-xs sm:text-sm text-body/70 tabular-nums"
          >
            {d !== null && (
              <>
                <span className={d === 18 ? "text-display font-medium relative z-10" : ""}>
                  {d}
                </span>
                {d === 18 && (
                  <span
                    aria-hidden
                    className="cal-mark absolute inset-0 m-auto rounded-full pointer-events-none"
                    style={{
                      width: "85%",
                      height: "85%",
                      border: "1.5px solid var(--gold)",
                      boxShadow:
                        "0 1px 4px rgba(184,146,74,0.25), inset 0 0 0 1px rgba(244,236,224,0.4)",
                    }}
                  />
                )}
              </>
            )}
          </div>
        ))}
      </div>

      <p
        className="cal-caption mt-5 italic text-gold"
        style={{
          fontFamily: "var(--font-italianno), 'Italianno', cursive",
          fontSize: "clamp(22px, 2.4vw, 28px)",
        }}
      >
        we marry
      </p>
    </div>
  );
}
