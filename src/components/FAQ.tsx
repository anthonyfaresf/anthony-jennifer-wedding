"use client";

import { useState } from "react";

const faqs = [
  {
    q: "What's the dress code?",
    a: "[Cocktail attire / formal / black-tie — confirm with Anthony.] Comfortable shoes recommended for the courtyard.",
  },
  {
    q: "Are children welcome?",
    a: "[Confirm: adults-only / children welcome / family-friendly with kids' table.]",
  },
  {
    q: "Will there be parking on-site?",
    a: "Yes — Couvent Saint Jean has on-site parking. Arrive 20 minutes before the ceremony to settle in.",
  },
  {
    q: "I'm flying in. Hotel suggestions?",
    a: "[Hotel recommendations + nearest airport + transport notes — confirm and fill.]",
  },
  {
    q: "Gifts?",
    a: "Your presence is the gift. If you'd like to contribute, a registry / cash fund link will be added closer to the date.",
  },
  {
    q: "Can I bring a +1?",
    a: "Plus-ones are listed individually on the invitation. Use the RSVP form above to add their name.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section id="faq" className="py-32 px-6 bg-cream">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-[0.4em] text-olive-deep mb-4">
            Details
          </p>
          <h2 className="font-display text-5xl md:text-6xl text-ink">
            A few questions
          </h2>
          <div className="w-16 h-px bg-gold mx-auto mt-8" />
        </div>
        <div className="space-y-2">
          {faqs.map((f, i) => (
            <button
              key={i}
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full text-left border-b border-ink/10 py-6 group"
            >
              <div className="flex justify-between items-start gap-6">
                <p className="text-base sm:text-lg text-ink group-hover:text-olive-deep transition-colors leading-snug tracking-wide">
                  {f.q}
                </p>
                <span
                  className={`text-gold text-2xl transition-transform leading-none ${
                    open === i ? "rotate-45" : ""
                  }`}
                >
                  +
                </span>
              </div>
              <div
                className={`grid transition-all duration-500 ease-out ${
                  open === i
                    ? "grid-rows-[1fr] opacity-100 mt-4"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="text-body leading-relaxed pr-12">{f.a}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
