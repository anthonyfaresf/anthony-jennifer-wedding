# MONOGRAM ANIMATION — Wax seal opening to hero

| | |
|---|---|
| **Goal** | Animate the A&J wax-seal envelope as the opening shot of the website. Quiet, elegant, "opening a real wedding invitation" — no theatrics. Resolves into a soft cream wash so the hero section can fade in seamlessly. |
| **Aspect** | 9:16 portrait (matches splash + opener) |
| **Duration** | 8s |
| **Model** | Seedance 2.0 image-to-video (Higgsfield primary, fal.ai fallback) |
| **Start frame** | `assets/master-refs/Untitled design (1).png` (the wax-seal envelope) |
| **Output path** | `public/elements/monogram-open.mp4` |

## What's happening on screen

| Beat | Time | What happens |
|---|---|---|
| 1 | 0.0–2.0s | Camera holds. Warm honey light sweeps slowly left-to-right across the wax, picking up the embossed "A & J" and the raised rim of the seal. The envelope paper breathes — a near-imperceptible fiber shift. |
| 2 | 2.0–5.0s | The triangular envelope flap lifts upward and away from camera, slowly, like a hand is opening it. The wax seal stays bonded to the flap and rises with it, tilting slightly toward camera so the embossed letters catch a brighter highlight at the apex. Paper crease audible only in the visual — soft texture release along the fold. |
| 3 | 5.0–8.0s | As the flap opens further, a soft warm cream glow blooms from inside the envelope, gently overexposing the frame from the center outward. The seal and flap dissolve into the wash. End frame is a near-pure warm cream paper field, ready for the hero section to fade in. |

## Prompt (Seedance 2.0 i2v)

```
The wax-seal envelope holds for two seconds as a warm honey light sweeps slowly from camera-left to camera-right across the olive-green wax, catching highlights on the raised rim and on the embossed letters "A" "&" "J" — the light glides, never flashes. The envelope paper breathes with a barely perceptible fiber shift. Then the triangular top flap of the envelope lifts gently upward and away from camera at a quiet, unhurried pace, as if a hand were opening it — the olive wax seal stays bonded to the flap and rises with it, tilting slightly toward camera so the embossed letters catch a softer highlight at the apex of the motion. The paper crease along the fold releases with a delicate texture shift, no tearing, no cracking — the seal remains intact, just lifted. As the flap continues to open, a soft warm cream-honey glow blooms from inside the envelope, beginning at the center and spreading outward, gently overexposing the frame until the seal, the flap, and the envelope all dissolve into a clean, warm cream paper wash. The final frame is a near-uniform warm cream field with a faint trace of paper grain — quiet, breathing, ready. — 8s — camera: locked, no movement, no shake; the motion comes from the flap and the light, not the camera.
```

## Negatives

```
fast motion, snapping, hard cuts, lens flare, glow effects, neon, dramatic shadows, theatrical lighting, hand or fingers visible, wax cracking or breaking, seal tearing, paper ripping, confetti, sparkles, particles, text appearing, zoom punch, shake, jitter, photographic film burn.
```

## Why these choices

- **Camera locked, not pushing in** — pushing in feels cinematic-trailer; locked feels like the invitation is being opened in front of you, not for you. More intimate.
- **Light glides, never flashes** — Seedance loves to add specular pop; the prompt explicitly slows it down.
- **Seal stays intact, no cracking** — broken wax has a "this is the moment everything changes" tension; for a wedding opener we want quiet permission, not breakage.
- **Cream-honey bloom out** — gives the website hero an organic fade target. The video's last 8 frames should already be ~95% cream so the React hero crossfades seamlessly without a hard cut.
- **No human hand** — keeps it timeless and lets the viewer feel like THEY'RE opening it.

## After generating

1. Save best take to `public/elements/monogram-open.mp4`.
2. Send it to me. I'll wire it as the splash hero with:
   - Autoplay, muted, playsinline (iOS Safari)
   - On `ended` event → React state flips to `hero-revealed` → hero section fades in over the final cream frame
   - Last-frame poster image (`monogram-open-last-frame.jpg`) so the transition is invisible
3. If you want, we can do a second take with subtle ambient audio (paper rustle + room tone) — let me know and I'll write that as a separate audio brief.

## Fallback prompt

If Seedance over-animates (too much paper movement, hand-like motion, dramatic light):

```
A locked-off shot of an olive-green wax seal embossed with "A & J" on a cream envelope. For the first two seconds, a soft warm light glides slowly from left to right across the seal, catching highlights on the embossed letters. Then the triangular envelope flap lifts upward at a slow, unhurried pace, the seal rising with it, tilting slightly toward camera. As the flap opens further, a soft warm cream glow blooms from inside the envelope, growing outward until the entire frame dissolves into a uniform warm cream paper wash. No hands, no cracking, no tearing, no shake. Camera locked, no movement. — 8s.
```

## Notes

- Generate at 1080×1920 if Seedance offers it; otherwise upscale in post.
- If Higgsfield's Seedance is rate-limited, try Kling 3.0 — the i2v on Kling handles slow opening motions cleanly too. Same prompt works.
- Keep "locked camera" language non-negotiable. A push-in here kills the elegance.
