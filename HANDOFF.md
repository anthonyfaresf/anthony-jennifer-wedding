# Wedding Website — Where Everything Lives

## Folder map
```
Projects/wedding-website/
├── CLAUDE.md                              ← Project context (load first every session)
├── BRIEF.md                               ← Your asks (in your words)
├── BRAND_GUIDE.md                         ← Colors, fonts, tone — fills as decisions land
├── HANDOFF.md                             ← This file
├── assets/
│   ├── design-refs/
│   │   ├── instagram/
│   │   │   ├── _urls.txt                  ← PASTE INSTAGRAM URLS HERE (one per line)
│   │   │   ├── README.md                  ← Instructions
│   │   │   ├── Reels/                     ← Auto-populated after download
│   │   │   ├── Carousels/
│   │   │   └── Photos/
│   │   └── SYNTHESIS.md                   ← Created after IG refs analyzed
│   ├── inspiration/
│   │   └── README.md                      ← Drop screenshots / PDFs / Pinterest pins here
│   ├── photos/
│   │   └── README.md                      ← Drop your couple photos here
│   └── master-refs/                       ← AI-generated assets if needed (later)
├── reservations/
│   └── SPEC.md                            ← RSVP architecture (Cloudflare + n8n + Klaviyo + WhatsApp)
└── src/                                   ← Next.js app (created when build starts)
```

## Where YOU work
Open this folder in Claude Code, Cursor, or Antigravity. Everything is self-contained:
```bash
cd "/Users/anthonyffares/Anthony's Vault/Projects/wedding-website"
claude
```
Then I auto-load `CLAUDE.md` from this folder and inherit project context.

## Next steps (in order)

### 1. Drop Instagram references
Paste URLs into `assets/design-refs/instagram/_urls.txt` (one per line). Then say "download the IG references" and I'll run `gallery-dl` against this folder, organize the output, and run Gemini analysis to extract animation patterns + color palettes.

### 2. Confirm the basics
Fill these (I can't infer them):
- [ ] Wedding date
- [ ] Venue name + full address
- [ ] Fiancée's name (and how it should appear — full / nickname)
- [ ] Approximate guest count
- [ ] Languages (EN only / EN+AR / EN+AR+FR)
- [ ] Domain preference (e.g., `anthony-and-[name].com`)

### 3. Drop couple photos (when ready)
Into `assets/photos/`. 5–10 minimum. Mix of portrait + landscape + candid.

### 4. Pick tone direction
Open `BRAND_GUIDE.md` and check the "Tone direction" box that fits — drives every design decision after.

### 5. I synthesize + you approve
Once IG refs + tone + basics are in, I write `assets/SYNTHESIS.md` (combined design direction) + flesh out `BRAND_GUIDE.md`. You approve or redirect.

### 6. Build starts
Run `/website-new --tier=cinematic` from this folder. The cinematic tier loads GSAP + ScrollTrigger + the anti-slop pipeline (impeccable + taste-skill + anti-ai-writing). Section-by-section build. Playwright iterative QA loop on every section. Lighthouse ≥90 before launch.

### 7. RSVP backend
Cloudflare Worker + D1 + n8n webhook + Klaviyo + WhatsApp Cloud API per `reservations/SPEC.md`. End-to-end test before launch.

### 8. Launch
- Domain in Cloudflare DNS
- Cloudflare Pages deploy
- Test RSVP end-to-end with your phone (real WhatsApp delivery)
- Send the link

## What I will NOT do without confirmation
- Pick a fiancée's name spelling — you tell me
- Invent the wedding date / venue
- Use AI-generated faces of you two (real photos only)
- Default to Inter font (per `website-build.md`)
- Build before SYNTHESIS.md is approved

## Tools/skills/commands that fire on this project
- **Skills loaded automatically**: `awesome-design-md`, `impeccable`, `taste-skill`, `anti-ai-writing`, `accessibility-auditor`, `web-performance-optimization`, `meta-tags-optimizer`
- **Commands available**: `/ig-download` (for IG refs), `/website-new --tier=cinematic` (the build), `/impeccable [audit|critique|polish]` (anti-slop pipeline)
- **Rules loaded**: `.claude/rules/website-build.md`, `.claude/rules/identity-check.md` (lighter for personal), `.claude/rules/marketing-os.md` LAW 2 (write for one specific guest)
- **Stack used**: Cloudflare (Pages + Workers + D1 + DNS), n8n (Hostinger), Klaviyo (email), WhatsApp Cloud API, Mapbox or Google Maps, Next.js + GSAP
