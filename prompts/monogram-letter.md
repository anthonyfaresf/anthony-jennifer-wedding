# MONOGRAM — Opening letter card (A & J)

| | |
|---|---|
| **Goal** | First frame of the website. Hand-painted A & J monogram on cream paper, same identity as `opener-photo.md` + `venue-photo.md`. Negative-space-heavy so it reads as a title card; will be animated by Seedance after generation. |
| **Aspect** | 9:16 portrait (matches splash + opener video) |
| **Output path** | `public/elements/monogram.png` (PNG, transparent or cream — see notes) |
| **Primary model** | Nano Banana Pro · GPT Image 2 (both run, pick best) |
| **Fallback** | Flux Pro 2 → Seedream 4 |

## Reference uploads

- A photo of Anthony & the fiancée (Anthony will attach) — used only as **identity context** (the couple this monogram represents). Do NOT translate the photo into a portrait. The output is letters + botanicals only.
- `assets/master-refs/venue-rendered.jpg` and/or the save-the-date PDF — locks watercolor palette, ink linework, paper grain.

If the model rejects reference uploads, the prompt below is self-contained.

## Prompt

```
A hand-painted watercolor and ink monogram on warm cream paper, in the style of fine wedding stationery — butter-yellow, sage-olive, and dusty-olive palette with visible paper grain. Two large intertwined serif initials, a capital "A" on the left and a capital "J" on the right, joined by an elegant calligraphic ampersand "&" in the center. The letters are painted in confident dusty-olive ink with a soft butter-yellow watercolor wash filling the inside of each stroke — wet-on-wet, with the wash bleeding slightly past the ink edge in places, the way real watercolor stationery breathes. Visible pencil under-drawing peeks through at the serifs. The ampersand is the most ornate element — flourished, hand-drawn, slightly larger than the letters, with a single fine ink hairline curling out into a small olive sprig on its lower tail. A small cluster of botanicals frames the monogram: a single butter-yellow lemon with two silver-green leaves resting at the lower-left base of the A, and a sprig of three sage-olive leaves with one small olive at the lower-right base of the J — both painted loosely, no detailed veins, just shape and tone. A few scattered ink dots and a faint pencil flourish under the letters suggest a baseline without drawing one. The composition sits in the upper-center of the frame with generous bare cream paper above, below, and on both sides — at least 60% of the canvas is untouched cream paper so the monogram reads as a title. Soft warm honey light implied from camera-left, very gentle shadow pooling under the lemon. Paper grain texture across the entire frame. Ink lines occasionally break the silhouette where the paint bleeds past. No background scene, no table, no architecture, no figures — only the monogram and its small botanical accents floating on cream paper. Aspect 9:16 portrait, highest resolution.
```

## Negatives

```
photographic realism, 3d rendering, glossy plastic, glow effects, neon colors, human figures, faces, portraits, hyperrealistic, sharp digital edges, gold foil, metallic ink, gradient backgrounds, decorative borders, frames, full wreaths, dense floral arrangements, multiple alphabets, sans-serif fonts, modern typography.
```

## Fallback prompt

Strip to bare minimum — passes every model:

```
A hand-painted watercolor and ink monogram on warm cream paper in the style of fine wedding stationery. Two large intertwined serif capital letters "A" and "J" joined by an ornate calligraphic ampersand "&" in the center. Letters painted in dusty-olive ink with a soft butter-yellow watercolor wash inside each stroke, wet-on-wet, with the wash bleeding slightly past the ink edge. A single butter-yellow lemon with two silver-green leaves at the lower-left base of the A, and a sprig of three sage-olive leaves at the lower-right base of the J. Generous bare cream paper around the monogram — at least 60% of the canvas is untouched. Visible paper grain throughout. No background, no scene, no figures, no text other than the letters A J and the ampersand. Aspect 9:16 portrait, highest resolution.
```

## Variations to try (one render each, then pick)

1. **Intertwined (default above)** — A and J slightly overlap, ampersand sits between/over the joint.
2. **Stacked** — A above the ampersand, J below, vertically aligned, narrower footprint.
3. **Side-by-side spaced** — A and J cleanly separated with the ampersand centered between them, more breathing room.

Tell the model which variation in a single line at the top of the prompt if you want to lock one.

## After generating

1. Save best result to `public/elements/monogram.png`.
2. Send it to me — I'll confirm it matches the identity, then we'll write the Seedance prompt to animate it (ink draws on → watercolor wash blooms in → botanicals settle → soft hold).

## Notes

- This is the **first frame** of the site — it must feel like opening a wedding invitation. Quiet, confident, hand-made.
- The couple photo is reference for identity *only* — never render faces, never translate it into a portrait. Letters + botanicals only.
- If GPT Image 2 over-renders into a full decorative crest, drop to the fallback prompt — it strips ornament aggressively.
- Cream paper background should match `opener-photo.md` and `venue-photo.md` exactly — same warm tone, same grain — so the three assets read as one set.
