# VENUE PHOTO — Venue section background

| | |
|---|---|
| **Goal** | Loose watercolor **underpainting** of Couvent Saint Jean for the Venue section background. Composition matches the rendered reference, but ~40% the visual density so text + map link sit cleanly on top. |
| **Aspect** | 4:3 landscape (default). Optional 9:16 portrait if also used as a Story-style scene. |
| **Output path** | `public/photos/venue.jpg` |
| **Primary model** | Higgsfield → Nano Banana Pro |
| **Fallback** | Flux Pro 2 → Seedream 4 |

## Reference uploads

- `assets/master-refs/venue-rendered.jpg` — **primary reference**. The fully-rendered version Anthony generated 2026-05-02. Locks composition: bell tower position, staircase angle, cloister rhythm, cypress placement left of the tower, lemon canopy on the lower edge. The new image should match this layout — just much looser and emptier.
- `assets/master-refs/venue-real-day.jpg` — actual Couvent Saint Jean. Architectural identity reference (bell-tower silhouette, arch proportions, staircase shape).
- `assets/master-refs/venue-real-night.jpg` — mood reference only. Warm uplighting feel, ceremonial atmosphere. Do NOT copy modern signage, beam lights, or photographic finish.

## Prompt

```
A loose preliminary watercolor underpainting on warm cream paper — minimal and atmospheric, in the style of a fine wedding stationery sketch. Soft architectural silhouette of a Lebanese mountain monastery at golden hour, composition matching the uploaded reference: a simple stone bell tower at center suggested by a single warm wash with a thin cross silhouette at the top, the pointed-arch cloister wrapping the courtyard reduced to a single rhythm of arch shapes — washes only, no individual stones rendered, no architectural details — and a wide central staircase indicated by a few soft horizontal brush strokes between two pale planters. Cypress trees as three vertical soft brushstrokes left of the bell tower. Foliage as loose green-olive smudges, not rendered leaves. Sky a single warm honey-cream wash with a hint of dusk pink at the horizon. Foreground mostly bare cream paper with a few suggested candle dots and a faint olive-leaf-and-lemon branch indication along the bottom edge — no detailed table setting, no chairs, no glassware, no individual flowers. Brushwork extremely loose and unhurried, ~60% of the paper showing through bare cream. Cream-and-stone palette with olive-deep accents and a single soft gold wash catching the bell tower at sunset. Visible paper grain throughout, ink linework reduced to minimal pencil-suggestion only. Atmosphere: a quiet underpainting that reads as background. Even tonal range, no high-contrast areas, no dark pockets — so text and a map link sit clean on top. No people, no signage, no text in the image. Aspect 4:3 landscape.
```

## Negatives

```
fully rendered, detailed, busy composition, detailed table setting, individual stones, fine railings, photographic clarity, dense brushwork, high contrast, deep shadows, neon, theatrical beam lights, modern signage, crowds, watermarks, glossy magazine finish, lens flare.
```

## Fallback prompt

If the model still over-renders:

```
A very loose watercolor underpainting on cream paper — sparse, atmospheric, mostly bare paper. Suggestion of a Lebanese stone monastery at golden hour: a single bell tower silhouette at center with a small cross, soft pointed arches running left and right of it as washes only, a central staircase as a few horizontal brush strokes, three cypress brushstrokes on the left, an olive-and-lemon branch hint along the bottom edge. Sky a single warm honey-cream wash. ~60% of the paper bare. Cream and dusty olive palette, one soft gold accent on the bell tower, paper grain throughout. Even tonal range, low contrast, background-ready. No people, no text, no detail. Aspect 4:3.
```

## After generating

1. Save best result to `public/photos/venue.jpg`
2. Tell me — I'll wire it into the Venue section as a background layer with:
   - `cream-feather-strong` edge bleed so it dissolves into the cream paper
   - A subtle cream wash overlay (~25%) so the venue name, address, schedule, and map link read cleanly on top
   - `paper-grain` continuity with the rest of the page

## Notes

Iterated 2026-05-02 after first version came back beautifully rendered but too detailed for background use:

| First pass | Why it didn't work for background | Skeleton version |
|---|---|---|
| Fully rendered candle table with chairs, glassware, individual flowers | Compete with text content | "no detailed table, no chairs, no glassware, no individual flowers" |
| Detailed stone masonry, individual blocks visible | High-contrast detail draws the eye away from foreground content | "washes only, no individual stones, no architectural detail" |
| Fully painted cloister with depth + interior detail | Reads as a hero image, not a background | "single rhythm of arch shapes — washes only" |
| Detailed foliage, individual leaves on cypress + olive | Busy lower edge | "loose green-olive smudges, three vertical soft brushstrokes for cypress" |
| Saturated golden-hour sky with detailed clouds | Pulls attention from architecture silhouette | "single warm honey-cream wash with a hint of dusk pink at the horizon" |

Rendered version (`venue-rendered.jpg`) is kept as a reference for composition lock, NOT a deliverable. The skeleton is what ships to the website.
