# RSVP + Confirmation Architecture

## Flow
```
Guest fills RSVP form (anthony-and-[name].com/rsvp)
  ↓
POST to Cloudflare Worker (/api/rsvp)
  ↓
Worker validates → writes record to Cloudflare D1 (guests table)
  ↓
Worker fires webhook → n8n.srv1295871.hstgr.cloud/webhook/wedding-rsvp
  ↓
n8n splits: (a) Klaviyo email · (b) WhatsApp Business Cloud API · (c) Anthony notification
  ↓
Guest receives email + WhatsApp within 60 seconds
  ↓
Confirmation includes unique cancellation link: anthony-and-[name].com/cancel?token=[uuid]
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

## Email confirmation (Klaviyo template)
- Subject: "Thank you, [first_name] — see you on [wedding_date]"
- Body: warm note from the couple + event details + cancellation link
- ICS calendar attachment with venue address
- Multilingual: 1 template per language (EN / AR / FR), routed by `language` field

## WhatsApp confirmation (Cloud API)
- Template message (must be pre-approved by Meta — submit ~1 week before launch)
- Body: "Hi [first_name]! Anthony + [fiancée] confirm your RSVP for [date]. Venue: [name]. Need to cancel? [link]"
- Cancellation flow: same template with status="cancelled" + sympathetic copy

## Cancellation flow
- Guest clicks `anthony-and-[name].com/cancel?token=[uuid]`
- Page shows: "Cancel your RSVP for [Anthony + Fiancée]'s wedding?" + Confirm button
- Confirm → Worker updates D1 (status=cancelled, cancelled_at=now)
- Worker fires n8n webhook (different node) → cancellation email + WhatsApp + Anthony notification

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
- [ ] Klaviyo email templates created (1 per language) + approved
- [ ] WhatsApp Business Cloud API template submitted to Meta + approved (allow 1 week)
- [ ] Turnstile widget configured + Worker validates token
- [ ] `/admin` page Cloudflare Access policy set
- [ ] End-to-end test: 1 RSVP → email + WhatsApp received within 60s → cancellation link works
- [ ] Backup: nightly D1 export to R2 bucket

## Cost estimate (free tier sufficient for ~500 guests)
- Cloudflare Pages: free
- Cloudflare Workers: free (100k requests/day)
- Cloudflare D1: free (5M reads + 100k writes/day)
- Cloudflare Turnstile: free
- n8n: already paid (Hostinger)
- Klaviyo: already paid (existing AF&U account)
- WhatsApp Cloud API: free (1,000 conversations/month, ~enough for confirmations + cancellations)
- Mapbox (if used): free (50k loads/month)

**Total marginal cost: $0** assuming under guest count limits.
