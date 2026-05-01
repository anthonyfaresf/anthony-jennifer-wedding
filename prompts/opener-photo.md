# OPENER PHOTO — Splash background

**Goal:** A still hero image to live behind the lemon centerpiece on the splash. Watercolor + ink on cream paper. Mediterranean tablescape. Same identity as the save-the-date.

**Tool:** Nano Banana Pro (highest quality) on Higgsfield. Aspect 9:16 portrait so it works as the mobile splash background. Save the result, then we layer the existing `lemon-hanging.png` + monogram on top.

**Reference uploads (drop these in Higgsfield as reference images):**
1. `public/elements/lemon-hanging.png` — the centerpiece lemons (locks the lemon style + leaf shape + paper grain)
2. The save-the-date PDF or screenshot (locks watercolor style + palette + ink linework)
3. Optional: any of the existing scene frames in `public/frames/scene-01-meeting/f-15.jpg` (locks the table + Edison-light feel from the Lebanon biergarten)

**Prompt (paste verbatim):**

```
A hand-painted watercolor and ink illustration on warm cream paper, in the
exact style of @lemon-hanging — same butter-yellow ripe lemons, same
sage-olive leaves, same loose ink linework, same visible paper grain,
same dusty olive-and-cream palette as the wedding stationery.

Composition: an intimate Mediterranean tablescape on a stone Lebanese
monastery terrace at golden hour. A cream linen tablecloth folded loosely.
Hand-thrown ceramic plates in cream and dusty olive. Two delicate stemmed
glasses half-filled with rose wine, light catching the curve of the bowls.
An unlabeled glass wine bottle with a soft warm reflection on its
shoulder. A small wooden board with thinly-sliced saucisson laid in a
fan. A ceramic dish of bright green olives glistening in olive oil. Two
ripe yellow lemons (one cut in half showing pulp, one whole) resting
beside an olive branch with small dark olives and silver-green leaves.
A sprig of figs and a single fig leaf. Soft Edison string lights blurred
in the deep background, suggested rather than detailed.

Light: warm honey golden hour from camera-left, soft falloff to the
right, no visible source. The wine bottle catches a single highlight on
its shoulder. Soft watercolor shadows pool under each object.

Style — strict: watercolor washes layered wet-on-wet for the cream
linen, dry-brush texture on the wooden board, confident loose ink
linework defining edges with visible pencil under-drawing in places.
Subtle paper grain across the entire frame. Ink lines occasionally
break the silhouette where the paint bleeds past — the texture of fine
hand-painted wedding stationery.

Hard NOs: no photographic realism, no 3D rendering, no AI sheen, no
glossy plastic surfaces, no perfectly clean edges, no glow effects, no
dramatic lighting, no neon colors, no characters or human figures, no
text, no logos, no labels on the bottle.

Aspect ratio: 9:16 portrait. Highest resolution available. The lemons
sit slightly off-center to the left so a centered overlay (lemon
cluster + monogram) on the final website lands cleanly on top. Soft
cream paper margin, ~8% of canvas, on top and bottom.
```

**Why these constraints:**
- "in the exact style of @lemon-hanging" + reference upload = locks the watercolor identity (per `pattern-library.md` shape-lock prompting + master-refs workflow)
- "no photographic realism / 3D / AI sheen" = anti-AI-look checklist from `workflows.md` Product Creative Pipeline
- 9:16 + composition note = ensures the centered lemon+monogram overlay has visual breathing room
- All elements you asked for (charcuterie, wine bottle, glasses, lemons, olives) listed by name + arrangement so Nano Banana doesn't drop any
- Light by effect ("warm honey golden hour from camera-left, soft falloff to the right, no visible source") per Nano Banana deep format

**After generating:** save best result to `public/elements/opener-photo.jpg`. Then ping me and I'll wire it as the splash background with a soft cream gradient on top so the lemon overlay still pops.
