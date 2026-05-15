# RSVP + Confirmation Architecture

> **⚠ STACK-CONFORMANCE NOTE (updated 2026-05-15)**
> Original spec authorized Klaviyo + WhatsApp Business Cloud API. Both are blocked by current stack rules:
> - **Klaviyo** is FindFetch-scope-locked per `Projects/ai-os/tool-stack.json` (`scope_lock: findfetch-only`) — must not be used in wedding-website.
> - **WhatsApp Business Cloud API** is not in `tool-stack.json` — off-stack until explicitly added.
>
> Active confirmation path (this version of SPEC.md): **Hostinger SMTP via n8n Email node** for transactional email. WhatsApp confirmation is deferred — guests get email; Anthony messages them manually via WhatsApp UI from his existing number.
> Re-enable the original (Klaviyo / WhatsApp Cloud API) flows ONLY after they're approved in `tool-stack.json` with tokens wired into `~/.claude/.env`.

## Flow (current — stack-conformant)
```
Guest fills RSVP form (anthony-and-[name].com/rsvp)
  ↓
POST to Cloudflare Worker (/api/rsvp)
  ↓
Worker validates → writes record to Cloudflare D1 (guests table)
  ↓
Worker fires webhook → n8n.srv1295871.hstgr.cloud/webhook/wedding-rsvp
  ↓
n8n splits: (a) Email via Hostinger SMTP (n8n Email node) · (b) Anthony notification (Telegram or email)
  ↓
Guest receives confirmation email within 60 seconds
  ↓
Confirmation includes unique cancellation link: anthony-and-[name].com/cancel?token=[uuid]
  ↓
[Manual] Anthony optionally messages guest via WhatsApp UI for personal touch
```

## Cloudflare D1 schema (single table)
```sql
CREATE TABLE guests (
  id TEXT PRIMARY KEY,                    -- UUID
  cancel_token TEXT NOT NULL UNIQUE,      -- separate UUID for cancellation URL
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,                    -- E.164 format for WhatsApp
  attending BOOLEAN NOT NULL,
  party_size INTEGER DEFAULT 1,
  plus_one_name TEXT,
  dietary_restrictions TEXT,
  message TEXT,
  language TEXT DEFAULT 'en',             -- en | ar | fr
  status TEXT DEFAULT 'confirmed',        -- confirmed | cancelled
  created_at INTEGER NOT NULL,            -- unix ms
  cancelled_at INTEGER,
  ip_address TEXT,                        -- for spam dedup, not displayed
  user_agent TEXT
);

CREATE INDEX idx_guests_email ON guests(email);
CREATE INDEX idx_guests_cancel_token ON guests(cancel_token);
CREATE INDEX idx_guests_status ON guests(status);
```

## Form fields
| Field | Required | Type | Notes |
|---|---|---|---|
| Full name | yes | text | Min 2 chars |
| Email | yes | email | Used for confirmation |
| Phone | yes | tel | E.164 — `+961...` for Lebanon, `+33...` for France |
| Attending | yes | radio | Yes / No |
| Party size | conditional | select 1–4 | Only if attending=yes |
| Plus-one name | optional | text | Only if party_size > 1 |
| Dietary restrictions | optional | textarea | Vegetarian / vegan / allergies |
| Language | optional | select | EN / AR / FR — drives confirmation message language |
| Message to the couple | optional | textarea | 500 char max |

## Email confirmation (Hostinger SMTP via n8n Email node — stack-conformant)
- Sent by n8n Email node using Hostinger SMTP credentials (already on-stack via Hostinger VPS subscription)
- Subject: "Thank you, [first_name] — see you on [wedding_date]"
- Body: warm note from the couple + event details + cancellation link
- ICS calendar attachment with venue address
- Multilingual: 1 template per language (EN / AR / FR), routed by `language` field
- Templates stored in n8n workflow JSON (exported to `reservations/n8n-workflow.json`) — NOT in Klaviyo

> **Archived alternative — DO NOT BUILD**: a previous version of this spec described a Klaviyo transactional flow (templating + deliverability tracking + segment history). That path is blocked until Klaviyo's `scope_lock` is widened beyond `findfetch-only` in `tool-stack.json`. Any future change to that scope requires an explicit edit there first — not in this file.

## WhatsApp confirmation — DEFERRED
- ❌ WhatsApp Business Cloud API is off-stack (not in `tool-stack.json`). No auto-send WhatsApp until it's added with a token in `~/.claude/.env`.
- Current path: Anthony sends a manual WhatsApp message from his existing number for guests he wants personally welcomed. Optional, not required.
- Cancellation flow: same — email handles it; no auto-WhatsApp.

## Cancellation flow
- Guest clicks `anthony-and-[name].com/cancel?token=[uuid]`
- Page shows: "Cancel your RSVP for [Anthony + Fiancée]'s wedding?" + Confirm button
- Confirm → Worker updates D1 (status=cancelled, cancelled_at=now)
- Worker fires n8n webhook (different node) → cancellation email (Hostinger SMTP) + Anthony notification. No auto-WhatsApp (off-stack).

## Anthony's admin view
- Simple `/admin` page (Cloudflare Access protected by Anthony's email)
- Shows: total RSVPs, attending count, declined count, party size sum, dietary restrictions list, message log
- CSV export button for caterer / venue handoff
- No edit capability needed (guests manage their own RSVP via cancellation link)

## Spam protection
- Cloudflare Turnstile widget on form (free, less invasive than reCAPTCHA)
- Rate limit: 3 submissions per IP per hour (Worker KV counter)
- Email validation: regex + DNS MX lookup before storing

## Pre-launch checklist
- [ ] D1 database created + migrations run
- [ ] Worker deployed + bound to D1
- [ ] n8n webhook workflow imported + tested end-to-end
- [ ] Email templates created in n8n Email node (1 per language: EN/AR/FR) + Hostinger SMTP credentials wired + SPF/DKIM verified on wedding domain
- [ ] ~~WhatsApp Business Cloud API template~~ — deferred (off-stack); Anthony handles personal-touch WhatsApp manually
- [ ] Turnstile widget configured + Worker validates token
- [ ] `/admin` page Cloudflare Access policy set
- [ ] End-to-end test: 1 RSVP → confirmation email received within 60s (verified in a real inbox, SPF/DKIM passing) → cancellation link works. WhatsApp delivery is NOT part of this test (manual channel only).
- [ ] Backup: nightly D1 export to R2 bucket

## Cost estimate (free tier sufficient for ~500 guests)
- Cloudflare Pages: free
- Cloudflare Workers: free (100k requests/day)
- Cloudflare D1: free (5M reads + 100k writes/day)
- Cloudflare Turnstile: free
- n8n: already paid (Hostinger VPS — €6.67/mo, includes SMTP for transactional email)
- ~~Klaviyo~~: FindFetch-scope-locked per `Projects/ai-os/tool-stack.json` 2026-05-15 — NOT used here
- ~~WhatsApp Cloud API~~: off-stack — NOT used here; Anthony sends personal messages manually from his existing WhatsApp number
- Mapbox (if used): free (50k loads/month)

**Total marginal cost: $0** assuming under guest count limits.
