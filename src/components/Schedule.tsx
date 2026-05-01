"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

const events = [
  { time: "TBD", label: "Ceremony", note: "Couvent Saint Jean" },
  { time: "TBD", label: "Cocktail", note: "Garden terrace" },
  { time: "TBD", label: "Dinner", note: "Main hall" },
  { time: "TBD", label: "Dancing", note: "Until late" },
];

export default function Schedule() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".sched-row", {
        x: -20,
        opacity: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: "power2.out",
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
      id="schedule"
      className="py-32 px-6 bg-parchment/40"
    >
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-[0.4em] text-olive-deep mb-4">
            The day
          </p>
          <h2 className="font-display text-5xl md:text-6xl text-ink">
            18 July 2026
          </h2>
          <div className="w-16 h-px bg-gold mx-auto mt-8" />
        </div>

        <div className="space-y-1">
          {events.map((e, i) => (
            <div
              key={i}
              className="sched-row grid grid-cols-[80px_1fr] sm:grid-cols-[120px_1fr] gap-6 py-6 border-b border-ink/10 last:border-b-0"
            >
              <div className="font-display text-2xl text-gold">{e.time}</div>
              <div>
                <p className="font-display text-2xl text-ink">{e.label}</p>
                <p className="text-sm text-body/70 mt-1">{e.note}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-body/50 italic text-center mt-8">
          Times will be confirmed closer to the date.
        </p>
      </div>
    </section>
  );
}
