import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

/*
 * Cancel an RSVP by appending a status=cancelled record with the same token.
 * The original record stays on disk; the latest record per token wins
 * (matches /cancel/[token]/page.tsx lookup).
 *
 * In production: replace with a Postgres/Vercel KV update + n8n webhook fan-out
 * to send the cancellation email + WhatsApp + Anthony notification.
 */

type CancelBody = { token?: string };

export async function POST(request: Request) {
  let body: CancelBody;
  try {
    body = (await request.json()) as CancelBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const token = body.token;
  if (!token || typeof token !== "string") {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const file = path.join(process.cwd(), "data", "rsvps.jsonl");
  let text: string;
  try {
    text = await fs.readFile(file, "utf8");
  } catch {
    return NextResponse.json({ error: "RSVP not found" }, { status: 404 });
  }

  const lines = text.split("\n").filter(Boolean);
  let original: Record<string, unknown> | null = null;
  for (let i = lines.length - 1; i >= 0; i--) {
    const r = JSON.parse(lines[i]) as Record<string, unknown>;
    if (r.cancel_token === token) {
      original = r;
      break;
    }
  }
  if (!original) {
    return NextResponse.json({ error: "RSVP not found" }, { status: 404 });
  }
  if (original.status === "cancelled") {
    return NextResponse.json({ ok: true, alreadyCancelled: true });
  }

  const cancelRecord = {
    ...original,
    status: "cancelled",
    cancelled_at: new Date().toISOString(),
  };
  await fs.appendFile(file, JSON.stringify(cancelRecord) + "\n", "utf8");

  const webhook = process.env.N8N_RSVP_CANCEL_WEBHOOK;
  if (webhook) {
    try {
      await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cancelRecord),
      });
    } catch (e) {
      console.warn("n8n cancel webhook failed:", e);
    }
  }

  console.log(
    `[RSVP cancelled] ${original.full_name ?? "<unknown>"} · token=${token}`
  );

  return NextResponse.json({ ok: true });
}
