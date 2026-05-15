/**
 * Tiny .ics generator — RFC 5545 minimal subset.
 *
 * Per SYNTHESIS-v3 TIER 1 #3 — Schedule rows get an "Add to Calendar" icon
 * button each. Clicking generates a Blob URL and triggers a download.
 * iOS/Android users get their native calendar sheet on opening the .ics.
 */

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toUTCStamp(d: Date) {
  return (
    d.getUTCFullYear() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    "T" +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    "Z"
  );
}

function escapeICS(text: string) {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

export type ICSEvent = {
  title: string;
  description?: string;
  location?: string;
  /** ISO 8601 or Date */
  start: string | Date;
  /** ISO 8601 or Date */
  end: string | Date;
  /** Stable per-event UID — recommend a slug like `ceremony-2026-07-18`. */
  uid: string;
};

export function buildICS(events: ICSEvent[]): string {
  const now = toUTCStamp(new Date());
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Anthony & Jennifer Wedding//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];
  for (const e of events) {
    const start = typeof e.start === "string" ? new Date(e.start) : e.start;
    const end = typeof e.end === "string" ? new Date(e.end) : e.end;
    lines.push(
      "BEGIN:VEVENT",
      `UID:${e.uid}@anthony-jennifer-wedding`,
      `DTSTAMP:${now}`,
      `DTSTART:${toUTCStamp(start)}`,
      `DTEND:${toUTCStamp(end)}`,
      `SUMMARY:${escapeICS(e.title)}`,
      ...(e.location ? [`LOCATION:${escapeICS(e.location)}`] : []),
      ...(e.description ? [`DESCRIPTION:${escapeICS(e.description)}`] : []),
      "END:VEVENT"
    );
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

export function downloadICS(filename: string, events: ICSEvent[]) {
  const ics = buildICS(events);
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".ics") ? filename : `${filename}.ics`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    a.remove();
    URL.revokeObjectURL(url);
  }, 0);
}
