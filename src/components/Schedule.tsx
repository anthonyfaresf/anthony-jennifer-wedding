"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { downloadICS, type ICSEvent } from "@/lib/ics";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

// Times default to placeholders until Anthony confirms. The .ics buttons
// still ship — Anthony just updates these constants when ready.
// Per SYNTHESIS-v3 TIER 1 #3.
type ScheduleRow = {
  time: string;
  label: string;
  note: string;
  uid: string;
  startISO?: string;
  endISO?: string;
};

const events: ScheduleRow[] = [
  {
    time: "17:00",
    label: "Ceremony",
    note: "Couvent Saint Jean",
    uid: "ceremony-2026-07-18",
    startISO: "2026-07-18T14:00:00Z", // 17:00 Beirut (UTC+3)
    endISO: "2026-07-18T15:00:00Z",
  },
  {
    time: "18:00",
    label: "Cocktail",
    note: "Garden terrace",
    uid: "cocktail-2026-07-18",
    startISO: "2026-07-18T15:00:00Z",
    endISO: "2026-07-18T16:30:00Z",
  },
  {
    time: "19:30",
    label: "Dinner",
    note: "Main hall",
    uid: "dinner-2026-07-18",
    startISO: "2026-07-18T16:30:00Z",
    endISO: "2026-07-18T19:00:00Z",
  },
  {
    time: "22:00",
    label: "Dancing",
    note: "Until late",
    uid: "dancing-2026-07-18",
    startISO: "2026-07-18T19:00:00Z",
    endISO: "2026-07-19T01:00:00Z",
  },
];

function buildICSEvent(row: ScheduleRow): ICSEvent {
  return {
    uid: row.uid,
    title: `${row.label} · Anthony & Jennifer`,
    description: `${row.label} — ${row.note}.`,
    location: "Couvent Saint Jean, Okaibe, Lebanon",
    start: row.startISO!,
    end: row.endISO!,
  };
}

function downloadAll() {
  downloadICS(
    "anthony-jennifer-wedding",
    events.filter((e) => e.startISO && e.endISO).map(buildICSEvent)
  );
}

function downloadOne(row: ScheduleRow) {
  if (!row.startISO || !row.endISO) return;
  downloadICS(`anthony-jennifer-${row.uid}`, [buildICSEvent(row)]);
}

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
      className="py-32 px-6 bg-cream"
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
              className="sched-row grid grid-cols-[80px_1fr_auto] sm:grid-cols-[120px_1fr_auto] gap-4 sm:gap-6 py-6 border-b border-ink/10 last:border-b-0 items-center"
            >
              <div className="text-xl sm:text-2xl text-gold tabular-nums tracking-wide">{e.time}</div>
              <div>
                <p className="text-lg sm:text-xl text-ink tracking-wide">{e.label}</p>
                <p className="text-sm text-body/70 mt-1">{e.note}</p>
              </div>
              <button
                type="button"
                onClick={() => downloadOne(e)}
                aria-label={`Add ${e.label} to your calendar`}
                title="Add to calendar"
                className="text-olive-deep/70 hover:text-olive transition-colors p-2 -mr-2"
              >
                {/* Plain calendar SVG — no emoji per Taste Skill hard rule */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <rect x="3" y="4.5" width="18" height="16" rx="2" />
                  <line x1="3" y1="9.5" x2="21" y2="9.5" />
                  <line x1="8" y1="2.5" x2="8" y2="6" />
                  <line x1="16" y1="2.5" x2="16" y2="6" />
                  <line x1="12" y1="13" x2="12" y2="17" />
                  <line x1="10" y1="15" x2="14" y2="15" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        <div className="text-center mt-10 space-y-3">
          <button
            type="button"
            onClick={downloadAll}
            className="inline-block text-xs uppercase tracking-[0.3em] text-olive-deep hover:text-olive border border-olive-deep/30 hover:border-olive px-5 py-3 transition-colors"
          >
            Add the whole day
          </button>
          <p className="text-xs text-body/50 italic">
            Times are working drafts — final schedule confirmed closer to the date.
          </p>
        </div>
      </div>
    </section>
  );
}
