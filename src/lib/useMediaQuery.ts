"use client";

import { useEffect, useState } from "react";

/**
 * useMediaQuery — boolean state synced to a CSS media query.
 *
 * Returns `false` until the component mounts (avoids SSR hydration mismatch
 * where window is unavailable). After mount, reflects the live match status
 * and re-renders on changes (e.g., user resizes across the breakpoint, or
 * rotates a tablet).
 *
 * Usage:
 *   const isDesktop = useMediaQuery("(min-width: 768px)");
 *
 * Notes (per the 2026-05-02 wedding-site dual-orientation pass):
 *   - Story scenes use this to swap between vertical (mobile) and horizontal
 *     (desktop) frame folders. The component using it should also gate first
 *     paint on a `mounted` flag so it doesn't render frames at the wrong
 *     orientation between SSR and hydration.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia(query);
    setMatches(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}
