"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

export default function Venue() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".venue-reveal", {
        y: 30,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
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
    <section ref={sectionRef} id="venue" className="py-32 px-6 relative">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="venue-reveal text-xs uppercase tracking-[0.4em] text-olive-deep mb-4">
            Where
          </p>
          <h2 className="venue-reveal font-display text-5xl md:text-6xl text-ink">
            Couvent Saint Jean
          </h2>
          <p className="venue-reveal font-display text-2xl text-body italic mt-3">
            Okaibe, Lebanon
          </p>
          <div className="venue-reveal w-16 h-px bg-gold mx-auto mt-8" />
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="venue-reveal space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-olive-deep mb-2">
                Address
              </p>
              <p className="text-body leading-relaxed">
                Couvent Saint Jean
                <br />
                Okaibe, Mont Liban
                <br />
                Lebanon
              </p>
              <p className="text-xs text-body/60 mt-2 italic">
                Full address + Google Maps link arriving soon
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-olive-deep mb-2">
                Arrival
              </p>
              <p className="text-body leading-relaxed">
                Ceremony begins at [time TBD]. We recommend arriving 20 minutes
                early. Parking is available on-site.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <a
                href="https://maps.google.com/?q=Couvent+Saint+Jean+Okaibe+Lebanon"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-xs uppercase tracking-[0.3em] text-olive-deep hover:text-olive border border-olive-deep/30 hover:border-olive px-5 py-3 transition-colors"
              >
                Open in Maps
              </a>
              <a
                href="https://maps.google.com/?daddr=Couvent+Saint+Jean+Okaibe+Lebanon"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-xs uppercase tracking-[0.3em] text-cream bg-olive-deep hover:bg-olive px-5 py-3 transition-colors"
              >
                Get directions
              </a>
            </div>
          </div>

          {/* Map placeholder — swap for real Mapbox/Google embed */}
          <div className="venue-reveal aspect-square md:aspect-[4/5] bg-parchment rounded-sm overflow-hidden border border-ink/10">
            <iframe
              src="https://www.google.com/maps?q=Okaibe,+Lebanon&output=embed"
              className="w-full h-full grayscale"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Couvent Saint Jean Okaibe map"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
