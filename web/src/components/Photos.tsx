"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

// Drop real photos at /public/photos/01.jpg ... 08.jpg
// Layout is masonry-style asymmetric — 3 columns on desktop, 1 on mobile.
const photos = [
  { src: "/photos/01.jpg", alt: "Anthony and Jennifer", aspect: "portrait" },
  { src: "/photos/02.jpg", alt: "Travel together", aspect: "landscape" },
  { src: "/photos/03.jpg", alt: "Engagement", aspect: "portrait" },
  { src: "/photos/04.jpg", alt: "Family", aspect: "square" },
  { src: "/photos/05.jpg", alt: "A quiet evening", aspect: "landscape" },
  { src: "/photos/06.jpg", alt: "Dancing", aspect: "portrait" },
];

export default function Photos() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".photo-item").forEach((el, i) => {
        gsap.from(el, {
          y: 50,
          opacity: 0,
          scale: 0.96,
          duration: 1,
          delay: (i % 3) * 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        });
      });
    }, sectionRef);
    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="photos"
      className="py-32 px-6 bg-parchment/40 relative"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-[0.4em] text-olive-deep mb-4">
            Moments
          </p>
          <h2 className="font-display text-5xl md:text-6xl text-ink">
            A few favourites
          </h2>
          <div className="w-16 h-px bg-gold mx-auto mt-8" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {photos.map((p, i) => (
            <div
              key={i}
              className={`photo-item relative overflow-hidden rounded-sm bg-cream ${
                p.aspect === "portrait"
                  ? "aspect-[3/4]"
                  : p.aspect === "landscape"
                    ? "aspect-[4/3]"
                    : "aspect-square"
              } ${i === 1 ? "md:col-span-2 md:row-span-1" : ""}`}
            >
              {/* Placeholder until real photos are dropped at /public/photos/ */}
              <div className="absolute inset-0 bg-gradient-to-br from-parchment to-cream flex items-center justify-center">
                <div className="text-center text-body/40">
                  <p className="text-xs uppercase tracking-[0.3em]">
                    Photo {String(i + 1).padStart(2, "0")}
                  </p>
                  <p className="text-[10px] mt-1 opacity-60">
                    Drop at {p.src}
                  </p>
                </div>
              </div>
              {/* When real photos arrive, swap the placeholder for: */}
              {/* <Image src={p.src} alt={p.alt} fill className="object-cover" /> */}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
