"use client";

import { useState } from "react";
import Confetti from "./Confetti";

export default function RSVP() {
  const [attending, setAttending] = useState<"yes" | "no" | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<null | "ok" | "err">(null);
  const [errMsg, setErrMsg] = useState("");
  const [cancelToken, setCancelToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!attending) return;
    setSubmitting(true);
    setDone(null);
    const fd = new FormData(e.currentTarget);
    const payload = {
      full_name: fd.get("full_name"),
      phone: fd.get("phone"),
      email: fd.get("email") || null,
      attending: attending === "yes",
      party_size: Number(fd.get("party_size") || 1),
      plus_one_name: fd.get("plus_one_name") || null,
      dietary: fd.get("dietary") || null,
      message: fd.get("message") || null,
    };
    try {
      const r = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        throw new Error(j?.error || `HTTP ${r.status}`);
      }
      if (j?.cancel_token) setCancelToken(j.cancel_token);
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
      <section id="rsvp" className="py-32 px-6 relative overflow-hidden">
        {/* Petal-drift confetti burst on success — per SYNTHESIS-v3 TIER 1 #5 */}
        <Confetti play={true} count={attending === "yes" ? 32 : 0} fullViewport={false} />
        <div className="max-w-md mx-auto text-center relative z-10">
          <p className="text-xs uppercase tracking-[0.4em] text-olive-deep mb-6">
            {attending === "yes" ? "See you there" : "Thank you"}
          </p>
          <h2 className="font-display text-5xl text-ink mb-6">
            {attending === "yes" ? "We can't wait." : "Your reply is saved."}
          </h2>
          <div className="w-16 h-px bg-gold mx-auto my-8" />
          <p className="text-body leading-relaxed">
            If anything changes, send Anthony or Jennifer a WhatsApp directly
            and we&apos;ll update your details.
          </p>
          {cancelToken && (
            <p className="text-xs text-body/60 mt-8">
              Need to cancel?{" "}
              <a
                href={`/cancel/${cancelToken}`}
                className="underline decoration-olive-deep/40 hover:decoration-olive"
              >
                Use this link
              </a>
              .
            </p>
          )}
        </div>
      </section>
    );
  }

  return (
    <section id="rsvp" className="py-32 px-6">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.4em] text-olive-deep mb-4">
            RSVP
          </p>
          <h2 className="font-display text-5xl md:text-6xl text-ink">
            Will you join us?
          </h2>
          <div className="w-16 h-px bg-gold mx-auto mt-8" />
          <p className="text-body/70 mt-6 text-sm">
            Kindly reply by [deadline TBD].
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Yes / No toggle */}
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-olive-deep mb-3">
              Will you attend?
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAttending("yes")}
                className={`py-4 px-6 text-sm uppercase tracking-[0.3em] border transition-colors ${
                  attending === "yes"
                    ? "bg-olive-deep text-cream border-olive-deep"
                    : "bg-cream text-ink border-ink/15 hover:border-olive-deep"
                }`}
              >
                I&apos;ll be there
              </button>
              <button
                type="button"
                onClick={() => setAttending("no")}
                className={`py-4 px-6 text-sm uppercase tracking-[0.3em] border transition-colors ${
                  attending === "no"
                    ? "bg-ink text-cream border-ink"
                    : "bg-cream text-ink border-ink/15 hover:border-ink"
                }`}
              >
                Sadly, no
              </button>
            </div>
          </div>

          {attending && (
            <>
              <Field label="Full name" name="full_name" required />
              <Field
                label="WhatsApp number (with country code)"
                name="phone"
                type="tel"
                placeholder="+961 ..."
                required
              />
              <Field label="Email (optional)" name="email" type="email" />

              {attending === "yes" && (
                <>
                  <div>
                    <label className="block text-xs uppercase tracking-[0.3em] text-olive-deep mb-2">
                      Party size
                    </label>
                    <select
                      name="party_size"
                      defaultValue="1"
                      className="w-full bg-cream border border-ink/15 px-4 py-3 text-body focus:outline-none focus:border-olive-deep transition-colors"
                    >
                      <option value="1">Just me</option>
                      <option value="2">Me and my +1</option>
                    </select>
                  </div>
                  <Field
                    label="+1 name (if applicable)"
                    name="plus_one_name"
                  />
                  <Field
                    label="Dietary needs / allergies"
                    name="dietary"
                    multiline
                  />
                </>
              )}

              <Field
                label="A note for the couple (optional)"
                name="message"
                multiline
              />

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-olive-deep text-cream py-5 text-xs uppercase tracking-[0.4em] hover:bg-olive transition-colors disabled:opacity-60"
              >
                {submitting ? "Sending..." : attending === "yes" ? "Lock it in" : "Send reply"}
              </button>

              {done === "err" && (
                <p className="text-sm text-red-700 text-center">
                  Something went wrong: {errMsg}. Please try again or message
                  Anthony directly.
                </p>
              )}
            </>
          )}
        </form>
      </div>
    </section>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  multiline = false,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  multiline?: boolean;
  placeholder?: string;
}) {
  const cls =
    "w-full bg-cream border border-ink/15 px-4 py-3 text-body focus:outline-none focus:border-olive-deep transition-colors";
  return (
    <div>
      <label className="block text-xs uppercase tracking-[0.3em] text-olive-deep mb-2">
        {label}
        {required && <span className="text-gold ml-1">·</span>}
      </label>
      {multiline ? (
        <textarea
          name={name}
          required={required}
          placeholder={placeholder}
          rows={3}
          className={cls}
        />
      ) : (
        <input
          name={name}
          type={type}
          required={required}
          placeholder={placeholder}
          className={cls}
        />
      )}
    </div>
  );
}
