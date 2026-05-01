---
type: design-synthesis
project: wedding-website
version: 3
sources: 15 screenshots of @missingpieceinvites Instagram Reel (assets/design-refs/website references/)
analyzed: 2026-05-01
status: motion-vocabulary-extraction
identity: UNCHANGED — cream + lemons + olive-deep + gold from the save-the-date stays exactly as locked
purpose: extract animation/motion patterns ONLY · DO NOT touch palette, fonts, typography, illustrations
---

# Wedding Website — Motion vocabulary from @missingpieceinvites

## Critical clarification

The reference reels are showing **how content moves**, not what color the world is. The wedding identity is locked from the save-the-date (cream paper, olive-deep + gold typography, butter-yellow lemons, sage leaves). That stays. What we extract from these refs is the **motion + composition patterns**.

## Motion patterns extracted (apply these · keep our identity)

### 1. Layered paper-craft parallax
Multiple z-depth layers that move at different scroll speeds. Foreground · midground · background each scrub at a slightly different rate, creating real depth as the user scrolls. Pop-up book physics: foreground elements move faster than background.

**Apply:** lemons in foreground drift faster than midground elements (figures, cafe tables) which drift faster than background washes (sky, mountains).

### 2. Floating decorative elements that drift across sections
A single hero element (in the ref: hot air balloon · crescent moon · doves) is positioned `fixed` or `absolute` in the layout and drifts UPWARD or ACROSS as the user scrolls multiple sections, creating a sense that the world is alive and the visitor is moving through one continuous space.

**Apply:** a paper airplane traces a soft arc across the entire page as you scroll (echoing Panel 03's plane) · or a single watercolor lemon drifts slowly upward across the right edge · or a soft cloud drifts across the top of every scene.

### 3. Decorative top-arch / ornamental framing
Ornate filigree at the top of the hero acts as the "you are entering a storybook" anchor. Could also bookend the footer with the same motif (closing the book).

**Apply:** an ornamental SVG arch in olive-deep + gold at the top of the page (NOT the navy gold of the ref — our gold #b8924a) and a mirrored close at footer.

### 4. Pop-up book depth (1-3px paper-shadow under every layer)
Every paper element has a soft 1-2px shadow underneath suggesting it was cut and laid above the page. This is already in the storyboard panels — it should be amplified in the live site's caption cards, photo cards, hero card.

**Apply:** caption cards · photo gallery cards · venue card · RSVP form all get the same paper-shadow treatment so the whole site reads as paper-cut layers, not flat web blocks.

### 5. Continuous scroll narrative (no hard section breaks)
The reference has no obvious section dividers — it scrolls as ONE continuous experience. Elements flow between sections.

**Apply:** soften the current hard transitions between Hero → Story → Photos → Venue. Use paper-tear transitions (sourced from webgency reel in SYNTHESIS-v2) at boundaries · or have a floating element (the airplane / lemon / cloud) bridge across the boundary.

### 6. Subtle ambient motion (independent of scroll)
Stars twinkle, glow oscillates, balloon drifts even when you're not scrolling. Tiny life signals.

**Apply:** lemons gently sway (1-2px rotation oscillation) · the gold divider lines pulse softly · subtle warm glow on key elements.

### 7. Section-hero illustrations
Each major section gets a paper-craft hero illustration that establishes its mood (in the ref: castle for venue, balloon for "story" intro, doves for RSVP).

**Apply (NEXT generation pass — not yet in master-refs):**
- Hero: an ornamental top-arch with lemons + sage filigree
- Story intro: a single oversized lemon-and-sage cluster acting as the "open the storybook" device
- Photos: a hand-cut paper film-strip frame with deckled edges
- Venue: a watercolor of Couvent Saint Jean — paper-cut style
- Schedule: a watercolor scroll/parchment with the day's agenda
- RSVP: a wax-sealed envelope (already in Hero — could echo)
- Footer: closing filigree mirroring the Hero arch

## What this rule REPLACES

It does NOT replace v2's envelope+wax-seal hero (still good, still kept). It does NOT replace the locked identity (cream + lemons + olive + gold).

It REPLACES my (Claude's) previous misread that the storyboard scenes should be standalone autoplay-on-viewport gallery cards. Story.tsx is already on the right track now (sticky + scrub) — it just needs MORE of the patterns above (parallax depth + a floating element bridging scenes + paper-tear boundary).

## Cross-references

- v1: SYNTHESIS-v1-stills-only.md (archived, stills only)
- v2: SYNTHESIS-v2.md (motion-aware via Gemini, 4 IG reels — envelope+wax-seal device source)
- v3 (this): @missingpieceinvites motion vocabulary
- Identity source of truth: `BRAND_GUIDE.md` (cream + olive + gold + lemons) + `assets/master-refs/Untitled design.svg` (minimal save-the-date) + the lemon-bordered save-the-date PNG (festive variant)
