---
type: design-synthesis
project: wedding-website
version: 3
analyzed: 2026-05-15
method: Gemini 2.5 Flash multimodal video analysis of 10 IG refs (4 from v2 + 6 new) + Riley & Grey / SiteBuilderReport 25-example survey + current-site audit
v2: SYNTHESIS-v2.md (4 refs, still authoritative on cream + gold + cinematic-romantic core direction)
status: draft-pending-Anthony-approval
confidence: high
---

# Wedding Website — Design Synthesis v3

## What v3 adds to v2 in one paragraph

v2 locked the tone (**cinematic-romantic · cream + antique gold · medium-paced envelope+scroll-reveal**) from 4 refs. v3 keeps that core and adds **6 distinctive creative moves** the new refs surface — none of which the current site has yet — plus a **survey-confirmed list of ownable patterns** that beat what The Knot / Zola / Riley & Grey ship at scale. The current site already executes the v2 direction strongly (GSAP watercolor scrub + glass cards + phase dividers + character-stagger reveals) — the iteration is about **compounding distinctive moves on top**, not redesigning.

---

## The 6 new refs at a glance

| Ref | Studio | Vibe | The one borrowable idea |
|---|---|---|---|
| `itskevinyang-DXuaziTD1Zf` | Kevin Yang (US designer) | Cinematic-romantic, desaturated cream + sage | **Hero photo-collage assembly** — full-bleed photo scales DOWN into centered card surrounded by themed photo collage as scroll fires. Also: confetti particles on date reveal. |
| `missingpieceinvites-DWiwH64RD2A` | Missing Piece (UK invite studio) | Regal-whimsical (navy + gold + starry night) | **Layered pop-up-book diorama** — parallax depth, scenes emerge from behind preceding layers (hot air balloon → castle on clouds → ring). |
| `missingpieceinvites-DXT2V7axjky` | Same studio, navy palette variant | Same diorama logic | Same as above — different color story. |
| `thedigitalyes-DWAGGs8CIH6` | The Digital Yes (FR/EN invite studio) | Classic-elegant · sage green + cream + gold | **Day-to-night swipe transition** on venue illustration — horizontal swipe toggles lights on, moon rises. Unique, ownable. |
| `thedigitalyes-DXhR1ptCDVU` | Same studio, modern variant | Editorial-modern · high-contrast B&W | **Language toggle (EN/ES)** + minimalist line-art timeline icons + clean serif. |
| `yallamabrook-DXXtFTlAFZ_` | Yalla Mabrook (Arab/Levant wedding ecosystem) | Cinematic-romantic · cream + gold + sage with warm-filter photos | **Apple Wallet QR pass on RSVP success** + interactive calendar with wedding date highlighted + countdown timer on distinct green block. |

**Tone-direction confidence**: 4/6 new refs = `cinematic-romantic` (matches v2 verdict). 1/6 = `classic-elegant` (overlapping family). 1/6 = `editorial-modern` (the outlier — we don't go this direction).

**Color confidence**: v2 cream + antique gold + ONE bold accent rule HOLDS. New refs add sage-green (#5A6D5D, #4A5F4B, #6D9B4A) as a recurring secondary on 4/6 — which **aligns perfectly with our existing Blosta olive `#495314`**. The palette is already in the system.

---

## TL;DR — the 9 creative moves we should add to the build

Each one is ranked by **(impact × distinctiveness ÷ build effort)**. Top of the list ships first.

### TIER 1 — high impact + ownable + cheap to build (do these next)

| # | Move | Where it lives | Source refs | Why |
|---|---|---|---|---|
| 1 | **Live countdown timer** (DD · HH · MM · SS, animated, gold numerals on cream paper, italic-script label) | Between Hero and Story (new `<Countdown>` section) | 5 of 10 refs (universal) | We are the ONLY one of 10 references without it. Bare minimum table-stakes. |
| 2 | **Interactive calendar with the wedding date highlighted** (July 2026 grid, day 18 marked with gold ring + emboss) | Top of `<Venue>` or new `<Date>` mini-section | yallamabrook | Distinctive, fast to ship, reads as a real physical save-the-date detail. |
| 3 | **Add-to-Calendar buttons** (`.ics` + Google + Apple) on Schedule rows | Each `<Schedule>` row gets a small icon button | yallamabrook + reveliastudio_ | Practical, expected in 2026, makes the site useful beyond viewing. |
| 4 | **Animated polaroid stack on Story scenes** (caption pill replaced by floating polaroid drop-in pattern) | `<Story>` scene captions | indierossart (polaroids drop at 0:12) + itskevinyang (layered polaroid stacks) | Trades the current glass-card caption for something more physical and warmer. |
| 5 | **Tasteful confetti / petal-drift particles on hero name reveal AND on RSVP success** | `<Hero>` finale + `<RSVP>` success state | itskevinyang (date confetti) | Already implied in `BRAND_GUIDE.md` ("confetti optional, tasteful") — small, sweet, low effort. |

### TIER 2 — high impact, slightly heavier build

| # | Move | Where it lives | Source refs | Why |
|---|---|---|---|---|
| 6 | **Apple Wallet pass on RSVP success** (`.pkpass` with QR code = guest's RSVP record + cancel link + wedding info card) | `<RSVP>` success state | yallamabrook | **Single biggest day-of-wedding utility move.** Guests pull up their pass on the wedding day; you scan it at the door. We're the only wedding I've seen do this in Lebanon. |
| 7 | **Language toggle EN · FR · AR** (top-right corner, 3-character pill, transitions copy without reload) | Global header | thedigitalyes (EN/ES) + Lebanon market reality | Anthony's CLAUDE.md flagged EN + Arabic + French as likely. Most Lebanese weddings need at least EN + Arabic; many add French. **Now is the time** — every section of copy goes through this toggle. |
| 8 | **Hero photo-collage assembly** (full-bleed image scales down + 4–6 polaroid-sized themed photos drop in around it as scroll progresses) | `<Hero>` finale, before "Scroll" cue | itskevinyang | Replaces the current watercolor-only finish with a richer, more personal payoff — uses our actual couple photos as the reward for scrolling past the watercolor opener. |

### TIER 3 — ambitious, save for polish pass

| # | Move | Where it lives | Source refs | Why |
|---|---|---|---|---|
| 9 | **Day-to-night swipe transition on venue hero** (horizontal swipe / drag fires GSAP timeline that cross-fades cream-daylight watercolor → moonlit-blue watercolor of Couvent Saint Jean; lights tick on in tower windows; moon rises) | `<Venue>` hero strip | thedigitalyes (DWAGGs8CIH6) | The single most distinctive move from the 10-ref set. Heavy build (needs a second 31-frame watercolor sequence + interaction layer). Defer until everything else is shipped. |

---

## Anti-patterns the audit found (kill on sight)

These are things the current site does well OR that we should stay vigilant about — sourced from the 10 refs + 25-site survey + Riley & Grey premium analysis.

| Anti-pattern | Current-site status | Action |
|---|---|---|
| Generic "RSVP" button copy | Current FAQ + RSVP use "RSVP" | Swap to **"I'll be there"** (Emily & Manuel pattern) — conversational, lower friction |
| Accordion-only FAQ that feels like every other site | Need to check current FAQ.tsx | Use **humorous Q&A pairs** (Lizzie & Joshy pattern) + categorize ("Practical / Personal / Logistics") |
| Standard scroll-reveal on EVERY block | Current site does heavy character-stagger | **Reserve character-stagger for the hero + scene captions**. Other sections (Schedule, FAQ, Footer) use simpler fade-up so character-reveal stays special. |
| Single-language only | Current site EN-only | Ship the EN / FR / AR toggle (Tier 2 #7) |
| Photo gallery as static grid | Need to check `Photos.tsx` | Use **timeline progression** ("2019 → 2026" chronological gallery with year markers between photo clusters) — Ellory & Griffen pattern |
| Date locked at top of page only | Hero has date | Add to: hero, calendar widget, countdown, schedule, FAQ ("when?"), Apple Wallet pass — date is the **most-asked question** |
| Map embed that looks like every Google Maps iframe | Need to check Venue.tsx map | Use **hand-drawn venue illustration** + below it a "Open in Google Maps" / "Get Directions" button pair (itskevinyang + thedigitalyes pattern). The watercolor venue hero already does this — make sure the map below isn't a default Google iframe. |
| Wedding website that looks "AI-built" | Risk we have to manage | Run `/impeccable audit` after iteration. All copy through `anti-ai-writing`. Real photos only. |

---

## Color palette — v3 final (refines v2)

```
PRIMARY
--cream:      #f4ece0   — page background, parchment feel (unchanged from v2)
--parchment:  #e8ddc8   — slightly warmer cream for cards / quote blocks

DISPLAY
--display:    #495314   — Blosta olive — names, section headings (unchanged)
                          + corroborated by sage-green presence in 4/6 new refs

BODY
--body:       #2b2b2b   — Gordita near-black (unchanged)

ACCENT (gold)
--gold:       #b8924a   — antique gold rules + hero "and" + accent (unchanged)
--gold-soft:  #d4b87a   — secondary gold (unchanged)

NEW — SAGE LIVELINESS (added v3)
--sage:       #6e7a3a   — lighter olive sibling to --display, use for
                          micro-tags ("Our story" eyebrow), success states,
                          calendar highlight ring (already exists as --olive)
```

The palette is **already in `globals.css` lines 44–64**. No new tokens needed for v3 — we just use the existing olive sibling more deliberately.

---

## Typography — v3 final (no changes, but confirm)

`globals.css` already uses **Blosta** (display, olive) + **Gordita** (body) + **Italianno** (hero "and" ampersand). New refs confirm this is correct:

- 6/6 new refs use **mixed display typography** with **delicate-thin or regular weight** + **italic-script accents between display lines**
- We already use Italianno for the hero "and" — extend this treatment to ONE place in Story (scene year, perhaps) and ONE place on Venue (the "·" between venue name and Lebanon)
- **DO NOT add a 4th font** — three is the max for cohesion

---

## Animation rhythm — v3 final

v2's "medium pace" verdict HOLDS. Specific timing guidance for new components:

| Move | Easing | Duration | Stagger |
|---|---|---|---|
| Countdown digit roll | `power3.out` | 0.4s flip per digit change | n/a — digits update via state |
| Calendar grid reveal | `power3.out` | 0.7s | 0.02s per cell (subtle wave) |
| Confetti particles | `power2.out` ease-out fall, slight drift | 2–3s total, 25 particles | random 0–0.6s entry stagger |
| Polaroid drop | `back.out(1.2)` (gentle bounce only here) | 0.7s | 0.15s between polaroids |
| Photo-collage assembly | `power3.out` | 0.9s for center scale-down, 0.5s each for collage entries | 0.1s |
| Day-to-night swipe | `power2.inOut` | 1.2s full cross-fade | n/a |

**Rule unchanged from v2**: no bouncy/elastic anywhere except the single hero ampersand pop. Polaroid drop is the one allowed exception — it reads as physical (paper landing on paper), not springy/AI.

---

## Section-by-section implementation plan

### 1. `<Hero>` (currently strong)
- KEEP: 31-frame wine-cheers watercolor scrub, character-stagger names, gold rule grow, vignette + cream page-turn
- ADD: confetti particle drift at the moment the date line settles in (TIER 1 #5)
- ADD: scroll-triggered photo-collage assembly as the next-section transition (TIER 2 #8) — the hero card lifts away, watercolor stays, then 4–6 polaroid-sized photos drop in around the position where the names were
- KEEP: no "boxes" — text floats on watercolor with shadow (Anthony's 2026-05-02 rule)

### 2. `<Countdown>` (NEW SECTION — between Hero and Story)
- 100vh sticky section, cream paper, paper-grain overlay
- 4 oversized Blosta-olive digit clusters: DD · HH · MM · SS
- Italic-script labels under each ("days" / "hours" / "minutes" / "seconds" — Italianno)
- Gold rule below
- One line of Gordita italic body: "until we say I do"
- Mobile: stack 2×2; desktop: single row
- Update via `setInterval` (1s), digit flip via simple opacity swap, no GSAP needed
- TIER 1 #1

### 3. `<Story>` (currently strong — minor enrichment)
- KEEP: 3-scene vertical timeline with sticky frame scrubs, phase dividers, year markers, character-stagger captions
- ENRICH: replace caption pill with **floating polaroid stack** (TIER 1 #4) — 2 photos per scene drop in around the caption text, slightly rotated, paper shadow
- For Scene 03 (Wedding), the polaroids can be venue detail shots (entrance, garden, table setting)
- Phase dividers stay but **add a tiny illustrated motif** (single lemon for the Mediterranean feel — already have lemon assets in `public/elements/`) between the gold rules

### 4. `<Photos>` (audit before changing — currently 93 lines, status unknown)
- ENRICH: timeline progression — group photos by year ("2019 first met" → "2022 engaged" → "2026 today") with small year markers between clusters (Ellory & Griffen pattern)
- Slight rotation on each photo (–2° / +1.5° / –0.5° random per photo) for paper-on-paper feel
- Light cream-feather edge on each photo (already exists in `globals.css`)

### 5. `<Venue>` (currently strong — add map below)
- KEEP: 16:9 watercolor establishing shot with Ken Burns + venue title overlay
- ADD: hand-drawn illustration of Couvent Saint Jean below the watercolor strip (or use the watercolor itself as the illustration — they're the same thing visually)
- ADD: **Interactive calendar widget** (TIER 1 #2) below the hero strip — small July 2026 grid, day 18 ringed with gold + slight emboss + italic-script "we marry"
- ADD: address card + "Open in Google Maps" button pair — primary button (cream-on-olive) + secondary (olive outline)
- TIER 3 #9 day/night swipe deferred

### 6. `<Schedule>` (currently 76 lines)
- AUDIT: probably fine as-is
- ADD: small "Add to Calendar" icon button per event row (TIER 1 #3) — generates `.ics` on click; mobile users get the native sheet

### 7. `<RSVP>` (currently 237 lines — strong)
- KEEP: yes/no toggle, party-size, dietary, plus-one, message
- COPY CHANGE: button labels — "I'll be there" / "Sadly, no" instead of "Yes attending" / "No"
- ADD: confetti particles on success state (TIER 1 #5)
- ADD: Apple Wallet pass download button on success (TIER 2 #6) — `.pkpass` file with guest name + RSVP confirmation + QR code (encodes cancel_token)
- The cancel link is already there — keep it as fallback for non-Apple users

### 8. `<FAQ>` (currently 82 lines)
- AUDIT NEEDED — probably accordion currently
- COPY: shift to **playful + categorized** ("Logistics" / "Day-of" / "Practical")
- KEEP: accordion if it's clean (Anthony's audit)

### 9. Global
- ADD: **Language toggle EN / FR / AR** in top-right corner — pill UI, 3 chars, RTL support for AR (TIER 2 #7)
- Needs i18n setup: `next-intl` (App Router compatible) or static-locale folder pattern
- ALL copy moves into translation files — Anthony writes EN, we batch-translate FR + AR through Claude with `anti-ai-writing` pass per language

---

## What we're explicitly NOT doing

- **No envelope intro** — Anthony already removed it 2026-05-02; v3 confirms this was right (only 4/10 refs use envelope-opening, and our hero watercolor IS the equivalent moment)
- **No "Pop-up book" diorama** — too far from the watercolor identity we've built
- **No editorial B&W direction** (thedigitalyes-DXhR1ptCDVU) — beautiful but wrong tone for us
- **No registry section** — Anthony hasn't asked for one; if needed later, frame as "honeymoon contribution" (Claudia & Marijn pattern)
- **No virtual try-on / quiz / poll / first-dance-song-guess** — anti-pattern bloat; we keep it pure
- **No surprise music auto-play** — `<AudioPlayer>` already exists with manual toggle, keep as-is

---

## Build order (prioritized for next iteration session)

1. **Countdown section** (TIER 1 #1) — ~45 min build
2. **Calendar widget on Venue** (TIER 1 #2) — ~1h build
3. **RSVP copy change + confetti success** (TIER 1 #5 partial) — ~30 min
4. **Add-to-Calendar buttons on Schedule** (TIER 1 #3) — ~45 min
5. **Polaroid stack on Story scenes** (TIER 1 #4) — ~1.5h
6. **Hero confetti finale** (TIER 1 #5) — ~30 min
7. **Hero photo-collage assembly** (TIER 2 #8) — ~2h
8. **Apple Wallet `.pkpass` integration** (TIER 2 #6) — ~3–4h (requires server-side `.pkpass` generation, certificates from Apple Developer; can ship a stub QR-PNG version first, upgrade later)
9. **Language toggle EN/FR/AR** (TIER 2 #7) — ~4h (i18n setup + 3-language copy pass)
10. **Day-to-night venue swipe** (TIER 3 #9) — deferred

Estimated total to ship through TIER 1 + 2 in one focused session: **8–10 hours of build work** (excluding Apple Wallet which has external account setup). All reversible, all incrementally previewable on `localhost:3000`.

---

## Confidence + outstanding questions

| Question | Status |
|---|---|
| Does Anthony want the Apple Wallet pass? | High-value but requires Apple Developer cert ($99/yr). Confirm before building. |
| Does the wedding need EN + FR + AR or just EN? | Anthony's CLAUDE.md says TBD. Defaulting to EN-only first; building the toggle after copy is locked. |
| Is the watercolor visual identity locked or open to revision? | LOCKED per v2 + current site. v3 doesn't touch the watercolor system. |
| What does the photo gallery currently look like? | Need to audit `Photos.tsx` before designing the timeline-progression refactor. |
| Is the FAQ accordion currently good or bland? | Need to audit `FAQ.tsx`. |

---

## Sources

- 10 IG references analyzed via Gemini 2.5 Flash multimodal upload (raw JSON in `assets/design-refs/instagram/_analysis/`)
- Riley & Grey wedding-site survey: https://www.rileygrey.com/wedding-website-examples
- 25-wedding-site round-up: https://sitebuilderreport.com/inspiration/wedding-websites-examples
- The Knot 2026 wedding website builder comparison: https://www.theknot.com/content/best-wedding-websites
- Current site components: `src/components/Hero.tsx`, `Story.tsx`, `RSVP.tsx`, `Venue.tsx`, `Schedule.tsx`, `globals.css`
- v2: `assets/design-refs/SYNTHESIS-v2.md`
- Brand guide: `BRAND_GUIDE.md`
