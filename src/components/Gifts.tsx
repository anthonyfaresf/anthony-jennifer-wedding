"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

/**
 * Gifts — replaces the placeholder FAQ section per Anthony 2026-05-17.
 *
 * Single-message, registry-as-aside, copy verbatim from Anthony:
 *   "we are so excited to have you join our special day and your presence at
 *    our wedding is the best gift we could ask for. however, for those who
 *    wish, a wedding registry is available at whish money, account no:
 *    20939489-03."
 */
export default function Gifts() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".gifts-eyebrow", {
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
      gsap.from(".gifts-title", {
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
      gsap.from(".gifts-rule", {
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
      gsap.from(".gifts-body", {
        y: 16,
        opacity: 0,
        duration: 0.9,
        ease: "power2.out",
        delay: 0.4,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
      });
      gsap.from(".gifts-card", {
        y: 22,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        delay: 0.55,
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
      id="gifts"
      className="min-h-[100svh] flex flex-col justify-center px-6 py-10 sm:py-20 bg-cream"
    >
      <div className="max-w-xl mx-auto w-full text-center">
        <p className="gifts-eyebrow text-xs uppercase tracking-[0.4em] text-olive-deep mb-3">
          Gifts
        </p>
        <h2 className="gifts-title font-display text-3xl sm:text-5xl md:text-6xl text-ink">
          Your presence is the gift
        </h2>
        <div className="gifts-rule w-16 h-px bg-gold mx-auto mt-5 mb-7" />
        <p className="gifts-body text-body leading-relaxed sm:text-lg mb-8">
          We are so excited to have you join our special day, and your presence
          at our wedding is the best gift we could ask for.
        </p>
        <div
          className="gifts-card inline-block px-7 py-6 sm:px-10 sm:py-7 border border-olive-deep/20 bg-cream/40 backdrop-blur-[2px]"
        >
          <p className="text-xs uppercase tracking-[0.35em] text-olive-deep mb-3">
            For those who wish
          </p>
          <p className="font-display text-2xl sm:text-3xl text-ink mb-1">
            Whish Money
          </p>
          <p className="text-body/85 leading-relaxed">
            Account no.{" "}
            <span className="text-ink tabular-nums tracking-wide font-medium">
              20939489-03
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
