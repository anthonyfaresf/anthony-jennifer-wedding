# OPENER VIDEO — Pre-website experience

| | |
|---|---|
| **Goal** | 6–8s cinematic watercolor opener. Pushes through a Mediterranean tablescape and lands precisely on the lemon centerpiece, so the static splash that follows has zero seam. |
| **Aspect** | 9:16 portrait |
| **Output path** | `public/videos/opener.mp4` |
| **Primary model** | Higgsfield → Seedance 2.0 (image-to-video, **End Frame mode**) |
| **Fallback** | Kling 3.0 multi-scene (constrains start/end frames more strictly) |
| **Duration** | 8s (drop to 6s if morphing) |

## Reference uploads

- **End frame:** `public/elements/lemon-hanging.png` — locks the final frame so the video resolves exactly on the static splash that follows.
- **Start frame:** the still from `prompts/opener-photo.md` (after generating it). If not yet generated, leave blank — Seedance generates a start frame from the prompt.

## Setup

1. Open Higgsfield → Seedance 2.0 (i2v mode)
2. **End Frame:** upload `public/elements/lemon-hanging.png`
3. **Start Frame:** upload the opener-photo result (or leave blank)
4. Aspect: **9:16**, Duration: **8s**, Camera Fixed: **OFF** (gentle motion is wanted)
5. Paste the prompt below

## Prompt

```
Watercolor and ink illustration animation in the style of fine hand-painted wedding stationery — butter-yellow lemons, sage-olive leaves, dusty olive linework, warm cream paper grain breathing across the entire frame. Open on a Mediterranean tablescape on a stone garden terrace at golden hour. Cream linen cloth folded loosely, ceramic plates in cream and olive, two stemmed glasses with pale pink-gold liquid catching a warm highlight, an amber-glass carafe, a small wooden board with rustic bread and pale crumbly cheese, a ceramic dish of bright green olives glistening in oil, three ripe butter-yellow lemons resting beside an olive branch with small silver-green leaves. Soft Edison string lights blurred in the deep background. Camera: slow 6-degree dolly-in toward the centerpiece, gentle 0.4-degree handheld micro-tremor — 8s. Light: warm honey golden hour from camera-left, soft falloff to the right, no visible source. The carafe catches a single highlight on its shoulder. Watercolor shadows pool under each object and shift gently as the camera moves. Motion: cream linen folds breathe softly, the liquid in the glasses ripples gently, the olive branch sways 0.5 degrees in a warm breeze, ink lines settle around each shape as the dolly progresses, paper grain holds steady throughout. The push-in tightens onto a single sage-leaf branch with three ripe butter-yellow lemons hanging — the final frame matches the end-frame upload exactly: identical composition, identical color, identical paper grain, identical ink lines. Hold the lemons for the final 1.2 seconds. Watercolor and ink only.
```

## Negatives

```
3d render, photographic, glossy, plastic, neon, ai-art, human figures, text, logos.
```

## Fallback prompt

If Seedance morphs the end frame, tighten the last paragraph:

```
[same opening through the camera + light + motion paragraphs]
The push-in tightens and freezes on the end-frame upload — identical lemon positions, identical leaf positions, identical paper grain. The video LANDS on the upload. Hold the held frame for 1.2 seconds.
```

If still morphing → switch to **Kling 3.0 multi-scene mode** (same prompt, Kling constrains end frames more strictly) → and/or reduce duration to **6s** (shorter clips morph less).

## After generating

1. Download the MP4 to `public/videos/opener.mp4`
2. Tell me — I'll wire it as the splash:
   - Auto-plays muted on page load
   - Plays through once (~8s)
   - Holds the last frame (= the lemon centerpiece)
   - The static splash overlay (name + AF&U + scroll cue) fades in over the held final frame
3. Result: video plays → resolves on lemons → text appears around them → swipe to enter

## Notes

Seedance 2.0 verified rules followed (per `.claude/skills/ai-prompt-builder/references/seedance-verified.md`):

- No `Visual Style:` or `Audio:` labels — flowing prose only
- Camera AFTER em-dash with duration: `camera: slow 6-degree dolly-in… — 8s`
- Light by **effect**, not source: "warm honey golden hour from camera-left, soft falloff" (not "softbox at 30°")
- Physical grounding: linen folds breathe, liquid ripples, olive branch sways
- Negatives inline at end, 2–8 targeted items
- Word count ~190 — within the sweet spot for narrative + adds shot detail because end-frame mode needs aim
- No hard wraps mid-sentence — paragraph breaks only
