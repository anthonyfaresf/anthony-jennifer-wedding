"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Confetti from "./Confetti";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

/**
 * RSVP — Minimal 3-field form per Anthony 2026-05-17.
 *
 * Posts directly to the n8n webhook at `n8n.srv1295871.hstgr.cloud/webhook/wedding-rsvp`
 * (workflow: "Wedding RSVP - Sheet + Telegram (Jennifer)"). The webhook
 * declares `allowedOrigins: "*"` + CORS headers, so browser → n8n direct.
 *
 * Fields submitted:
 *   first_name (required, ≥1 char)
 *   last_name  (required, ≥1 char)
 *   phone      (any format — n8n strips to E.164)
 *   attending  (defaults to "yes" — the form copy is "Will you join us?")
 *   honeypot   (hidden — must stay empty)
 */
const WEBHOOK_URL = "https://n8n.srv1295871.hstgr.cloud/webhook/wedding-rsvp";

export default function RSVP() {
  const sectionRef = useRef<HTMLElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<null | "ok" | "err">(null);
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".rsvp-eyebrow", {
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
      gsap.from(".rsvp-title", {
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
      gsap.from(".rsvp-rule", {
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
      gsap.from(".rsvp-field", {
        y: 16,
        opacity: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: "power2.out",
        delay: 0.35,
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setDone(null);
    const fd = new FormData(e.currentTarget);
    const payload = {
      first_name: String(fd.get("first_name") || "").trim(),
      last_name: String(fd.get("last_name") || "").trim(),
      phone: String(fd.get("phone") || "").trim(),
      attending: "yes",
      honeypot: String(fd.get("honeypot") || ""),
    };
    try {
      const r = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || j?.ok === false) {
        throw new Error(j?.error || `HTTP ${r.status}`);
      }
      setDone("ok");
    } catch (err) {
      setDone("err");
      setErrMsg(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSubmitting(false);
    }
  };

  if (done === "ok") {
    return (
      <section
        ref={sectionRef}
        id="rsvp"
        className="min-h-[100svh] flex flex-col justify-center px-6 py-10 sm:py-20 relative overflow-hidden bg-cream"
      >
        <Confetti play={true} count={32} fullViewport={false} />
        <div className="max-w-md mx-auto text-center relative z-10">
          <p className="text-xs uppercase tracking-[0.4em] text-olive-deep mb-4">
            See you there
          </p>
          <h2 className="font-display text-4xl sm:text-5xl text-ink mb-4">
            We can&apos;t wait.
          </h2>
          <div className="w-16 h-px bg-gold mx-auto my-6" />
          <p className="text-body leading-relaxed">
            Your RSVP is saved. If anything changes, send Anthony or Jennifer a
            WhatsApp directly and we&apos;ll update your details.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      id="rsvp"
      className="min-h-[100svh] flex flex-col justify-center px-6 py-10 sm:py-20 bg-cream"
    >
      <div className="max-w-md mx-auto w-full">
        <div className="text-center mb-6 sm:mb-10">
          <p className="rsvp-eyebrow text-xs uppercase tracking-[0.4em] text-olive-deep mb-3">
            RSVP
          </p>
          <h2 className="rsvp-title font-display text-3xl sm:text-5xl md:text-6xl text-ink">
            Will you join us?
          </h2>
          <div className="rsvp-rule w-16 h-px bg-gold mx-auto mt-5" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 relative">
          {/* Honeypot — bots fill it, humans don't see it */}
          <div className="absolute -left-[9999px]" aria-hidden>
            <label>
              Don&apos;t fill this:
              <input type="text" name="honeypot" tabIndex={-1} autoComplete="off" />
            </label>
          </div>

          <div className="rsvp-field">
            <label
              htmlFor="rsvp-first"
              className="block text-xs uppercase tracking-[0.3em] text-olive-deep mb-2"
            >
              First name
            </label>
            <input
              id="rsvp-first"
              name="first_name"
              type="text"
              required
              autoComplete="given-name"
              className="w-full bg-transparent border-b border-ink/20 focus:border-olive-deep py-2 text-ink text-base outline-none transition-colors"
            />
          </div>

          <div className="rsvp-field">
            <label
              htmlFor="rsvp-last"
              className="block text-xs uppercase tracking-[0.3em] text-olive-deep mb-2"
            >
              Family name
            </label>
            <input
              id="rsvp-last"
              name="last_name"
              type="text"
              required
              autoComplete="family-name"
              className="w-full bg-transparent border-b border-ink/20 focus:border-olive-deep py-2 text-ink text-base outline-none transition-colors"
            />
          </div>

          <div className="rsvp-field">
            <label
              htmlFor="rsvp-phone"
              className="block text-xs uppercase tracking-[0.3em] text-olive-deep mb-2"
            >
              Phone
            </label>
            <input
              id="rsvp-phone"
              name="phone"
              type="tel"
              required
              autoComplete="tel"
              inputMode="tel"
              placeholder="+961 ..."
              className="w-full bg-transparent border-b border-ink/20 focus:border-olive-deep py-2 text-ink text-base outline-none transition-colors placeholder:text-ink/30"
            />
          </div>

          <div className="rsvp-field pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full text-xs uppercase tracking-[0.3em] text-cream bg-olive-deep hover:bg-olive disabled:opacity-50 px-5 py-3.5 transition-colors"
            >
              {submitting ? "Sending..." : "Confirm RSVP"}
            </button>
          </div>

          {done === "err" && (
            <p className="text-xs text-red-700 text-center pt-2">
              Couldn&apos;t send: {errMsg}. Please try again or WhatsApp Anthony directly.
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
