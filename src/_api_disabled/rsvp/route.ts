import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

/*
 * Local stub: appends each RSVP to ./data/rsvps.jsonl.
 *
 * Production-bound wiring (stack-conformant 2026-05-15 — see ../../../reservations/SPEC.md):
 *   - Forward validated payload to process.env.N8N_RSVP_WEBHOOK
 *   - n8n fans out to: Hostinger SMTP via Email node (confirmation email) + Anthony notification
 *   - WhatsApp auto-send is DEFERRED — Cloud API is off-stack per Projects/ai-os/tool-stack.json.
 *     The phone field stays in D1 so Anthony can message guests manually from his WhatsApp UI.
 *   - Klaviyo is NOT used here (FindFetch-scope-locked).
 *   - Vercel is NOT used as host — deploys go to Cloudflare Pages per CLAUDE.md infra.
 */

type Payload = {
  full_name?: string;
  phone?: string;
  email?: string | null;
  attending?: boolean;
  party_size?: number;
  plus_one_name?: string | null;
  dietary?: string | null;
  message?: string | null;
};

export async function POST(request: Request) {
  let body: Payload;
  try {
    body = (await request.json()) as Payload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Minimal validation — UI catches the rest.
  if (
    !body.full_name ||
    typeof body.full_name !== "string" ||
    body.full_name.trim().length < 2
  ) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (!body.phone || typeof body.phone !== "string") {
    return NextResponse.json(
      { error: "Phone number is required" },
      { status: 400 }
    );
  }
  if (typeof body.attending !== "boolean") {
    return NextResponse.json(
      { error: "Attending must be set" },
      { status: 400 }
    );
  }

  const record = {
    id: crypto.randomUUID(),
    cancel_token: crypto.randomUUID(),
    ...body,
    created_at: new Date().toISOString(),
    ip:
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      null,
    user_agent: request.headers.get("user-agent") || null,
  };

  // Write to local jsonl — swap for Vercel KV / Postgres / D1 in prod.
  try {
    const dataDir = path.join(process.cwd(), "data");
    await fs.mkdir(dataDir, { recursive: true });
    const file = path.join(dataDir, "rsvps.jsonl");
    await fs.appendFile(file, JSON.stringify(record) + "\n", "utf8");
  } catch (e) {
    console.error("RSVP write failed:", e);
    return NextResponse.json(
      { error: "Could not save your reply. Please try again." },
      { status: 500 }
    );
  }

  // Forward to n8n if env wired (production path)
  const webhook = process.env.N8N_RSVP_WEBHOOK;
  if (webhook) {
    try {
      await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record),
      });
    } catch (e) {
      // Don't fail the user-facing request if the webhook hiccups —
      // the record is on disk and Anthony can rerun.
      console.warn("n8n webhook failed:", e);
    }
  }

  console.log(
    `[RSVP] ${record.full_name} · attending=${record.attending} · ${record.phone}`
  );

  return NextResponse.json({
    ok: true,
    id: record.id,
    cancel_token: record.cancel_token,
  });
}

export async function GET() {
  // Simple admin peek — gated by env flag for now.
  // Visit /api/rsvp?key=YOUR_ADMIN_KEY when ADMIN_KEY is set.
  // (Don't ship this without the gate.)
  return NextResponse.json({
    message: "RSVP endpoint live. POST a JSON payload to submit.",
  });
}
