# Wedding Guest Photo Upload

Guests scan a QR at the table → upload photos/videos to a private, moderated gallery.
Cloudflare **Worker** (API) + **R2** (files) + **D1** (metadata). No app, no login for guests.

Full decision + architecture: [`SPEC.md`](./SPEC.md).

## Status: LIVE at photos.anthonyandjenni.com — PROXY upload mode (2026-07-16)

**⚠ 2026-07-16 incident + architecture change.** The original design used presigned
S3 URLs (phone → R2 directly). On 2026-07-14 those S3 credentials were NOT minted as
a dedicated R2 token — they were **derived from the main `CLOUDFLARE_API_TOKEN` in
`~/.claude/.env`** (access key = that token's id `0cb7bfa1…`, secret = SHA-256 of its
value). On 2026-07-15 that main token stopped validating (it expired or was replaced
while fixing an unrelated Pages deploy — Anthony did NOT deliberately rotate anything),
and the wedding uploads died with it: R2 rejected every presigned PUT with 401 and
guests saw "Didn't send" on every attempt. Lesson: never couple a guest-facing system
to a shared multi-purpose credential. The fix: **uploads now stream through the
Worker's native R2 binding** (`PUT /api/upload/:id`, same-origin, no CORS, no external
credentials to rot). Admin gallery/downloads likewise stream through the Worker with
HMAC-signed expiring URLs (keyed on ADMIN_TOKEN) instead of presigned GETs.
`UPLOAD_MODE=presign` (wrangler.jsonc) re-enables direct-to-R2 for >95MB videos, but
ONLY works with fresh R2 S3 secrets set — see "Presign mode" below.

Built:
- Same-origin proxy uploads via native R2 binding (default; zero external credentials).
  Photos ≤30MB single PUT · videos ≤95MB single PUT · videos up to **2GB via chunked
  multipart** (32MB parts, each retried independently — one network blip on venue
  cellular costs a chunk, not the whole video). Abandoned multipart uploads are
  auto-aborted by R2's built-in 7-day lifecycle rule.
- Admin media streaming supports Range requests (206) so video playback works on iPhone.
- Optional presigned direct-to-R2 mode (`UPLOAD_MODE=presign` + DEDICATED R2 token secrets).
- `/api/complete` **verifies the object exists in R2 before reporting success** — no false-success.
- HEIC/HEIF handling (falls back to filename extension when Safari reports no MIME type).
- Metadata + moderation state in D1.
- Admin gallery (`/admin`) with Worker-streamed media + moderate/download endpoints (bearer-token gated).

## Endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/` | — | Test harness (throwaway) |
| GET | `/api/health` | — | Liveness |
| POST | `/api/presign` | — | Reserve slot + return presigned PUT URL |
| POST | `/api/complete` | — | Verify R2 persistence, then mark uploaded |
| GET | `/api/admin/uploads` | Bearer | List all uploads |
| POST | `/api/admin/moderate` | Bearer | Approve / reject an upload |
| GET | `/api/admin/download?id=` | Bearer | Redirect to a presigned download URL |

## Local setup

```bash
npm install
cp .dev.vars.example .dev.vars     # then fill in real values

# One-time: create the throwaway staging resources (needs `wrangler login`)
npx wrangler r2 bucket create wedding-photos-staging
npx wrangler d1 create wedding-photos              # paste the printed database_id into wrangler.jsonc
npm run db:init:local                              # apply schema to the local D1

# Put your Cloudflare account id + (if using --remote) R2 S3 creds in place, then:
npm run dev
```

Open http://localhost:8787 for the test harness.

- `npm run dev` (local mode) exercises the API + D1 logic. R2 is simulated locally, so the
  presign URL is generated but the actual PUT to the real R2 S3 endpoint won't round-trip.
- To test the **full** presign → PUT → verify round trip (the part that matters), use
  `npm run dev:remote` against the throwaway bucket, or deploy to a preview (Phase 4).

## R2 CORS (needed before browser PUTs work against real R2)

The phone PUTs cross-origin to R2, so the bucket needs a CORS policy allowing `PUT`
from the page origin. Apply at Phase 4 (dashboard → R2 → bucket → Settings → CORS), e.g.
allow methods `PUT, GET`, your preview/prod origin, headers `*`.

## Next phases

See `SPEC.md` → "Phased build plan". Phase 2 = the designed guest page (through the
anti-slop design stack). Phase 4 = real-device testing on a preview deploy with junk
photos we delete afterward. Nothing goes on the live wedding site until it passes.
