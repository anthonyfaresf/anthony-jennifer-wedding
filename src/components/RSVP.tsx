"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Confetti from "./Confetti";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

/**
 * RSVP — Accept / Regretfully decline · 1 or 2 guests · ceremony/party/both ·
 * n8n-backed.
 *
 * Per Anthony 2026-05-17:
 *  - "will you join us is very tall, the bottom section is barely visible" →
 *    section is `overflow-y: auto` so all fields are always reachable
 *  - "when someone presses with a companion they cant be filled" → fields
 *    scroll into view automatically as they appear
 *  - "section if they will attend the ceremony, or the party, or both, and
 *    this should reflect in n8n too and the sheet" → new `sections` field
 *    posted as `ceremony|party|both`; n8n workflow updated to accept it.
 *
 * Webhook: https://n8n.srv1295871.hstgr.cloud/webhook/wedding-rsvp
 * Workflow id: oji3wqrZEHuCRIBX · CORS allowedOrigins:*
 */
const WEBHOOK_URL = "https://n8n.srv1295871.hstgr.cloud/webhook/wedding-rsvp";

type Attending = "yes" | "no" | null;
type Sections = "ceremony" | "party" | "both" | null;

export default function RSVP() {
  const sectionRef = useRef<HTMLElement>(null);
  const fieldsRef = useRef<HTMLDivElement>(null);
  const [attending, setAttending] = useState<Attending>(null);
  const [partySize, setPartySize] = useState<1 | 2>(1);
  const [sections, setSections] = useState<Sections>(null);
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
        stagger: 0.06,
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

  // When accepting reveals more fields (sections, guest count, companion
  // names), scroll the fields region so the new rows come into view. The
  // submit button itself is always visible — it's pinned below this region.
  useEffect(() => {
    if (attending !== "yes") return;
    requestAnimationFrame(() => {
      const el = fieldsRef.current;
      if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    });
  }, [attending, partySize, sections]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!attending) return;
    if (attending === "yes" && !sections) {
      setDone("err");
      setErrMsg("Please pick what you'll be joining for.");
      return;
    }
    setSubmitting(true);
    setDone(null);
    const fd = new FormData(e.currentTarget);
    // Per Anthony 2026-05-17 v18 — companion fields back, but rendered
    // INLINE as a 2-col grid next to the host's name fields so they stay
    // in viewport. Sent only when partySize === 2.
    const payload: Record<string, string | number> = {
      first_name: String(fd.get("first_name") || "").trim(),
      last_name: String(fd.get("last_name") || "").trim(),
      phone: String(fd.get("phone") || "").trim(),
      attending,
      party_size: attending === "yes" ? partySize : 0,
      sections: attending === "yes" && sections ? sections : "",
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
        className="min-h-[100svh] flex flex-col justify-center px-6 py-8 relative overflow-hidden bg-cream"
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
      className="min-h-[100svh] max-h-[100svh] flex flex-col px-6 pt-20 pb-8 bg-cream overflow-hidden"
    >
      <div className="max-w-md mx-auto w-full flex flex-col min-h-0 flex-1">
        <div className="text-center mb-5 shrink-0">
          <p className="rsvp-eyebrow text-xs uppercase tracking-[0.4em] text-olive-deep mb-2">
            RSVP
          </p>
          <h2 className="rsvp-title font-display text-3xl sm:text-4xl text-ink leading-tight">
            Will you join us?
          </h2>
          <div className="rsvp-rule w-12 h-px bg-gold mx-auto mt-4" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1">
          {/* Scrollable fields region — keeps the submit button pinned and
              always visible below it, even on short phones. Per Anthony
              2026-05-18: friends couldn't find the submit button on mobile
              because the section grew past the viewport inside the sticky
              paper-slot and the button was clipped below the fold. The fields
              now scroll here; the button (outside this region) never moves. */}
          <div
            ref={fieldsRef}
            className="space-y-3.5 overflow-y-auto overscroll-contain min-h-0 flex-1 relative pr-0.5"
          >
          {/* Honeypot — bots fill it, humans don't see it */}
          <div className="absolute -left-[9999px]" aria-hidden>
            <label>
              Don&apos;t fill this:
              <input type="text" name="honeypot" tabIndex={-1} autoComplete="off" />
            </label>
          </div>

          {/* Accept / decline */}
          <div className="rsvp-field grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setAttending("yes")}
              className={`text-[10px] sm:text-xs uppercase tracking-[0.25em] py-2.5 transition-colors border ${
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
              className={`text-[10px] sm:text-xs uppercase tracking-[0.25em] py-2.5 transition-colors border ${
                attending === "no"
                  ? "bg-ink text-cream border-ink"
                  : "bg-transparent text-ink/70 border-ink/30 hover:border-ink"
              }`}
              aria-pressed={attending === "no"}
            >
              Regretfully decline
            </button>
          </div>

          {/* Name fields — when partySize=2 (Me & a companion) the first
              and last name fields each get a SIBLING input column for the
              companion. Grid stays horizontal so the form height doesn't
              balloon. Per Anthony 2026-05-17 v18 ("add a 2nd guest name
              next to the names section not under to avoid ruining the
              section again"). */}
          <div className={`rsvp-field grid ${attending === "yes" && partySize === 2 ? "grid-cols-2 gap-3" : "grid-cols-1"}`}>
            <div>
              <label
                htmlFor="rsvp-first"
                className="block text-[10px] uppercase tracking-[0.3em] text-olive-deep mb-1"
              >
                {attending === "yes" && partySize === 2 ? "Your first name" : "First name"}
              </label>
              <input
                id="rsvp-first"
                name="first_name"
                type="text"
                required
                autoComplete="given-name"
                className="w-full bg-transparent border-b border-ink/20 focus:border-olive-deep py-1.5 text-ink text-base outline-none transition-colors"
              />
            </div>
            {attending === "yes" && partySize === 2 && (
              <div>
                <label
                  htmlFor="rsvp-po-first"
                  className="block text-[10px] uppercase tracking-[0.3em] text-olive-deep mb-1"
                >
                  Companion&apos;s first name
                </label>
                <input
                  id="rsvp-po-first"
                  name="plus_one_first_name"
                  type="text"
                  required
                  className="w-full bg-transparent border-b border-ink/20 focus:border-olive-deep py-1.5 text-ink text-base outline-none transition-colors"
                />
              </div>
            )}
          </div>

          <div className={`rsvp-field grid ${attending === "yes" && partySize === 2 ? "grid-cols-2 gap-3" : "grid-cols-1"}`}>
            <div>
              <label
                htmlFor="rsvp-last"
                className="block text-[10px] uppercase tracking-[0.3em] text-olive-deep mb-1"
              >
                {attending === "yes" && partySize === 2 ? "Your family name" : "Family name"}
              </label>
              <input
                id="rsvp-last"
                name="last_name"
                type="text"
                required
                autoComplete="family-name"
                className="w-full bg-transparent border-b border-ink/20 focus:border-olive-deep py-1.5 text-ink text-base outline-none transition-colors"
              />
            </div>
            {attending === "yes" && partySize === 2 && (
              <div>
                <label
                  htmlFor="rsvp-po-last"
                  className="block text-[10px] uppercase tracking-[0.3em] text-olive-deep mb-1"
                >
                  Companion&apos;s family name
                </label>
                <input
                  id="rsvp-po-last"
                  name="plus_one_last_name"
                  type="text"
                  required
                  className="w-full bg-transparent border-b border-ink/20 focus:border-olive-deep py-1.5 text-ink text-base outline-none transition-colors"
                />
              </div>
            )}
          </div>

          <div className="rsvp-field">
            <label
              htmlFor="rsvp-phone"
              className="block text-[10px] uppercase tracking-[0.3em] text-olive-deep mb-1"
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
              className="w-full bg-transparent border-b border-ink/20 focus:border-olive-deep py-1.5 text-ink text-base outline-none transition-colors placeholder:text-ink/30"
            />
          </div>

          {/* Sections — only when accepting */}
          {attending === "yes" && (
            <div className="rsvp-field">
              <p className="block text-[10px] uppercase tracking-[0.3em] text-olive-deep mb-2">
                Joining for
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                {(["ceremony", "party", "both"] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setSections(opt)}
                    className={`text-[10px] uppercase tracking-[0.18em] py-2 transition-colors border ${
                      sections === opt
                        ? "bg-olive-deep text-cream border-olive-deep"
                        : "bg-transparent text-olive-deep border-olive-deep/30 hover:border-olive-deep"
                    }`}
                    aria-pressed={sections === opt}
                  >
                    {opt === "ceremony"
                      ? "Ceremony"
                      : opt === "party"
                      ? "Party"
                      : "Both"}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Number of guests — only when accepting */}
          {attending === "yes" && (
            <div className="rsvp-field">
              <p className="block text-[10px] uppercase tracking-[0.3em] text-olive-deep mb-2">
                Number of guests
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setPartySize(1)}
                  className={`text-[10px] uppercase tracking-[0.22em] py-2 transition-colors border ${
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
                  className={`text-[10px] uppercase tracking-[0.22em] py-2 transition-colors border ${
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

          {/* Companion name fields removed per Anthony 2026-05-17. Just
              party_size 1|2 — names captured later via WhatsApp. */}
          </div>

          {/* Pinned submit — OUTSIDE the scroll region so it is always
              visible at the bottom of the viewport, no matter how tall the
              form grows or how short the phone is. No entrance fade so it
              reads as present from first paint. */}
          <div className="shrink-0 pt-3">
            <button
              type="submit"
              disabled={submitting || !attending}
              className="w-full text-[11px] uppercase tracking-[0.3em] text-cream bg-olive-deep hover:bg-olive disabled:opacity-40 disabled:cursor-not-allowed px-5 py-3 transition-colors"
            >
              {submitting
                ? "Sending..."
                : !attending
                ? "Choose a response above"
                : attending === "yes"
                ? "Send our acceptance"
                : "Send our regrets"}
            </button>
            {done === "err" && (
              <p className="text-xs text-red-700 text-center pt-2">
                Couldn&apos;t send: {errMsg}. Please try again or WhatsApp Anthony directly.
              </p>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
