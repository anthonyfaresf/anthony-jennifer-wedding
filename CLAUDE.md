# Wedding Website — Project Context

## 🟥 DEPLOY: never hand-run the build/deploy commands. Use `npm run deploy`.
*Installed 2026-08-24 after the site served HTTP 200 with a blank page for up to five days.*

```
npm run deploy      # DEPLOY_TARGET=cloudflare build → wrangler deploy → live asset verify
npm run verify      # just the live check, any time
```

**What went wrong:** `next.config.ts` used to default `DEPLOY_TARGET` to `ghpages`, and that variable lived in **no script and no CI** — it had to be hand-typed on every deploy. The 2026-08-19 deploy omitted it, so every asset was requested under `/anthony-jennifer-wedding/` while the site is served at the Cloudflare **root**. Result: page returns 200, every CSS/JS/image 404s, blank screen, nothing alerts.

**Rules that follow — these bind Claude, not just Anthony:**
- **Never** run `next build` + `wrangler pages deploy` by hand. Always `npm run deploy`. A hand-run deploy skips the post-deploy verification, which is the only thing that catches a blank ship.
- 🟥 **A deploy is not done when wrangler prints "Deployment complete!"** It is done when `npm run verify` passes against the real custom domain. Wrangler reports success for a build that renders nothing.
- **Two destinations genuinely exist** (verified 2026-08-24), so `DEPLOY_TARGET` cannot simply be deleted: Cloudflare Pages root at **anthonyandjenni.com** (production, direct-upload project `anthony-jennifer-wedding`) and a **live** GitHub Pages mirror at anthonyfaresf.github.io/anthony-jennifer-wedding/ (branch `gh-pages`, status built). Only the ghpages build wants a basePath — opt-in via `DEPLOY_TARGET=ghpages`.
- If you ever deploy the **mirror**, verify it too: `bash scripts/verify-live.sh https://anthonyfaresf.github.io/anthony-jennifer-wedding/`.
- Deploying needs `CLOUDFLARE_ACCOUNT_ID=115bd9d989d2671d24df5c68ade4ce6f` in the environment — the current API token lacks `User Details:Read`, so wrangler cannot look the account up itself.

**Known architectural debt (needs Anthony's approval — do NOT do it unasked):** this Pages project is **direct-upload**, which violates `website-build.md`'s "Git-connected from day one" rule. Codex's recommendation (2026-08-24, receipt `1787573051-codex.json`) is to convert to a Git-connected project with `DEPLOY_TARGET` set as a project env var, so the variable can never be forgotten again. A Pages project's deploy source cannot change in place — it means a new project plus a live-domain cutover, which is Anthony's call every time.

*Anthony + [fiancée TBD] · personal wedding website · cinematic tier build*

## Who this is for
Personal — Anthony's actual wedding. NOT an AF&U client deliverable, NOT FindFetch. Voice is warm and personal, not direct-response. Marketing OS LAW 2 still applies (write for ONE specific guest in their moment) — but tone is celebratory, not commercial.

## What it does
- Hero with story + scroll-triggered animations
- "Our story" section (timeline of how we met → engaged)
- Photo gallery (couple photos)
- Venue section with embedded map
- RSVP form (name, party size, dietary, +1, attending/declining)
- Confirmation flow: **email via Hostinger SMTP + n8n Email node** (authorized in `tool-stack.json` 2026-05-15 for non-FindFetch projects). WhatsApp confirmations: manual via UI only (WhatsApp Business Cloud API remains off-stack).
- Cancellation flow: token-based link in confirmation, no login needed
- FAQ + travel info (for guests flying in)

## Tech stack
- **Frontend**: Next.js 14+ / React 19 / Tailwind v4 / shadcn/ui
- **Animations**: GSAP 3 + ScrollTrigger (per `.claude/rules/website-build.md` cinematic tier)
- **Forms backend**: Cloudflare Worker → D1 (guest records) → n8n webhook (Hostinger) → Hostinger SMTP via n8n Email node (transactional). **NOT Klaviyo** (FindFetch-scope-locked). **NOT WhatsApp Business Cloud API** (off-stack — see Workstream 2 routing below for stack-decision-required path).
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
- Stack: on-stack tools only per `Projects/ai-os/tool-stack.json` — Cloudflare Pages/Workers/D1, n8n (Hostinger), fal.ai (if AI imagery needed). NOT Klaviyo (FindFetch-scope-locked). NOT WhatsApp Cloud API (off-stack).
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
| Synthesized design direction (active spec) | [`assets/design-refs/SYNTHESIS-v2.md`](assets/design-refs/SYNTHESIS-v2.md) — linked 2026-05-08 (was orphan; v1 superseded + archived 2026-05-07) |
| Synthesized design direction (template path) | `assets/SYNTHESIS.md` (created after refs analyzed) |
| Brand guide (colors, fonts, voice) | `BRAND_GUIDE.md` |
| Project brief (your asks) | `BRIEF.md` |
| RSVP architecture spec | `reservations/SPEC.md` |
| Next.js source code | `src/` (created when build starts) |

## Workstreams + worker routing (added 2026-05-15)

This project has TWO workstreams that share the same folder + same `Projects/wedding-website/` Claude session. No need to switch projects between them.

### Workstream 1 — Frontend / design (current focus)
- **Worker**: Mateo (website-builder agent at `.claude/agents/website-builder.md`)
- **Skills**: `awesome-design-md` · `impeccable` · `taste-skill` · `anti-ai-writing` · `frontend-design`
- **Tools**: Next.js 14 · React 19 · Tailwind v4 · shadcn/ui · GSAP 3 · Cloudflare Pages (deploy)
- **When done**: design tokens locked in `BRAND_GUIDE.md`, `/impeccable audit` passes, Playwright iterative QA loop converges, sections render on mobile + desktop

### Workstream 2 — Backend / automations (next phase)

**Honest state of capabilities (verified 2026-05-15):**

| Piece needed | Worker / skill that covers it | Gap status |
|---|---|---|
| Cloudflare **Pages** hosting + DNS | **Mateo** (website-builder agent) — verified | ✓ covered |
| Cloudflare **Worker** code (form POST handler) | Mateo's agent line 2 lists "Cloudflare (DNS/CDN/Workers)" as awareness · operational depth (Worker code patterns) NOT in his references | ⚠ Mateo can scaffold but MAIN Claude fills the gap with Wrangler CLI + Cloudflare MCP · document patterns to `reservations/worker.ts` |
| Cloudflare **D1** schema + queries | No specialist · zero D1 references in any agent | ⚠ build inline · document schema in `reservations/d1-schema.sql` |
| Confirmation **email** for RSVPs | ✓ **Hostinger SMTP via n8n Email node** — formally authorized in `tool-stack.json` (Hostinger VPS entry, 2026-05-15) for non-FindFetch transactional email. Klaviyo remains FindFetch-only. | ✓ **DECIDED — BUILD THIS**: n8n workflow with Email node, SMTP creds in the n8n env, From: `rsvp@<wedding-domain>` (SPF/DKIM via Hostinger DNS) |
| **n8n** workflow design (orchestrates Worker → email → admin notification) | **NEW 2026-05-15**: install `n8n-mcp` (czlonkowski) — local stdio MCP that lets Claude Code design + execute n8n workflows directly. Install: `claude mcp add n8n-mcp -e MCP_MODE=stdio -e LOG_LEVEL=error -e DISABLE_CONSOLE_OUTPUT=true -- npx n8n-mcp` + optionally add `N8N_API_URL=https://n8n.srv1295871.hstgr.cloud` and `N8N_API_KEY=<generated in n8n UI>` for full R/W. Status: EVAL in `tool-stack.json` — install + test before relying on it. | ✓ once installed: Claude designs the workflow inline · exports to `reservations/n8n-workflow.json`. Until installed: design manually in Hostinger UI. |
| **WhatsApp** confirmation message | ⚠ **OFF-STACK** — `tool-stack.json` lists WhatsApp as "manual client comms" only. WhatsApp Business Cloud API is NOT on-stack: no entry in tool-stack.json, no token in `~/.claude/.env`. Original wedding-website spec mentioned it but predates the tool-stack lock. | ❌ **DO NOT BUILD until either** (a) WhatsApp Business Cloud API is explicitly added to `tool-stack.json` with `status: active` + token wired into `~/.claude/.env`, OR (b) confirmation channel is dropped from scope (RSVP form just records to D1, Anthony manually messages guests via WhatsApp UI) |

**Worker assignment for Workstream 2:** **MAIN Claude** (you, this session) handles all of it. Mateo's domain is frontend + Cloudflare Pages. The backend pieces don't have a specialist worker yet — that's a real gap in the vault, not a hidden capability.

**Tools currently on-stack and usable here**: Cloudflare Pages · Cloudflare Workers · D1 · n8n (Hostinger) + Hostinger SMTP via n8n Email node (for transactional confirmation).
**Blocked until added to `tool-stack.json`**: WhatsApp Business Cloud API.
**Out of scope for wedding-website**: Klaviyo (FindFetch-scope-locked per Anthony 2026-05-15).

### How to switch phases
When Phase 1 is done, just type `we're moving to backend / RSVP automations now` in this same folder — Claude will see this Workstreams section and load the Workstream 2 skill stack. No project change.

### What lives where for backend
| File | Purpose |
|---|---|
| `reservations/SPEC.md` | architecture (already declared above) |
| `reservations/d1-schema.sql` | guest records schema (to create) |
| `reservations/worker.ts` | Cloudflare Worker handling POST from form |
| `reservations/n8n-workflow.json` | exported n8n flow (confirmation + cancellation) |
| `reservations/whatsapp-integration.md` | ❌ DO NOT CREATE — WhatsApp Cloud API is off-stack. If you eventually add it to tool-stack.json, this file can be revived. |
| `data/guests.csv` | source-of-truth guest list (Anthony maintains) |
| `reservations/admin-dashboard.md` | how to view who-RSVP'd-what (probably a `/api/guests` route + admin page) |

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
