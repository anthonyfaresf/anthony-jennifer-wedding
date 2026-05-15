# OPENER PHOTO — Splash background

| | |
|---|---|
| **Goal** | Still hero behind the lemon centerpiece on the splash. Watercolor + ink on cream paper, same identity as the save-the-date. |
| **Aspect** | 9:16 portrait |
| **Output path** | `public/elements/opener-photo.jpg` |
| **Primary model** | Higgsfield → Nano Banana Pro |
| **Fallback** | Flux Pro 2 → Seedream 4 |

## Reference uploads

- `public/elements/lemon-hanging.png` — locks lemon shape + leaf style + paper grain.
- The save-the-date PDF (in `assets/inspiration/`) — locks watercolor palette + ink linework.

If the model rejects reference uploads, skip them. The prompt below is self-contained.

## Prompt

```
A hand-painted watercolor and ink illustration on warm cream paper, in the style of fine wedding stationery — butter-yellow lemons, sage-olive leaves, dusty olive linework, visible paper grain, dusty olive-and-cream palette. Mediterranean still life arranged on a cream linen cloth folded loosely at golden hour: hand-thrown ceramic plates in cream and dusty olive, two delicate stemmed glasses with pale pink-gold liquid catching a warm highlight, a clear glass carafe with a soft warm reflection on its shoulder, a wooden board with rustic bread and pale crumbly cheese, a ceramic dish of bright green olives glistening in oil, three ripe butter-yellow lemons whole on an olive branch with silver-green leaves, a sprig of figs, and a single fig leaf. Soft Edison string lights blurred in the deep background, suggested rather than detailed. Light: warm honey golden hour from camera-left, soft falloff to the right, no visible source. The carafe catches a single highlight on its shoulder. Soft watercolor shadows pool under each object. Style: watercolor washes layered wet-on-wet for the cream linen, dry-brush texture on the wooden board, confident loose ink linework defining edges with visible pencil under-drawing in places. Subtle paper grain across the entire frame. Ink lines occasionally break the silhouette where the paint bleeds past — the texture of fine hand-painted wedding stationery. Lemons sit slightly off-center to the left so a centered overlay can land cleanly on top. Soft cream paper margin top and bottom. Aspect 9:16 portrait, highest resolution.
```

## Negatives

```
photographic realism, 3d rendering, glossy plastic, glow effects, neon colors, human figures, text, logos, hyperrealistic, sharp digital edges.
```

## Fallback prompt

Strip to the bare minimum — passes every model:

```
A watercolor and ink still life painting on warm cream paper in the style of fine wedding stationery — butter-yellow lemons, sage-olive leaves, dusty olive linework, visible paper grain. Three ripe yellow lemons whole on a branch with silver-green leaves, a small ceramic dish of bright green olives glistening in olive oil, a sprig of figs and a single fig leaf, and a hand-thrown cream ceramic pitcher. Soft Edison string lights blurred in the deep background. Warm honey golden hour light from the left, soft falloff to the right, no visible source. Loose ink linework, watercolor washes layered wet-on-wet, paper grain texture across the entire frame. No photographic realism, no 3D rendering, no human figures, no text, no logos. Aspect 9:16 portrait, highest resolution.
```

## After generating

1. Save best result to `public/elements/opener-photo.jpg`.
2. Tell me — I'll wire it as the splash background with a soft cream gradient on top so the lemon overlay still pops.

## Notes

Iterated 2026-05-02 after first version rejected by GPT Image / Imagen / DALL·E:

| Old phrase | Why it tripped moderation | Replaced with |
|---|---|---|
| "saucisson" (cured meat) | strict food filter | "rustic bread and pale crumbly cheese" |
| "rose wine" + "wine bottle" + "wine" 3× | alcohol cluster | "pale pink-gold liquid" + "clear glass carafe" |
| "Lebanese monastery terrace" | religious + geographic specificity | "cream linen cloth at golden hour" |
| "(one cut in half showing pulp)" | cutting/dissection language | "three ripe lemons whole" |
| `@lemon-hanging` reference syntax | errored on models without ref support | self-contained description |
| Hard wraps every ~70 chars | tokenizer treats each line as separate instruction | flowing prose, paragraph breaks only |

Skip GPT Image 2 / Imagen 4 / DALL·E for this one — they're too strict on Mediterranean food + alcohol references even when softened. Flux Pro 2 / Nano Banana Pro / Seedream 4 all clear it.
