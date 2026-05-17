"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

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
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".faq-eyebrow", {
        y: 12,
        opacity: 0,
        duration: 0.7,
        ease: "power2.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
      });
      gsap.from(".faq-title", {
        y: 18,
        opacity: 0,
        scale: 0.97,
        duration: 1.0,
        ease: "power3.out",
        delay: 0.1,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
      });
      gsap.from(".faq-rule", {
        scaleX: 0,
        transformOrigin: "center",
        duration: 0.8,
        ease: "power2.out",
        delay: 0.3,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
      });
      gsap.from(".faq-row", {
        y: 16,
        opacity: 0,
        duration: 0.7,
        stagger: 0.08,
        ease: "power2.out",
        delay: 0.3,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
      });
    }, sectionRef);
    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="faq"
      className="min-h-[100svh] flex flex-col justify-center px-6 py-10 sm:py-20 bg-cream"
    >
      <div className="max-w-2xl mx-auto w-full">
        <div className="text-center mb-6 sm:mb-12">
          <p className="faq-eyebrow text-xs uppercase tracking-[0.4em] text-olive-deep mb-3">
            Details
          </p>
          <h2 className="faq-title font-display text-3xl sm:text-5xl md:text-6xl text-ink">
            A few questions
          </h2>
          <div className="faq-rule w-16 h-px bg-gold mx-auto mt-5" />
        </div>
        <div className="space-y-1">
          {faqs.map((f, i) => (
            <button
              key={i}
              onClick={() => setOpen(open === i ? null : i)}
              className="faq-row w-full text-left border-b border-ink/10 py-3 sm:py-5 group"
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
