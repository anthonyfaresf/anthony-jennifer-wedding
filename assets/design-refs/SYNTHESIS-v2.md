---
type: design-synthesis
project: wedding-website
version: 2
sources:
  - https://www.instagram.com/p/DXpfmPFDdN-/  # indierossart (EN, 25s, posted 2026-04-27)
  - https://www.instagram.com/p/DXj5MFZCCOf/  # webgency_invitations (EN, 10s, posted 2026-04-27)
  - https://www.instagram.com/p/DUsQNBHDF80/  # reise.studio (EN, 9s, posted 2026-02-13)
  - https://www.instagram.com/p/DV4Cf8ygNFJ/  # reveliastudio_ (FR, 34s, posted 2026-03-14)
analyzed: 2026-05-01
method: Gemini 2.5 Flash Files API multimodal video upload — full motion + visual signal extracted (replaces v1 ffmpeg stills-only)
v1: SYNTHESIS-v1-stills-only.md (preserved for diff)
status: draft-pending-approval
confidence: high
---

# Wedding Website — Design Synthesis v2 (motion-aware)

## Why v2 exists

v1 was built from 12 ffmpeg-extracted key frames + caption text — no motion, no transition timing, no audio. v1 was right about color/typography/tone but had to **infer** the animation rhythm from static stills. v2 replaces that inference with Gemini 2.5 Flash multimodal video analysis of all 4 reels (timestamped motion moments, not literal per-frame logs). The v1 TL;DR conclusions hold; the motion-rhythm + transition section is now sourced from a video model rather than from static frames.

---

## TL;DR delta (what changed vs v1)

| Aspect | v1 verdict | v2 verdict | Confidence change |
|---|---|---|---|
| Tone direction (cinematic-romantic) | HIGH (4/4 cluster) | HIGH (4/4 best_match = cinematic-romantic on 3 refs, classic-elegant on reise.studio — overlapping family) | unchanged |
| Color palette direction | HIGH (cream + gold + ONE bold accent — synthesis-level claim) | HIGH on the cream/sand base + antique gold; the "single bold accent" rule is synthesis, not a source verdict | unchanged source signal; accent rule remains synthesis-level |
| Envelope-with-wax-seal hero | v1 called it "the format" | 4/4 in this sample is a cross-reference pattern, not a mandate; envelope-opening motion type listed by Gemini on all 4 | reinforced as common pattern, not required |
| Animation pace | "slow-cinematic, 600-800ms" | Gemini classifications: 3/4 = `medium`; indierossart = `medium-cinematic` (the longest, slowest ref). v1's 600-800ms specific timing was inferred, not measured. v2 normalizes to "medium" as the build target — exception preserved. | ⬇️ adjusted |
| Specific motion sequence per ref | inferred from stills | NOW EXPLICIT — timestamped motion arcs below | ⬆️ new signal |
| Audio signature | unasked | **Still missing** — prompt did not request audio. Manual review needed. | ⚠️ gap |

---

## NEW vs v1: Per-reference motion arc (timestamped)

### Ref 1 — indierossart · 25s · pace = `medium-cinematic` (per Gemini)
Motion types: fade-in · slide-up · envelope-opening · scroll-reveal · mask-reveal · text-reveal · stamping · drop-in
- 0:03 — Digital envelope (tulip + wax seal) appears, "tap to open" prompt
- 0:05 — Envelope unfolds, swans-on-lake illustration revealed inside
- 0:06 — Invitation card with "24 September 2026" slides into view
- 0:08 — Event details + ring box slides in from right
- 0:11 — Card expands → "TAP HERE FOR THE Details"
- 0:12 — Two polaroid photos drop onto screen
- 0:14 — "KINDLY RSVP HERE" + arch-framed photo + "OUR LOVE STORY" emerge
- 0:17 — Personalized wax seal **stamps** onto screen below "WITH LOVE Benedict & Sophie" (stamping motion is unique to this ref among the 4)
- 0:20 — Countdown timer appears at bottom

**Borrowable motion device:** the **stamping** action on the wax seal at 0:17 — none of the other refs have this. Closes the page with the same physical-object metaphor the hero opens with (envelope/seal), creating bookend symmetry.

### Ref 2 — reise.studio · 9s · medium pace
Motion types: envelope-opening · scroll-reveal · accordion-expand · fade-in
- 0:01 — Finger taps wax-sealed envelope on phone
- 0:02 — Wax seal **breaks**, envelope **unfolds** into the website
- 0:08 — User taps accordion-style event timeline (THURSDAY 4TH JUNE) — bulleted details reveal

**Note:** Gemini classified this ref as `classic-elegant`, not `cinematic-romantic` — slightly stricter, less moody. Overlapping family but reise is the cleanest.

### Ref 3 — reveliastudio_ · 34s · pace = `medium` (per Gemini) · the longest + most refined
Motion types: fade-in · slide-up · scale · envelope-opening · scroll-reveal
- 0:00 — Wax seal on light bg, "touch to open" prompt
- 0:02 — Wax seal animates **rotating + breaking apart with a sound effect** (Gemini explicitly notes the audio cue here — only ref where audio is called out)
- 0:05 — Warm-filtered couple photo fades in → names "Amara & Ethan" slide up
- 0:09 — Live countdown timer appears
- 0:12 — Venue details + map buttons "Ouvrir dans Maps" / "Itinéraire"
- 0:18 — Multi-day program with timings
- 0:23 — Reception menu (Cocktail, Entrée, Plat, Dessert)
- 0:27 — Code vestimentaire with clickable color palette swatches
- 0:32 — RSVP form

**Borrowable motion device:** the wax-seal **rotation + break** paired with a sound effect (the only ref where Gemini called out audio choreography).

### Ref 4 — webgency_invitations · 10s · medium pace
Motion types: fade-in · slide-up · **parallax** · scale · envelope-opening · scroll-reveal · mask-reveal
- 0:00 — Wax seal animates with "Click to open"
- 0:01 — Envelope opens with **paper-tear effect** → full-bleed hero (fountain + doves + flowers)
- 0:03 — "Wedding Day" + "Viktor & Paula" fade in over hero, date 05.07.26
- 0:04 — Scroll-triggered red bg + "Dear Friends and Family," + countdown
- 0:05 — "Schedule of Events" timeline with **white wave transitions** between sections
- 0:07 — "Location" with faded architectural sketch
- 0:08 — "Dress Code" with ornate gold-framed example images + color palette swatches
- 0:09 — "Details" / contact info

**Borrowable motion device:** the **paper-tear transition** (0:01) and **white wave transitions** between scrolled sections (0:05). Both are signature.

---

## Animation rhythm — v2 verdict (replaces v1 §"Animation rhythm")

### Pace
Gemini classifications: `medium` on reise.studio + reveliastudio + webgency; `medium-cinematic` on indierossart (the 25s ref, longest reveal sequence). v1's "slow-cinematic 600-800ms" specific timing was inferred from stills, not measured. v2 build target: medium pace. **Specific millisecond values are an implementation hypothesis for the build phase — not extracted from source.**

### Motion vocabulary (universal across 4 refs)
1. **envelope-opening** — 4/4 — common hero pattern in this category (frequency, not mandate)
2. **scroll-reveal** — 4/4 — every body section
3. **fade-in** — 4/4 — text intro to most sections
4. **slide-up** — 3/4 (skipped on reise.studio's accordion-only model) — text reveal default

### Motion vocabulary (signature, pick 2-3)
- **mask-reveal** (indierossart, webgency) — for envelope unfold
- **paper-tear** (webgency exclusive) — for section transitions on long scroll
- **stamping** (indierossart exclusive) — for wax-seal close
- **scale** (reveliastudio, webgency) — for couple photo + venue image entrance
- **parallax** (webgency exclusive) — on full-bleed hero photo
- **accordion-expand** (reise.studio exclusive) — for schedule day reveal

### Recommended motion stack for your build (build-phase hypotheses, not source facts)
1. Envelope-opening hero with mask-reveal (4/4 in refs)
2. Wax seal **rotation + break** + a paired sound cue (sourced: reveliastudio's audio choreography)
3. Paper-tear section transitions on long-scroll boundaries (sourced: webgency's signature)
4. Scale-on-entry for couple photos + venue image (sourced as `scale` motion type in reveliastudio + webgency; specific scale/opacity values are build-phase decisions, not source)
5. Stamping motion at the closing footer/signature block (sourced: indierossart 0:17)
6. Accordion-expand for schedule (sourced: reise.studio 0:08 — cleanest if your event has multi-day or multi-section structure)

**v1 said "no bouncy / elastic / rubberband easing" — v2 retains.** (Easing curve is build guidance — see `website-build.md` anti-pattern #11.)

### Reconcile contradiction with v1
- v1 said pace = slow-cinematic 600-800ms. **v2 corrects: Gemini classified 3/4 as `medium`, indierossart as `medium-cinematic`.** Specific millisecond values in v1 were not source-grounded. v2 doesn't replace them with new fabricated numbers — millisecond timing belongs in the build, not the synthesis.
- v1 mentioned "torn-paper edge animation on section boundaries" — v2 confirms this is webgency-exclusive, not universal. Borrow if you want a signature; don't expect every ref to have it.

---

## NEW vs v1: Microinteractions catalog

From Gemini multimodal video analysis with timestamped motion moments. v1 inferred these from stills; v2 lists them with the timestamps Gemini returned.

| Microinteraction | Refs that use it | Treatment |
|---|---|---|
| Wax-seal tap → break/unfold | 4/4 | Opening interaction across all 4 refs. Build hypothesis: wax seal as the tap target (not envelope body) — informed by reveliastudio's "touchez pour ouvrir" copy placement. Optional, not mandate. |
| Wax-seal rotation + sound cue | reveliastudio | Audio cue paired with rotation — sourced. Replicate if you want sensory feedback on the open. |
| Stamping motion on closing wax seal | indierossart (0:17) | Closes the page with the same physical-object metaphor the hero opens with — bookend symmetry. |
| Accordion expand on schedule | reise.studio (0:08) | Tap day → reveal events. Cleanest pattern if your wedding is multi-element. |
| Map button pair | reveliastudio | "Open in Maps" / "Get Directions" — two distinct CTAs, not one. |
| Color palette swatches (clickable) | reveliastudio (0:27), webgency (0:08) | Dress code section — picks up brand palette as interactive element |
| Paper-tear scroll transition | webgency (0:05) | White wave / torn paper between scrolled sections — distinct from animation, this is **layout choreography** |
| Photo polaroid drop | indierossart (0:12) | Photos drop onto screen rather than fade in — physicality |
| Form toggle switches | reveliastudio (0:32) | Switches not dropdowns — confirmed in v1, ref doc backs it up |

---

## NEW vs v1: Camera moves

The references are **phone-screen-content videos**, not real-camera footage — so traditional camera moves (dolly, pan, push-in) don't apply. The "camera" is the user's scroll position + tap interactions.

What we get instead:
- **Scroll-as-camera** — sections move past a fixed viewport; parallax called out explicitly on webgency
- **Scale-as-push-in** — couple photos enter via `scale` motion (reveliastudio + webgency); specific scale ratios are build-phase choices, not in source
- **Tap-as-cut** — finger tap triggers state change (envelope open, accordion expand)

For your build: treat scroll position as the primary "camera move." No autoplay video loops in hero (already in v1 + `BRAND_GUIDE.md` row 47). Parallax on hero paper texture only — exact offset is a build-phase decision, not source.

---

## ⚠️ Gap not closed: Audio signature

The Gemini prompt in `_analyze-design.sh` (the JSON schema block, lines 26-59) does NOT request `audio_signature` (music genre, drop timing, sound design). Only one audio cue surfaced — **reveliastudio's wax-seal rotation has a sound effect** (Gemini called it out unprompted because it was salient). All other audio data is unknown.

**Recommendation:** Either (a) add an `audio_signature` field to the prompt + re-run, or (b) Anthony manually plays the 4 reels with sound on and notes music style. The only audio signal in the source is reveliastudio's wax-seal sound effect (rotation + break). The specific sound choice is a build-phase decision, not in source.

The original task spec asked for music genre, drop timing, sound design — those are not in the JSONs. v2 can't fabricate them. Flag → fix prompt → re-run if signal is needed for the build.

---

## What stands from v1 unchanged

The v1 sections that hold without modification (don't re-read v1 unless diffing). All entries below are recommendations + synthesis, not source facts:
- §"Recommended tone direction" (cinematic-romantic, HIGH — synthesis from 4-of-4 cluster)
- §"Color palette" (cream + parchment + warm near-black + antique gold; the "ONE bold accent" rule + dusty rose pick are recommendation, not source)
- §"Typography" (Cormorant Garamond display + Tenor Sans / Geist body, NEVER plain Inter)
- §"Section structures" mapping table
- §"The signature device" (envelope + wax seal hero — 4/4 confirmed by motion data)
- §"Cross-functional implications" (multilingual RTL, monogram SVG, watercolor venue, real couple photos)
- §"Open questions for you" (5 questions still open)
- §"Anti-patterns to avoid" (Wix Studio look, dried-flower lifestyle, crowded florals, casual scripts, multi-day schedule unless real)

---

## What to do with this v2

1. **Read the per-reference motion arcs above** — pick 2-3 signature motion devices from the catalog (candidates: paper-tear transitions + stamping closing seal + sound-cued wax break)
2. **Adjust your animation pace expectation down** from "slow-cinematic" to "medium" (per Gemini classifications). Specific millisecond values stay deferred to the build.
3. **Decide the audio question** — re-run analysis with audio prompt, or hand-spot manually
4. **Approve direction** → next step below merges v1 + v2 into `BRAND_GUIDE.md` so the build reads ONE doc.

### Handoff (single source of truth for the build)
The build should NOT cross-reference v1 and v2. After approval, do this BEFORE running `/website-new`:
- Open `BRAND_GUIDE.md` in this project
- Replace the TBD palette + fonts fields with v1 §"Color palette" + §"Typography" recommendations
- Add a new "Motion Stack" section using v2 §"Recommended motion stack" + §"Microinteractions catalog"
- Add a "Source pace target" field: `medium` (3 refs) / `medium-cinematic` (indierossart) — picker chooses
- Mark v1 and v2 as `archived-after-merge` in their frontmatter

Then `/website-new --tier=cinematic` reads ONLY `BRAND_GUIDE.md`. v1 + v2 stay on disk for diff history; they don't drive the build.

---

## Method note (replaces v1 method footnote)

- v1 method (preserved at SYNTHESIS-v1-stills-only.md): ffmpeg key-frame extraction + Claude native vision on 12 frames + caption parse. Could not extract motion timing, transition signatures, microinteraction sequencing.
- v2 method: Gemini 2.5 Flash Files API multimodal video upload, full 4 reels analyzed in parallel via `_analyze-design.sh`. Motion + visual fields extracted; audio NOT asked (prompt gap, see above).
- Bug fix that unblocked v2: scripts now auto-source `~/.claude/.env` per `.claude/rules/workflows.md` §2.5. Previous run failed at API key step → ffmpeg fallback.
