"use client";

/**
 * SkipLink — first focusable element, jumps keyboard/screen-reader users
 * straight to the RSVP form. Hidden visually until focused.
 *
 * Per 2026 wedding-site accessibility research (The Knot Marble pattern):
 * skip links should target the primary action, not just "main content."
 */
export default function SkipLink() {
  return (
    <a
      href="#rsvp"
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[200] focus:px-4 focus:py-2 focus:bg-olive-deep focus:text-cream focus:rounded-md focus:text-sm focus:font-medium focus:tracking-wide"
      onClick={(e) => {
        // Smooth scroll for sighted keyboard users
        const el = document.getElementById("rsvp");
        if (el) {
          e.preventDefault();
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          el.focus({ preventScroll: true });
        }
      }}
    >
      Skip to RSVP
    </a>
  );
}
