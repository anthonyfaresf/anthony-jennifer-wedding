"use client";

import { useEffect, useState } from "react";

/**
 * StickyNav — pill-shaped section navigation that fades in after the user
 * scrolls past the hero, then highlights the active section via
 * IntersectionObserver. Mobile-first: compact pill, scrollable horizontally
 * if items overflow, 44×44 minimum tap targets per WCAG.
 *
 * Per SYNTHESIS-v3 + 2026 wedding-site research (Riley & Grey + Bliss & Bone
 * + Knot Marble) — sticky pill nav with active-state highlight is the
 * canonical wayfinding pattern for long-scroll single-page wedding sites.
 *
 * The nav does NOT appear over the envelope gate (envelope uses z-60, this
 * uses z-40 + appears below hero scroll trigger, which is gated behind the
 * envelope being dismissed via sessionStorage).
 */
/**
 * Section IDs must match what's actually rendered in page.tsx. Old list
 * pointed at id="story" which no longer exists (Story now slices into
 * story-scene-0 / 1 / 2). Per Anthony 2026-05-16: 'the navigation is
 * not in sync with the rest of the website.' Active-state highlight
 * was firing on the wrong slot because the IntersectionObserver
 * couldn't find the old IDs.
 */
const SECTIONS = [
  { id: "countdown", label: "Date" },
  { id: "story-scene-0", label: "Day" },
  { id: "rsvp", label: "RSVP" },
  { id: "gifts", label: "Gifts" },
  { id: "venue", label: "Venue" },
];

export default function StickyNav() {
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  // Fade in after the user scrolls past the hero (~80vh) AND after the
  // envelope is dismissed.
  useEffect(() => {
    const onScroll = () => {
      const past = window.scrollY > window.innerHeight * 0.7;
      setVisible(past);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Active-section detection per Anthony 2026-05-17 v20 (fix nav up+down).
  // Simple + correct: pick the section whose document offsetTop is the
  // LARGEST value still ≤ the current scrollY (plus a small probe so the
  // section activates as soon as its top hits the viewport top). This
  // works identically scrolling up and down, and handles the gap slots
  // (story-scene-1 isn't in the nav list — when the user is reading the
  // reception verse, the previously-active "RSVP" stays lit until the
  // next nav-listed section's top crosses the line).
  useEffect(() => {
    const items = SECTIONS.map((s) => ({
      id: s.id,
      el: document.getElementById(s.id),
    })).filter((s) => s.el) as { id: string; el: HTMLElement }[];
    if (!items.length) return;

    let raf = 0;
    const measure = () => {
      raf = 0;
      const line = window.scrollY + 4;
      let best: { id: string; top: number } | null = null;
      for (const { id, el } of items) {
        const top = el.getBoundingClientRect().top + window.scrollY;
        if (top <= line && (!best || top > best.top)) {
          best = { id, top };
        }
      }
      if (best) setActive(best.id);
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const handleJump = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav
      aria-label="Wedding sections"
      className={`fixed left-1/2 -translate-x-1/2 z-40 transition-all duration-500 ease-out ${
        visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-3 pointer-events-none"
      }`}
      style={{
        top: "max(env(safe-area-inset-top), 16px)",
      }}
    >
      {/* Mobile: tighter tracking + smaller font so all 5 items fit a
          320–414px viewport without scroll. Desktop unchanged.
          Per 4-brain 2026-05-16: discoverability beats hamburger drawer
          for a single-page wedding site — all items visible, zero clicks. */}
      <ul
        className="flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-1.5 rounded-full max-w-[calc(100vw-1rem)] sm:max-w-[calc(100vw-2rem)] overflow-x-auto"
        style={{
          background: "rgba(244, 236, 224, 0.94)",
          backdropFilter: "blur(14px) saturate(1.1)",
          WebkitBackdropFilter: "blur(14px) saturate(1.1)",
          border: "1px solid rgba(73, 83, 20, 0.14)",
          boxShadow:
            "0 8px 28px -12px rgba(43, 43, 43, 0.25), 0 2px 8px -2px rgba(43, 43, 43, 0.12)",
          scrollbarWidth: "none",
        }}
      >
        {SECTIONS.map((s) => {
          const isActive = active === s.id;
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => handleJump(s.id)}
                aria-current={isActive ? "true" : undefined}
                className={`px-2 sm:px-4 py-1.5 sm:py-2 text-[9.5px] sm:text-xs uppercase tracking-[0.10em] sm:tracking-[0.22em] rounded-full transition-colors whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-cream ${
                  isActive
                    ? "text-cream bg-olive-deep"
                    : "text-olive-deep hover:bg-olive-deep/10"
                }`}
                style={{ minHeight: 32 }}
              >
                {s.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
