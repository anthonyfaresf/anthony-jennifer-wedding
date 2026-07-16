---
deliverable: true
type: client-deliverable
brand: wedding-website
title: "Wedding Guest Photo Upload — Build Spec"
date: 2026-07-13
auto_tagged: deliverable-autotag 2026-07-13
---

# Wedding Guest Photo Upload — Build Spec

*Feature: guests scan a QR at the table → upload photos/videos to a private gallery. Custom-built on Anthony's Cloudflare stack, with a free off-the-shelf service as zero-cost insurance.*

## Decision (4-brain, unanimous — HYBRID)

Verdict from Main Claude + independent Claude advisor + Codex (gpt-5.6): **HYBRID — build the custom Cloudflare feature as primary, keep a free off-the-shelf service as real insurance.** Codex receipt: `.claude/logs/3brain-receipts/1783942515-codex.json`.

**Why build (the honest reasons — NOT "for marketing"):**
- On-stack + near-free (Cloudflare Workers + R2 already authorized in the project).
- Reusable asset — this exact upload→gallery pattern resells into any event/venue/hospitality client.
- The live wedding site is already loved; this is an incremental enhancement.
- Personal-brand content ("automate everything, even my wedding") is a *bonus*, not the justification. If marketing were the only reason, the right call would be BUY.

**Corrections adopted from the panel:**
- Effort is **~2–3 focused days** for the bulletproof version, not "half a day." The happy path is half a day; the 80% that survives a real wedding is the rest.
- The marketing/portfolio value is modest and conditional — don't over-index on it.

## The two non-negotiables

1. **No false-success.** A guest must NEVER see "Uploaded ✓" for a file that isn't durably persisted in R2. Confirm success only after R2 verifies the write. (This is the single biggest failure mode: guests think it worked, nothing lands, memories lost forever.)
2. **Never auto-project raw uploads.** Nothing appears on any public screen/slideshow until Anthony approves it in a moderation queue.

## Environments pipeline (never test on the production wedding site)

| Stage | Tooling | Reachable from phones | R2 | Purpose |
|---|---|---|---|---|
| Local | `wrangler dev` | No | mock/local binding | Fast code + UI iteration |
| Preview | throwaway `*.pages.dev` / `*.workers.dev` + throwaway R2 bucket | **Yes** | real, throwaway | Real-device reliability test (HEIC, video, cellular, concurrency) → delete junk after |
| Production | `photos.<weddingdomain>` (or a clean `*.pages.dev` behind the QR) | Yes | real, permanent | Promote only after Preview passes |

Never deploy an untested version onto the live wedding site URL. Own subdomain = isolated blast radius.

## Architecture (critical path)

- **Presigned direct-to-R2 uploads** — photo bytes go straight from the phone to R2, bypassing the Worker (scales, cheap, no Worker size/CPU limits). Worker only mints presigned PUT URLs + records metadata.
- **Resumable + retry** with a client-side size cap — survives flaky venue 4G.
- **Idempotent upload IDs** — a retried upload doesn't create duplicates.
- **Accept raw, convert async** — store HEIC/Live Photo/video as-is instantly; transcode for gallery display in the background. Never make the guest wait on conversion.
- **"Uploaded ✓" only after R2 confirms** the object exists.
- **Private moderated admin gallery** — Anthony reviews/approves/downloads; bulk "download all" as a zip.
- **n8n stays OFF the binary path** — at most an async "uploads spiking" notification. The wedding must work if n8n is down.

## Fallback / insurance design

- **One QR** on the table cards → the custom page (clean UX; no competing codes).
- The custom page carries an **always-visible** "Trouble uploading? Use this instead →" link to a free service (Pix Wedding / Dearest).
- Anthony keeps a **printed backup QR** (to the free service) in his pocket to swap onto tables if the night goes sideways.
- Net: photo-loss risk is zero regardless of what the custom code does.

## Test protocol (Stage 2 — the "junk photos we delete" test)

Before printing anything, on the Preview deploy:
1. Scan the QR from a **real iPhone AND a real Android**.
2. Upload: a HEIC photo, a Live Photo, a video, and several files at once.
3. Test on **cellular data**, not just wifi; test with the network throttled.
4. Confirm every file lands **full-resolution** in R2 and appears in the gallery.
5. Confirm the moderation gate works (nothing projects until approved).
6. Confirm the fallback link works.
7. **Delete all junk uploads + the throwaway bucket** before the day.

## Storage sizing (sanity check)

~100 guests × ~15 files × ~4 MB ≈ **6 GB** photos (R2 free tier = 10 GB-month). Videos can push past it, but R2 overage is ~$0.015/GB-month — even 50 GB ≈ $0.75/mo. Cost is a non-issue; note it, don't worry about it.

## Phased build plan

- **Phase 1 (local):** project scaffold, `wrangler` config, Worker with presign + metadata endpoints, R2 binding. Bind a throwaway R2 bucket early (presigned PUT + CORS only test truthfully against real R2).
- **Phase 2 (local, design stack):** the guest upload page — built through `awesome-design-md` + `impeccable` + `taste-skill` + `anti-ai-writing` so it matches the invites and isn't slop. Real success/failure states, progress, retry, fallback link.
- **Phase 3 (local):** admin gallery + moderation queue + bulk download.
- **Phase 4 (preview deploy):** run the full test protocol above on real devices.
- **Phase 5 (harden):** async HEIC/video conversion, idempotency, edge cases surfaced in testing.
- **Phase 6 (promote):** point the subdomain, generate the branded QR + print-ready table card, link into the main site.

## Open product questions (need Anthony's input before Phase 2)

1. **Allow videos?** (Yes = bigger storage + async transcode; No = simpler, photos only.)
2. **Guest name + one-line message field?** (Turns it into a mini photo-guestbook. Optional per upload.)
3. **Any live reception slideshow?** (If yes, moderation gate is mandatory — already planned.)
4. **Rough guest count** — for storage sizing + preview load test realism.
5. **Custom wedding domain** — have one / registering one? (Not blocking — QR hides the URL.)
