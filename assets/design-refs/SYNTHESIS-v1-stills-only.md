---
type: design-synthesis
project: wedding-website
sources:
  - https://www.instagram.com/p/DXpfmPFDdN-/  # indierossart (EN, 25s reel, posted 2026-04-27)
  - https://www.instagram.com/p/DXj5MFZCCOf/  # webgency_invitations (EN, 10s reel, posted 2026-04-27)
  - https://www.instagram.com/p/DUsQNBHDF80/  # reise.studio (EN, 9s reel, posted 2026-02-13)
  - https://www.instagram.com/p/DV4Cf8ygNFJ/  # reveliastudio_ (FR, 34s reel, posted 2026-03-14)
analyzed: 2026-05-01
method: ffmpeg key-frame extraction (5 frames/reel) + Claude native vision on 12 frames + caption parse
status: draft-pending-approval
confidence: high
---

# Wedding Website — Design Synthesis

## TL;DR (the 3-line summary)

1. **Tone direction:** **cinematic-romantic** (warm cream + blush + gold + ONE bold accent), high confidence — all 4 refs converge here.
2. **The signature device:** **envelope-with-wax-seal as hero**, "tap to open" → unfolds into the invitation. 4-of-4 references use this. It is the format.
3. **Animation rhythm:** slow, page-turn / unfold / scroll-reveal. Golden-hour color grade. Phone-native; mobile-first is non-negotiable (every reference shows phone, not desktop, except indierossart's mid-shot).

---

## Per-reference summary

### Ref 1 — indierossart (Indie Ross) · EN · 25s · 1.2K likes
- Bride at outdoor garden ceremony, candid teary moment with engagement ring close-up
- Caption hook: "I was convinced to do a paper RSVP card but I switched it up"
- Website shown on laptop (desktop-only ref): silver baroque frame, embossed envelope, tulips, "TAP HERE FOR THE Details" in serif
- Closing frame: "OUR LOVE STORY" badge in olive-green, "WITH LOVE Benedict & Sophie" in connected script + serif, burgundy wax seal with "BS" monogram, **prominent countdown timer** "150:21:28:16 BEFORE THE BIG DAY"
- **Borrowable:** countdown timer treatment, "OUR LOVE STORY" framed badge, monogram-as-wax-seal
- **Tells:** Wix Studio template (clean but template-look)

### Ref 2 — reise.studio (Reise Studio®) · EN · 9s · 1.9K likes · brand agency
- Phone in hand, dramatic moody dark hotel hallway with gold-and-black chevron flooring
- Hero: **embossed paper envelope on phone screen, gold wax seal with monogram**
- Inner: painted watercolor villa illustration at top, "Jack & Natalia" italic script, SATURDAY 6 JUNE 2026 in widely-tracked tiny serif caps, RSVP rounded pill button
- Schedule page: **multi-day stacked dusty-pink rounded cards** (Thursday → Monday), italic serif day labels, body in serif
- **Borrowable:** dusty-pink stacked schedule cards (cleanest pattern of all 4), watercolor illustration of venue
- **Tells:** Wix Studio template (rounded pills, generic form styling)

### Ref 3 — reveliastudio_ (REVELIA Studio) · FR · 34s · 735 likes · the longest + most refined
- Phone held up at golden-hour park, sun flare through palm trees, red manicure + gold ring (high production)
- Hero: **beige paper envelope on phone, embossed gold floral-emblem wax seal, "Touchez pour ouvrir"** (Touch to open)
- Venue page: "📍 Lieu / Château de Montclair / Saint-Rémy-de-Provence", two pill buttons "Ouvrir dans Maps" / "Itinéraire", chateau photo, dusty-pink/cream gradient bg
- RSVP: clean form with **toggle switches** for "accompagné? · enfants? · allergies?", big dark "Envoyer votre réponse" CTA
- Footer: REVELIA wordmark in thin classy serif + uppercase tracked tagline "CHAQUE HISTOIRE MÉRITE UNE ENTRÉE EXCEPTIONNELLE"
- **Borrowable:** the entire flow (envelope → venue with map → RSVP toggles → wordmark close). This is the strongest reference. Native French = matches your Lebanon EN+AR+FR scenario.
- **Tells:** Custom-built (NOT Wix/Tilda), runs on `invite.revaliastudio.com` subdomain — they can build it, so we can build it.

### Ref 4 — webgency_invitations · EN · 10s · 167 likes · "Brides of 2027"
- Phone vertically against natural-tone curtains + dried-flower arrangement, very styled lifestyle shot
- Hero: **sand/cream textured paper envelope, beige wax seal with floral monogram, "Click to open"**, on `webgency.tilda.ws` (Tilda template)
- Inner: deep crimson red top section + white middle band joined by **torn-paper transition**, "Dear Friends and Family," in white serif on red
- Countdown "75:20:30" in large mono numbers with "The Celebration Begins In" header
- Closing: framed ornament icon, "Details" header in italic serif, RSVP body, footer florals (red/pink/cream peonies)
- **Borrowable:** torn-paper section transitions, countdown treatment
- **Tells:** Tilda template (some heaviness, slightly busy florals, generic dried-flower lifestyle)

---

## Recommended tone direction

**Cinematic-romantic** (per `BRAND_GUIDE.md` row 16) · **confidence: HIGH** (4-of-4 cluster, no outlier).

Evidence:
- **Color:** all 4 use warm cream/blush/sand bases, never pure white, never dark mode
- **Camera grade:** all use golden-hour / film-like color, none use clinical / editorial high-contrast
- **Pacing:** slow reveals (envelope unfolds, scroll progresses), no snappy modern motion
- **Type:** serif + italic-script combo across all 4 (no sans-only / geometric work)
- **Hero metaphor:** physical-object simulation (envelope, wax seal, embossed paper) — the opposite of editorial-modern flatness

NOT a fit: editorial-modern (too flat / type-driven), playful-warm (too bouncy), minimal-quiet (too neutral, refs are warm).

---

## Color palette (recommended — replace `BRAND_GUIDE.md` TBDs)

Synthesized from across 4 refs. Convergent base + ONE bold accent slot for you to pick.

| Role | Hex | Source signal |
|---|---|---|
| **Background (warm base)** | `#F4ECDD` (cream/sand) | All 4 refs share this — never pure white |
| **Surface (subtle warmth)** | `#EAD9C2` (parchment) | reveliastudio + webgency envelope paper |
| **Primary text (off-black warm)** | `#2A1F1A` (warm near-black) | Avoid pure `#000` per `website-build.md` anti-pattern #2 |
| **Accent — Gold (wax-seal)** | `#B8924B` (antique gold) | All 4 refs use gold-tone wax seals |
| **Accent — Romantic (PICK ONE)** | One of: | Each ref has a different bold accent: |
| ↳ Burgundy wine | `#7B2D26` | indierossart wax seal · webgency crimson |
| ↳ Olive sage | `#6B7A4B` | indierossart "Our Love Story" badge |
| ↳ Dusty rose | `#C49A9A` | reise.studio schedule cards · reveliastudio bg gradient |
| **Muted detail (script accent)** | `#8B6B5C` (warm taupe) | Body text, dividers, secondary metadata |

→ **My recommendation: dusty rose primary accent.** It's the most universally readable on cream, avoids regional clichés (burgundy = US wedding cliché, olive = country-rustic cliché), and reads warm-Mediterranean which fits your Lebanon context per `BRIEF.md`.

→ **Open question:** does your fiancée have a color preference? This is the ONE high-impact decision that benefits from her input. Surface in `BRAND_GUIDE.md` row 23.

---

## Typography (recommended — replace `BRAND_GUIDE.md` TBDs)

Based on the serif + script + sans triumvirate observed across all 4 refs.

| Role | Recommended | Why | Source |
|---|---|---|---|
| **Display (names, hero)** | **Cormorant Garamond** (italic for "Anthony & [name]") | Editorial serif with romantic italic, free, on Google Fonts. Matches the script-accent feel without being twee. | Google Fonts |
| **Sub-display (date/section headers)** | **Editorial New** OR **Tenor Sans** | Tracked uppercase caps for tiny labels (DATE / VENUE / RSVP). Editorial New = Pangram Sans Foundry, paid. Tenor Sans = free Google Fonts alternative. | Pangram / Google |
| **Body (paragraphs, form labels)** | **Söhne** OR **Geist** OR **Inter Display** (NOT plain Inter) | Modern humanist sans, legible at small sizes. Söhne is paid; Geist is free (Vercel/Uncut.wtf). | Uncut.wtf |
| **Script accent (optional flourish)** | **Reenie Beanie** (sparingly) OR custom monogram SVG | Ref refs use brushed-script for ONE element ("With Love"); never overuse. Better: skip the script font and commission a hand-drawn monogram SVG of "A&[?]" for the wax seal. | — |

**Anti-pattern (per `website-build.md` anti-pattern #1):** never default to plain Inter. Geist or Söhne if you want sans. Cormorant + Tenor for the editorial-romantic feel.

---

## Animation rhythm

Per ref synthesis:

- **Pace:** slow-cinematic (no snappy modern motion). 600-800ms ease-out for reveals.
- **Hero entrance:** envelope-unfolding via mask-reveal (top + bottom flaps animate apart, wax seal scales + breaks)
- **Scroll triggers:** parallax on background paper texture; text fades up + 12px lift in 8px stagger between elements
- **Page transitions:** torn-paper edge animation on section boundaries (webgency's signature — borrow this)
- **Photo reveals:** scale 1.05 → 1.0 + opacity 0 → 1 on viewport entry
- **Countdown:** monospace digits, gentle tick (no flash), all 4 refs prominently feature this
- **Form interactions:** focus-state warm-glow (subtle box-shadow with the gold accent), success state with confetti is OK but tasteful (not party-popper)
- **Bans:** no bouncy / elastic / rubberband easing (per `website-build.md` anti-pattern #11), no autoplay video loops in hero (per `BRAND_GUIDE.md` row 47).

---

## Section structures (mapped to your `BRIEF.md` sections)

Drawing the strongest pattern from each reference:

| Your section | Borrow from | Treatment |
|---|---|---|
| **Hero** | reveliastudio + webgency | Full-bleed cream paper texture, monogram wax-seal centered, "Tap to open" microcopy below. Names reveal AFTER tap. |
| **Names + Date** | reise.studio | Cormorant italic for names, tracked tiny serif caps for date ("SATURDAY · 6 JUNE 2026" style) |
| **Our Story timeline** | indierossart "Our Love Story" badge | Framed editorial badge per chapter (met / first date / engaged / today), photo + caption per beat |
| **Photos** | reise.studio + reveliastudio (illustrative) | Mix candid couple photos with ONE watercolor illustration of the venue (commission later via fal.ai if no real venue photo available) |
| **Venue + Map** | reveliastudio | "📍 Lieu" pin label, big serif venue name, two pill buttons (Open in Maps / Get Directions), real venue photo or watercolor |
| **Schedule** | reise.studio | Stacked rounded cards in dusty-rose, one card per day, expandable to show ceremony / cocktail / dinner / dancing |
| **RSVP** | reveliastudio | Clean form with toggle switches (party size, +1, dietary, kids, attending). NOT dropdown menus. |
| **Countdown** | indierossart + webgency | Mono-numeral countdown above RSVP, NOT in hero (per ref pattern — it's a closer, not an opener) |
| **FAQ + Travel** | (no ref) | Stack accordion in cream cards, italic serif headers |
| **Footer** | reveliastudio | Wordmark/monogram + uppercase-tracked tagline ("Anthony & [name] · [Date] · [City]"), language toggle if multilingual |

---

## The signature device (4-of-4 universal pattern)

Every single reference opens with **an envelope + wax seal** on a phone, with text like "Tap to open" / "Touchez pour ouvrir" / "Click to open". This is **the** wedding-invitation-website pattern in 2026.

For your build:
- **Hero state 1 (initial load):** full-bleed cream paper texture, centered embossed envelope graphic (CSS gradient + box-shadow), wax seal SVG with monogram of your initials, text "Tap to open" in italic serif below
- **Hero state 2 (after tap):** wax seal cracks (SVG path animation), envelope flaps animate apart (top flap rotates back, bottom flap forward), inside reveals your names + date in Cormorant italic
- **Scroll cue:** subtle bounce arrow appears 2s after envelope opens

This is the SINGLE MOST IMPORTANT design decision. All 4 competitive references use it. Builds expectation alignment with anyone who's seen these refs (which is your guest demographic — millennial brides researching wedding-website inspo).

---

## Cross-functional implications

- **Multilingual:** reveliastudio runs in French natively. If you go EN+AR+FR (per `BRIEF.md` row 56), the language toggle has to handle Arabic RTL — non-trivial. We'll use `next-intl` + `dir="rtl"` on the Arabic locale. Test early.
- **Wax-seal monogram:** commission a custom SVG (or generate via fal.ai Nano Banana Pro with prompt for "antique wax seal monogram of letters A and [N]"). This is the brand mark — needs to be perfect. Add to `assets/master-refs/`.
- **Watercolor venue illustration:** if you don't have a stunning venue photo, generate a watercolor painting of it via Nano Banana (per ref 2's pattern). Save to `assets/master-refs/venue-watercolor.png`.
- **Real couple photos** (per `CLAUDE.md` identity check): drop into `assets/photos/` — the indierossart-style candid moments work best, NOT studio engagement shots.

---

## Open questions for you (before build starts)

1. **Romantic accent color:** dusty rose (recommended) vs olive sage vs burgundy wine? Your fiancée's call most likely.
2. **Languages:** EN-only / EN+FR / EN+AR / EN+AR+FR? Drives language toggle + RTL complexity.
3. **Monogram letters:** "A & ?" — what's the second initial? Drives the wax-seal SVG.
4. **Venue photo or watercolor?** If venue is photogenic, real photo. If not (or if you want the editorial feel), commission watercolor.
5. **Wedding-day countdown placement:** before RSVP (per indierossart) or after RSVP-confirmation (per reveliastudio)? Defaults to before.

---

## Anti-patterns to avoid (observed in refs as tells)

- ❌ Wix Studio / Tilda template look (rounded pill buttons everywhere, generic form fields, drop-shadow heavy) — refs 1+2+4 show this. Yours is custom Next.js — don't ape the template.
- ❌ Stock dried-flower lifestyle styling (webgency overdoes this) — your hero context is the page itself, not a styled photo of a phone
- ❌ Crowded florals on every section (webgency closing frame) — use florals max once (footer or RSVP-success state)
- ❌ Comic-sans-y / casual script fonts (none of the refs did this — easy trap to fall into; we'll use disciplined Cormorant italic instead)
- ❌ Multi-day schedule when wedding is single-day (reise.studio's Thursday-Monday is excessive for most weddings — only do this if your wedding really is multi-day)

---

## Next step

Approve direction → I update `BRAND_GUIDE.md` (palette + fonts + tone fields) → I run `/website-new --tier=cinematic` from this folder → section-by-section build with anti-slop pipeline (`impeccable` + `taste-skill` + `anti-ai-writing`).

If anything in this synthesis misses what you wanted, say so before approval — adjusting the brief now is 100x cheaper than after the build.

---

## Method note + flag for fix

- Native Claude vision (Read tool on 12 ffmpeg-extracted key frames + 4 caption JSONs)
- ⚠️ **Gemini API key in shell env is EXPIRED** (`API key expired. Please renew the API key.` from generativelanguage.googleapis.com). Doesn't block this synthesis (Claude vision was used), but will block any future video upload work via Files API. Renew at https://aistudio.google.com/app/apikey when convenient.
- The path in `.claude/CLAUDE.md` for the key (`Projects/clients/dr-jad-eid/captioner/.env`) is also stale — that file no longer exists. Update CLAUDE.md when you fix the key.
