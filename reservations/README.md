# Wedding RSVP — n8n Workflow Setup

**Live workflow:** https://n8n.srv1295871.hstgr.cloud/workflow/oji3wqrZEHuCRIBX
**Disk source-of-truth:** [`n8n-workflow.json`](./n8n-workflow.json)
**Status:** Built · NOT yet activated · pending (1) Google Sheet creation, (2) Jennifer's Telegram chat ID, (3) Sheet conditional formatting

## What this does

Webhook receives an RSVP submission → normalizes fields → validates → upserts a row to a **colorful** Google Sheet (keyed on phone E.164 — re-submissions overwrite, no duplicates) → sends **Jennifer** a Telegram message with the full guest details. Webhook is **not yet connected to the website** — that comes when the front-end form is built.

```
POST /webhook/wedding-rsvp
        │
        ▼
[Normalize Fields]  ← trims, lowercases, extracts E.164 phone, generates rsvp_id
        │
        ▼
[Valid Submission?] ── false ──▶ Respond 400 (invalid/missing fields)
        │ true
        ▼
[Upsert Row in Sheet]   ← upsert by phone_e164 (accept→reject flips handled)
        │
        ▼
[Notify Jennifer (Telegram)]   ← Jennifer Wedding Bot, HTML-formatted with emoji status
        │
        ▼
Respond 200 OK  { ok: true, rsvp_id, message: "RSVP received" }
```

## Stack decisions

| Decision | Why |
|---|---|
| **Telegram (Jennifer's bot), not WhatsApp** | Per your direction. Jennifer's bot credential `Jennifer Wedding Bot` (id `6Dt14fujwtYhjKxq`) is already wired into the Telegram node. WhatsApp Cloud API path was deferred. |
| **Jennifer is the sole receiver** | All confirmations + accept/reject notifications go to her chat. If you want yourself ALSO copied later, easy to add a second Telegram node to the chain. |
| **Google Sheet with conditional formatting** | The Sheet IS the dashboard. Green rows = accepting, red = declining, pending stays neutral. Filters + pivot table cover seating/dietary/headcount instantly. Setup is one-time, ~2 minutes (see below). |
| **Upsert keyed on `phone_e164`, not append** | Guests change minds, retype with typos, do accept→reject flips. Upsert overwrites — latest submission wins, `submitted_at` shows when, row reflects current state, no duplicates. |
| **No guest-facing confirmation yet** | Scoped: "just start with the workflow, no website yet." Guest email confirmation will be added when the front-end form goes live (Hostinger SMTP). |

## Fields the workflow accepts (POST JSON body)

| Field | Required | Type | Notes |
|---|---|---|---|
| `first_name` | yes | string | trimmed |
| `last_name` | yes | string | trimmed |
| `phone` | yes | string | any format — E.164 derived by stripping non-digit/non-`+` |
| `email` | no | string | lowercased; appears in Telegram + Sheet |
| `attending` | no | `"yes"` \| `"no"` | default `no` if missing or not exactly `"yes"` |
| `party_size` | no | `1` \| `2` | clamped to [1,2]; set to 0 if not attending |
| `plus_one_first_name` | no | string | only used if `party_size ≥ 2` |
| `plus_one_last_name` | no | string | only used if `party_size ≥ 2` |
| `dietary` | no | string | free text |
| `song_request` | no | string | DJ list seed |
| `message` | no | string | note to the couple |
| `honeypot` | no | string | MUST be empty — non-empty = rejected as spam (400) |

## Google Sheet — column headers (paste in row 1, exact order)

```
rsvp_id	submitted_at	first_name	last_name	full_name	phone_e164	phone_raw	email	attending	party_size	plus_one_name	dietary	song_request	message	ip	user_agent
```

Tab-separated — paste directly into row 1 cell A1.

## Make it colorful — Sheet setup (one-time, ~2 minutes)

After the Sheet exists and the workflow has written at least one test row, apply these rules. Sheet → **Format → Conditional formatting**:

### Rule 1 — Green row when attending = yes
- **Apply to range:** `A2:P1000` (skips header, covers all data columns)
- **Format rules → Custom formula is:** `=$I2="yes"`
- **Formatting style:** background **#D9EAD3** (soft green) + bold text

### Rule 2 — Red row when attending = no (declined)
- **Apply to range:** `A2:P1000`
- **Custom formula is:** `=$I2="no"`
- **Formatting style:** background **#F4CCCC** (soft pink-red) + grey text **#666666**

### Rule 3 — Highlight party-of-2 rows with gold left edge
- **Apply to range:** `A2:B1000` (just the leftmost 2 columns get the gold accent)
- **Custom formula is:** `=$J2>=2`
- **Formatting style:** background **#FCE5CD** (soft gold) + bold

### Rule 4 — Header row styling (manual, no rule needed)
- Select row 1 → **Fill color: #073763** (deep navy) → **Text color: white** → **Bold** → **Wrap: clip** → **Freeze row 1**

### Optional polish (recommended)
- **View → Freeze → 1 row** (header always visible while scrolling)
- **Data → Column statistics on column I** → instant accept/decline counts at the bottom
- **Insert → Pivot table** → group by `attending`, sum `party_size` → live headcount as RSVPs arrive

### What you'll see

| | A | B | I | J | K |
|---|---|---|---|---|---|
| 1 | 🟦 **first_name** (navy header) | 🟦 **last_name** | 🟦 **attending** | 🟦 **party_size** | 🟦 **plus_one_name** |
| 2 | 🟩 Sarah | 🟩 Khoury | 🟩 **yes** | 🟨 2 | 🟨 **Karim Haddad** |
| 3 | 🟥 Omar | 🟥 Saadeh | 🟥 no | (0) | |
| 4 | 🟩 Lina | 🟩 Aoun | 🟩 yes | 1 | |

Green stripes = your guests. Red stripes = the no's. Gold left tab = party of 2. Scan at a glance.

## Setup checklist (in order)

- [ ] **1. Get Jennifer's Telegram chat ID** — she DMs **@userinfobot** on Telegram → it replies with her numeric chat ID (looks like `123456789`)
- [ ] **2. Create the Google Sheet** — name `Wedding RSVPs`, tab `RSVPs`, paste headers into row 1
- [ ] **3. Open the workflow** → https://n8n.srv1295871.hstgr.cloud/workflow/oji3wqrZEHuCRIBX
- [ ] **4. Open `Upsert Row in Sheet` node** → credential already set to `Google Sheets account` ✓ → pick the wedding Sheet + `RSVPs` tab in the dropdowns → matching column auto-resolves to `phone_e164`
- [ ] **5. Open `Notify Jennifer (Telegram)` node** → credential already set to `Jennifer Wedding Bot` ✓ → paste Jennifer's chat ID into the `Chat ID` field (replaces the placeholder)
- [ ] **6. Apply the 4 conditional formatting rules** from above to the Sheet
- [ ] **7. Toggle `Active`** at top-right of workflow → grab production webhook URL from `RSVP Submission` node
- [ ] **8. Run the test curl below** → verify (a) Telegram arrives to Jennifer, (b) row appears in Sheet with green/red color, (c) 200 response
- [ ] **9. Test duplicate flip** — send same phone twice, second with `"attending":"no"` → confirm row UPDATED (not duplicated) + row color flips green→red

## Test curls

**Accept, party of 2, full data (Jennifer should get a 💚 ACCEPT message):**

```bash
curl -X POST 'https://n8n.srv1295871.hstgr.cloud/webhook/wedding-rsvp' \
  -H 'Content-Type: application/json' \
  -d '{
    "first_name": "Sarah",
    "last_name": "Khoury",
    "phone": "+961 70 123 456",
    "email": "sarah@example.com",
    "attending": "yes",
    "party_size": 2,
    "plus_one_first_name": "Karim",
    "plus_one_last_name": "Haddad",
    "dietary": "Karim is vegetarian",
    "song_request": "Fairuz - Habbaytak Bi Saif",
    "message": "Cant wait!",
    "honeypot": ""
  }'
```

**Decline, minimum data (Jennifer should get a ❌ DECLINE message):**

```bash
curl -X POST 'https://n8n.srv1295871.hstgr.cloud/webhook/wedding-rsvp' \
  -H 'Content-Type: application/json' \
  -d '{
    "first_name": "Omar",
    "last_name": "Saadeh",
    "phone": "+961 71 999 888",
    "attending": "no",
    "message": "Sorry, will be abroad. Mabrouk!"
  }'
```

**Spam (honeypot tripped — should return 400, no Telegram, no Sheet row):**

```bash
curl -X POST 'https://n8n.srv1295871.hstgr.cloud/webhook/wedding-rsvp' \
  -H 'Content-Type: application/json' \
  -d '{"first_name":"Bot","last_name":"X","phone":"+1234567","honeypot":"got-em"}'
```

## What Jennifer sees on her phone

Telegram message with HTML formatting (bold name, code-block phone, italic dietary, emoji status badge):

```
💚 New RSVP — ACCEPT

Sarah Khoury + Karim Haddad (party 2)
📱 +96170123456
✉️ sarah@example.com

🥗 Karim is vegetarian
🎵 Fairuz - Habbaytak Bi Saif
💬 "Cant wait!"

⏱ 17 May 13:42
```

```
❌ New RSVP — DECLINE

Omar Saadeh
📱 +96171999888

💬 "Sorry, will be abroad. Mabrouk!"

⏱ 17 May 13:45
```

## If you also want to copy yourself in

Easy: open the workflow → duplicate the `Notify Jennifer (Telegram)` node → rename to `Notify Anthony (Telegram)` → swap its credential to `ChatBot Afandu` (or whichever Telegram bot you use) → set your own chat ID → wire it: `Upsert Row in Sheet → [both notify nodes in parallel] → Respond 200 OK`. Both get pinged in parallel, ~no latency cost.

## Future enhancements (deferred — not built in MVP)

| Enhancement | Trigger to build |
|---|---|
| Guest-facing email confirmation (Hostinger SMTP) | When website form goes live |
| Cancellation link in confirmation | Same |
| Cloudflare Turnstile spam shield | Same — replaces honeypot-only |
| Multi-language (EN/AR/FR) | If guests need it |
| Daily 9am digest instead of per-submit Telegram pings | When volume picks up >20/day |
| Meal choice (chicken/fish/veg) | If plated dinner service |

## Re-export the workflow if you edit in n8n UI

```bash
source ~/.claude/.env
curl -s -H "X-N8N-API-KEY: $N8N_API_KEY" \
  "$N8N_HOST/api/v1/workflows/oji3wqrZEHuCRIBX" \
  | jq '{id, name, description, active, nodes, connections, settings}' \
  > "Projects/wedding-website/reservations/n8n-workflow.json"
```

## Related

- [`SPEC.md`](./SPEC.md) — original D1-based architecture (website-connected future state)
- [`../CLAUDE.md`](../CLAUDE.md) — project context + Workstream 1/2 routing
- [Live n8n workflow](https://n8n.srv1295871.hstgr.cloud/workflow/oji3wqrZEHuCRIBX)
