"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Confetti from "./Confetti";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

/**
 * RSVP — Accept / Regretfully decline · 1 or 2 guests · n8n-backed.
 *
 * Wording cribbed from canonical 2026 wedding-site references (Riley & Grey,
 * The Knot Marble, Greenvelope, Minted): "Joyfully accepting" / "Regretfully
 * declining" instead of yes/no buttons; "Number of guests" instead of party
 * size; "Companion" framing for plus-one. Elegant + clear + no marketing
 * tone.
 *
 * Webhook (live, published 2026-05-17):
 *   POST https://n8n.srv1295871.hstgr.cloud/webhook/wedding-rsvp
 *   workflow id: oji3wqrZEHuCRIBX · CORS allowedOrigins:*
 *
 * Required: first_name, last_name, phone, attending. Plus-one fields only
 * sent when party_size === 2.
 */
const WEBHOOK_URL = "https://n8n.srv1295871.hstgr.cloud/webhook/wedding-rsvp";

type Attending = "yes" | "no" | null;

export default function RSVP() {
  const sectionRef = useRef<HTMLElement>(null);
  const [attending, setAttending] = useState<Attending>(null);
  const [partySize, setPartySize] = useState<1 | 2>(1);
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
        stagger: 0.08,
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
    if (!attending) return;
    setSubmitting(true);
    setDone(null);
    const fd = new FormData(e.currentTarget);
    const payload: Record<string, string | number> = {
      first_name: String(fd.get("first_name") || "").trim(),
      last_name: String(fd.get("last_name") || "").trim(),
      phone: String(fd.get("phone") || "").trim(),
      attending,
      party_size: attending === "yes" ? partySize : 0,
      honeypot: String(fd.get("honeypot") || ""),
    };
    if (attending === "yes" && partySize === 2) {
      payload.plus_one_first_name = String(fd.get("plus_one_first_name") || "").trim();
      payload.plus_one_last_name = String(fd.get("plus_one_last_name") || "").trim();
    }
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
        <Confetti play={attending === "yes"} count={attending === "yes" ? 32 : 0} fullViewport={false} />
        <div className="max-w-md mx-auto text-center relative z-10">
          <p className="text-xs uppercase tracking-[0.4em] text-olive-deep mb-4">
            {attending === "yes" ? "With joy" : "With thanks"}
          </p>
          <h2 className="font-display text-4xl sm:text-5xl text-ink mb-4">
            {attending === "yes" ? "We can't wait." : "We'll miss you."}
          </h2>
          <div className="w-16 h-px bg-gold mx-auto my-6" />
          <p className="text-body leading-relaxed">
            {attending === "yes"
              ? "Your reply is saved. We'll be in touch with the final details closer to the day."
              : "Thank you for letting us know. If anything changes, send us a WhatsApp — you'll always be welcome."}
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
          <p className="text-body/70 mt-4 text-sm italic">
            Kindly reply with your details below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 relative">
          {/* Honeypot — bots fill it, humans don't see it */}
          <div className="absolute -left-[9999px]" aria-hidden>
            <label>
              Don&apos;t fill this:
              <input type="text" name="honeypot" tabIndex={-1} autoComplete="off" />
            </label>
          </div>

          <div className="rsvp-field grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setAttending("yes")}
              className={`text-[11px] sm:text-xs uppercase tracking-[0.25em] py-3 transition-colors border ${
                attending === "yes"
                  ? "bg-olive-deep text-cream border-olive-deep"
                  : "bg-transparent text-olive-deep border-olive-deep/30 hover:border-olive-deep"
              }`}
              aria-pressed={attending === "yes"}
            >
              Joyfully accept
            </button>
            <button
              type="button"
              onClick={() => setAttending("no")}
              className={`text-[11px] sm:text-xs uppercase tracking-[0.25em] py-3 transition-colors border ${
                attending === "no"
                  ? "bg-ink text-cream border-ink"
                  : "bg-transparent text-ink/70 border-ink/30 hover:border-ink"
              }`}
              aria-pressed={attending === "no"}
            >
              Regretfully decline
            </button>
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

          {/* Number of guests — only when accepting */}
          {attending === "yes" && (
            <div className="rsvp-field">
              <p className="block text-xs uppercase tracking-[0.3em] text-olive-deep mb-3">
                Number of guests
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPartySize(1)}
                  className={`text-[11px] sm:text-xs uppercase tracking-[0.25em] py-2.5 transition-colors border ${
                    partySize === 1
                      ? "bg-olive-deep text-cream border-olive-deep"
                      : "bg-transparent text-olive-deep border-olive-deep/30 hover:border-olive-deep"
                  }`}
                  aria-pressed={partySize === 1}
                >
                  Just me
                </button>
                <button
                  type="button"
                  onClick={() => setPartySize(2)}
                  className={`text-[11px] sm:text-xs uppercase tracking-[0.25em] py-2.5 transition-colors border ${
                    partySize === 2
                      ? "bg-olive-deep text-cream border-olive-deep"
                      : "bg-transparent text-olive-deep border-olive-deep/30 hover:border-olive-deep"
                  }`}
                  aria-pressed={partySize === 2}
                >
                  Me &amp; a companion
                </button>
              </div>
            </div>
          )}

          {/* Companion name fields — only when accepting for 2 */}
          {attending === "yes" && partySize === 2 && (
            <>
              <div className="rsvp-field">
                <label
                  htmlFor="rsvp-po-first"
                  className="block text-xs uppercase tracking-[0.3em] text-olive-deep mb-2"
                >
                  Companion&apos;s first name
                </label>
                <input
                  id="rsvp-po-first"
                  name="plus_one_first_name"
                  type="text"
                  required
                  className="w-full bg-transparent border-b border-ink/20 focus:border-olive-deep py-2 text-ink text-base outline-none transition-colors"
                />
              </div>
              <div className="rsvp-field">
                <label
                  htmlFor="rsvp-po-last"
                  className="block text-xs uppercase tracking-[0.3em] text-olive-deep mb-2"
                >
                  Companion&apos;s family name
                </label>
                <input
                  id="rsvp-po-last"
                  name="plus_one_last_name"
                  type="text"
                  required
                  className="w-full bg-transparent border-b border-ink/20 focus:border-olive-deep py-2 text-ink text-base outline-none transition-colors"
                />
              </div>
            </>
          )}

          <div className="rsvp-field pt-4">
            <button
              type="submit"
              disabled={submitting || !attending}
              className="w-full text-xs uppercase tracking-[0.3em] text-cream bg-olive-deep hover:bg-olive disabled:opacity-40 disabled:cursor-not-allowed px-5 py-3.5 transition-colors"
            >
              {submitting
                ? "Sending..."
                : !attending
                ? "Choose a response above"
                : attending === "yes"
                ? "Send our acceptance"
                : "Send our regrets"}
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
