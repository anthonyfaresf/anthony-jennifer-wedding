# Wedding Website — Project Context

*Anthony + [fiancée TBD] · personal wedding website · cinematic tier build*

## Who this is for
Personal — Anthony's actual wedding. NOT an AF&U client deliverable, NOT FindFetch. Voice is warm and personal, not direct-response. Marketing OS LAW 2 still applies (write for ONE specific guest in their moment) — but tone is celebratory, not commercial.

## What it does
- Hero with story + scroll-triggered animations
- "Our story" section (timeline of how we met → engaged)
- Photo gallery (couple photos)
- Venue section with embedded map
- RSVP form (name, party size, dietary, +1, attending/declining)
- Confirmation flow: WhatsApp + email auto-send on submission
- Cancellation flow: token-based link in confirmation, no login needed
- FAQ + travel info (for guests flying in)

## Tech stack
- **Frontend**: Next.js 14+ / React 19 / Tailwind v4 / shadcn/ui
- **Animations**: GSAP 3 + ScrollTrigger (per `.claude/rules/website-build.md` cinematic tier)
- **Forms backend**: Cloudflare Worker → D1 (guest records) → n8n webhook (Hostinger) → Klaviyo email + WhatsApp Business Cloud API
- **Map**: Mapbox custom-styled (premium feel) OR Google Maps embed (zero-config)
- **Hosting**: Cloudflare Pages + Cloudflare DNS (per CLAUDE.md infra)
- **Photos**: Stored in `assets/photos/`, served via Cloudflare R2 in production

## Pre-build pipeline (mandatory before writing code)
Per `.claude/rules/website-build.md`:
1. Pull 1–2 reference brands via `awesome-design-md` skill (likely Apple / Framer / Lovable for the warm-cinematic feel)
2. Synthesize Instagram refs (in `assets/design-refs/instagram/`) into `assets/SYNTHESIS.md`
3. Load `impeccable` + `taste-skill` + `anti-ai-writing`
4. Build section-by-section (hero → story → photos → venue → RSVP → FAQ)
5. Run `/impeccable audit` + Playwright iterative QA loop before launch

## Identity check (lighter than client work)
- Solo operator (Anthony) — no humans involved in the build
- Stack: on-stack tools only (Cloudflare, n8n, Klaviyo, fal.ai if AI imagery needed)
- Claims: every detail (date, venue, schedule) verified against Anthony's source-of-truth before publishing
- Photos: real couple photos only — no AI-generated faces of him + fiancée

## Voice rules
- Warm, first-person ("we"), specific to the couple
- NO direct-response patterns ("Don't miss out!", "Limited spots!", urgency CTAs)
- Anti-AI-writing applies (banned patterns: "In today's", "leverage", em-dash overuse)
- Two voices: Anthony + fiancée — both review every line before ship

## Where things live
| What | Path |
|---|---|
| Instagram reference URLs | `assets/design-refs/instagram/_urls.txt` |
| Downloaded IG content | `assets/design-refs/instagram/Reels/`, `Carousels/`, `Photos/` |
| Other inspiration (PDFs, screenshots) | `assets/inspiration/` |
| Couple photos | `assets/photos/` |
| AI-generated assets (if needed) | `assets/master-refs/` |
| Synthesized design direction | `assets/SYNTHESIS.md` (created after refs analyzed) |
| Brand guide (colors, fonts, voice) | `BRAND_GUIDE.md` |
| Project brief (your asks) | `BRIEF.md` |
| RSVP architecture spec | `reservations/SPEC.md` |
| Next.js source code | `src/` (created when build starts) |

## Inputs needed from Anthony before build starts
- [ ] Wedding date
- [ ] Venue name + address
- [ ] Fiancée's name (and how she wants it written — full / nickname)
- [ ] Approximate guest count
- [ ] Languages (EN only? + Arabic? + French?)
- [ ] Domain preference (e.g., `anthony-and-[name].com`)
- [ ] 5–10 couple photos in `assets/photos/`
- [ ] At least 3 Instagram references in `_urls.txt`
- [ ] Wedding date + venue confirmation for the map pin
