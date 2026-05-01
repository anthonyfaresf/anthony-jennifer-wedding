# OPENER VIDEO — Pre-Website Experience

**Goal:** A 6-8 second cinematic watercolor opener. Starts on the wider Mediterranean tablescape, pushes into the lemon centerpiece, ends on a frame that matches `lemon-hanging.png` exactly. After the video plays, the static splash (lemons + name + AF&U) takes over and the user scrolls into the website.

**Tool:** Higgsfield → Seedance 2.0 image-to-video, **End Frame mode**. 9:16 portrait, 8 seconds.

**Why end-frame mode:** Seedance generates a video that LANDS on the image you upload as the end frame. Upload `public/elements/lemon-hanging.png` as the end frame → the video pushes through the wider scene and resolves precisely on our existing lemon centerpiece. Zero seam between the video and the static splash that follows.

---

## Setup in Higgsfield

1. Open Seedance 2.0 (i2v mode)
2. **End Frame:** upload `public/elements/lemon-hanging.png`
3. **Start Frame:** upload the photo from `prompts/opener-photo.md` (after generating it)
   - If you don't have it yet: leave start frame blank, Seedance will generate one from the prompt
4. Aspect: **9:16**, Duration: **8s**, Camera Fixed: **OFF** (we want gentle motion)
5. Paste the prompt below

---

## Prompt (paste verbatim into Seedance)

```
Watercolor and ink illustration animation, the exact style of fine
hand-painted wedding stationery — butter-yellow lemons, sage-olive
leaves, dusty olive linework, warm cream paper grain breathing across
the entire frame.

Open on a Mediterranean tablescape on a stone Lebanese monastery
terrace at golden hour. Cream linen tablecloth, ceramic plates in
cream and olive, two stemmed glasses of rose wine catching a soft
highlight, an unlabeled glass wine bottle, a wooden board with thinly
sliced saucisson, a ceramic dish of green olives glistening in oil,
halved lemons, an olive branch with small dark olives. Soft Edison
string lights blurred in the deep background.

Camera: slow 6-degree dolly-in toward the centerpiece, gentle
0.4-degree handheld micro-tremor — 8s.

Light: warm honey golden hour from camera-left, soft falloff to the
right, no visible source. The wine bottle catches a single highlight
on its shoulder. Watercolor shadows pool under each object and shift
ever so slightly as the camera moves. Edison bulbs glow as small
soft halos in the background bokeh.

Motion: the cream linen folds breathe, the wine in the glasses ripples
gently, a single drop of juice releases from the cut lemon and falls
into the watercolor wash, the olive branch sways 0.5 degrees in a soft
warm breeze, ink linework settles around each shape as the dolly
progresses. Paper grain holds steady throughout.

The push-in tightens onto a single sage-leaf branch with three ripe
butter-yellow lemons hanging — the final frame matches the end-frame
upload exactly: same composition, same color, same paper grain, same
ink lines. Hold the lemons for the final 1.2 seconds of the clip.

Watercolor and ink only. No photographic realism. No 3D rendering. No
glossy surfaces. No AI sheen. No characters. No text. No logos.
Negative: 3d render, photographic, glossy, plastic, neon, ai-art.
```

---

## Why these constraints (Seedance-verified rules from `seedance-verified.md`)

- **No "Visual Style:" or "Audio:" labels** — flowing prose only ✓
- **Camera AFTER em-dash with duration** — `camera: slow 6-degree dolly-in... — 8s` ✓
- **Light by EFFECT not source** — "warm honey golden hour from camera-left, soft falloff" not "softbox at 30°" ✓
- **Physical grounding** — "drop of juice releases / falls", "linen folds breathe", "olive branch sways" ✓
- **Negatives inline at end, 2-3 targeted items** — `3d render, photographic, glossy, plastic, neon, ai-art` ✓
- **Word count: ~210** — within the 100-180 sweet spot for narrative + adds shot detail because end-frame mode needs aim ✓

---

## Fallback if Seedance morphs

If the end frame doesn't lock cleanly (Seedance occasionally over-interprets), try:

1. **Switch to Kling 3.0 multi-scene mode** in Higgsfield — same prompt, but Kling natively constrains start/end frames more strictly
2. **Tighten the prompt's last paragraph** — change "matches the end-frame upload exactly" to "freezes on the end-frame upload — identical composition, identical lemon positions, identical leaf positions"
3. **Reduce duration to 6s** — shorter clips morph less

---

## After generating

1. Download the MP4 to `public/videos/opener.mp4`
2. Tell me — I'll wire it as the splash background:
   - Auto-plays muted on page load (browsers allow muted autoplay)
   - Plays through once (~8s)
   - On end, holds the last frame (= the lemon centerpiece)
   - The static splash overlay (name + AF&U + scroll cue) fades in over the held final frame
3. The user sees: video plays → resolves on lemons → text appears around the lemons → swipe to enter

That's the "pre-website experience" you described.
