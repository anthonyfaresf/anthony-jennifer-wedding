# Wedding — Brand Guide

*Fill as decisions are made. This drives every design choice in the build.*

## The Couple
- **Anthony** Fares Faraj
- **[Fiancée — TBD]** [last name TBD]
- **Wedding date**: TBD
- **Venue**: TBD (name + address)
- **City / country**: TBD

## Tone direction
*(Pick ONE primary, optionally one secondary. Drives typography, color, animation rhythm.)*
- [ ] Classic-elegant (serif, ivory + gold, gentle fades)
- [ ] Editorial-modern (high-contrast typography, asymmetric layouts, bold scroll moments)
- [ ] Cinematic-romantic (warm tones, slow camera-pan animations, full-bleed imagery)
- [ ] Playful-warm (rounded sans, terracotta + cream, soft motion)
- [ ] Minimal-quiet (neutral palette, generous whitespace, almost no animation)

## Color palette
*(Filled after Instagram refs analyzed. Keep to 4–6 colors max.)*
- Primary: TBD
- Secondary: TBD
- Accent: TBD
- Background: TBD
- Text: TBD

## Typography
*(Pick from Google Fonts / Fontshare / Uncut.wtf — never default to Inter per `website-build.md`.)*
- Display (headings): TBD
- Body: TBD
- Accent (script, optional): TBD

## Imagery direction
- Photo style: editorial / candid / both
- Photo treatment: untouched / warm filter / black-and-white accents
- Aspect ratios used: portrait hero, square gallery, full-bleed landscape
- Source: existing couple photos at `assets/photos/`

## Voice
- First-person plural ("we", "our")
- Warm, specific, not generic-romantic
- Banned: "the love of my life" / "soulmate" / "fairy tale" / "happily ever after"
- Anti-AI-writing rules apply (load `.claude/skills/anti-ai-writing/SKILL.md` before writing any copy)
- Languages: TBD (EN only / EN+AR / EN+AR+FR)

## Animation rhythm
- Scroll-triggered reveals only (no autoplay loops that drain mobile battery)
- ~600ms ease-out for entrances (no bouncy / elastic per anti-pattern list)
- Hero: subtle parallax on background imagery
- Sections: staggered fade + 8px lift on each child
- Photo gallery: scale + opacity on viewport entry
- RSVP form: focus-state animations + success state (confetti optional, tasteful)
