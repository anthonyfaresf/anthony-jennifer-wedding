"use client";

import { useState } from "react";

export default function CancelClient({ token }: { token: string }) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "err">(
    "idle"
  );
  const [err, setErr] = useState("");

  if (state === "done") {
    return (
      <div>
        <p className="text-body leading-relaxed">
          Your RSVP has been cancelled. We&apos;ll miss you.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button
        onClick={async () => {
          setState("loading");
          try {
            const r = await fetch("/api/rsvp/cancel", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token }),
            });
            if (!r.ok) {
              const j = await r.json().catch(() => ({}));
              throw new Error(j?.error || `HTTP ${r.status}`);
            }
            setState("done");
          } catch (e) {
            setErr(e instanceof Error ? e.message : "Unknown error");
            setState("err");
          }
        }}
        disabled={state === "loading"}
        className="w-full bg-ink text-cream py-4 px-6 text-xs uppercase tracking-[0.4em] hover:bg-olive-deep transition-colors disabled:opacity-60"
      >
        {state === "loading" ? "Cancelling..." : "Yes, cancel my RSVP"}
      </button>
      {state === "err" && (
        <p className="text-sm text-red-700">
          Couldn&apos;t cancel: {err}. Please message us directly.
        </p>
      )}
    </div>
  );
}
