import { notFound } from "next/navigation";
import fs from "node:fs/promises";
import path from "node:path";
import CancelClient from "./client";

type Rsvp = {
  id: string;
  cancel_token: string;
  full_name?: string;
  attending?: boolean;
  status?: string;
};

async function findRsvp(token: string): Promise<Rsvp | null> {
  try {
    const file = path.join(process.cwd(), "data", "rsvps.jsonl");
    const text = await fs.readFile(file, "utf8");
    const lines = text.split("\n").filter(Boolean);
    // Walk backwards so the latest record (e.g. cancelled) wins.
    for (let i = lines.length - 1; i >= 0; i--) {
      const r = JSON.parse(lines[i]) as Rsvp;
      if (r.cancel_token === token) return r;
    }
    return null;
  } catch {
    return null;
  }
}

export default async function CancelPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const rsvp = await findRsvp(token);
  if (!rsvp) notFound();

  return (
    <main className="min-h-[100dvh] flex items-center justify-center px-6 py-20 bg-cream">
      <div className="max-w-md w-full text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-olive-deep mb-6">
          Cancel RSVP
        </p>
        <h1 className="font-display text-4xl text-ink mb-4">
          {rsvp.status === "cancelled"
            ? "Already cancelled"
            : `Cancel your RSVP, ${rsvp.full_name?.split(" ")[0] ?? "friend"}?`}
        </h1>
        <div className="w-16 h-px bg-gold mx-auto my-8" />
        {rsvp.status === "cancelled" ? (
          <p className="text-body leading-relaxed">
            This reply was already cancelled. If you change your mind, please
            message Anthony or Jennifer directly.
          </p>
        ) : (
          <>
            <p className="text-body leading-relaxed mb-10">
              You can cancel here, or close this tab to keep your reply as-is.
              If your plans change again later, message us directly.
            </p>
            <CancelClient token={token} />
          </>
        )}
        <div className="mt-12">
          <a
            href="/"
            className="text-xs uppercase tracking-[0.3em] text-olive-deep hover:text-olive border-b border-olive-deep/30 hover:border-olive pb-1"
          >
            Back to invitation
          </a>
        </div>
      </div>
    </main>
  );
}
