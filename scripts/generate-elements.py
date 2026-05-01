#!/usr/bin/env python3
"""Generate clean watercolor paper plane + lemon cluster via fal.ai GPT Image 2,
then rembg for transparent backgrounds."""

import base64
import json
import os
import subprocess
import sys
from pathlib import Path

if not os.environ.get("FAL_KEY"):
    env_file = Path.home() / ".claude" / ".env"
    if env_file.exists():
        for line in env_file.read_text().splitlines():
            if line.startswith("FAL_KEY=") and not line.lstrip().startswith("#"):
                value = line.split("=", 1)[1]
                # Strip inline shell comments + whitespace (matches bash `source` behavior)
                tokens = value.split()
                os.environ["FAL_KEY"] = tokens[0] if tokens else ""
                break

FAL_KEY = os.environ.get("FAL_KEY")
if not FAL_KEY:
    sys.exit("FAL_KEY not set")

PROJECT = Path(__file__).resolve().parent.parent
ELEMENTS = PROJECT / "assets/master-refs/elements"
ELEMENTS.mkdir(parents=True, exist_ok=True)
TMP = Path("/tmp/wedding-elements-gen")
TMP.mkdir(exist_ok=True)
REMBG = "/tmp/wedding-venv/bin/rembg"


PLANE_PROMPT = """A single paper-craft watercolor paper airplane illustration, isolated and centered on a pure WHITE background.

The airplane is rendered in soft butter-yellow and pale-cream watercolor (matching a Mediterranean wedding stationery palette — same butter-yellow as ripe lemons), folded paper with visible fold creases drawn in delicate olive-green pencil lines (#5d6c45). Soft watercolor edges with gentle deckled bleeds where pigment pooled. Pigment is saturated enough to read clearly against white — NOT pale or washed-out.

Behind the airplane, a faint dotted-line trail rendered in small olive-green dots, curving slightly as if the plane just glided through the air, ending at the airplane's tail.

Texture: cotton-paper substrate visible through translucent watercolor, granular watercolor pigment, faint pencil underdrawing barely visible.

Light: soft diffuse upper-left daylight, gentle warmth on the cream side of the plane.

Composition: airplane occupies roughly 65% of the canvas, angled slightly downward as if mid-glide-descent, dotted trail extending behind it from upper-right to lower-left.

NEGATIVE: any background color other than pure white, photorealism, drop-shadow, vignette, frame, hard 3D digital edges, glossy plastic finish, navy blue, dark colors, neon, oversaturated tones.

Output: 1:1 square 1024x1024, watercolor on pure white background only — no other elements."""

LEMON_PROMPT = """A single paper-craft watercolor lemon-and-sage cluster illustration, isolated and centered on a pure WHITE background.

Two ripe butter-yellow watercolor lemons (yellow #E8D77A with a darker yellow-green underbelly where pigment pooled while wet, saturation strong enough to read clearly against white) clustered together with three deep sage-olive leaves (sage-olive #5d6c45 with white-tip highlights where the wash was lifted while wet, fine pencil-thin vein detail visible). Organic asymmetric arrangement with one leaf curling above and behind the lemons.

Each lemon: visible watercolor pooling — pigment darker at the rounded base, lighter at the top with a soft dimple suggesting the stem, finished with a 1-2 brush-stroke green stem-tip. Soft deckled watercolor edges with pigment bleeding outward.

Texture: cotton-paper substrate visible through translucent watercolor, granular watercolor pigment with uneven pooling, faint pencil underdrawing barely visible.

Light: soft diffuse upper-left daylight.

Composition: cluster occupies roughly 70% of the canvas, centered with breathing room — designed to be placed in a corner of a layout. Visual weight leans slightly to one side.

Style: matches the watercolor lemons used on a Mediterranean save-the-date card. Pastel romantic, hand-painted, NOT photorealistic.

NEGATIVE: any background color other than pure white, photorealism, drop-shadow, vignette, frame, hard 3D digital edges, photo-stock look, navy blue, dark colors, neon, oversaturated tones.

Output: 1:1 square 1024x1024, watercolor on pure white background only — no other elements."""


def gen_image(prompt: str, output_path: Path) -> None:
    print(f"\n[gen] {output_path.name} via fal.ai GPT Image 2 ...")
    payload = json.dumps({
        "prompt": prompt,
        "num_images": 1,
        "output_format": "png",
    })

    proc = subprocess.run(
        [
            "curl", "-sS", "-X", "POST",
            "https://fal.run/fal-ai/nano-banana",
            "-H", f"Authorization: Key {FAL_KEY}",
            "-H", "Content-Type: application/json",
            "--data-binary", payload,
        ],
        check=True, capture_output=True, text=True,
    )
    result = json.loads(proc.stdout)
    if "images" in result and result["images"]:
        url = result["images"][0]["url"]
    elif "image" in result and result["image"]:
        url = result["image"]["url"]
    else:
        sys.exit(f"Unexpected response: {proc.stdout[:500]}")

    print(f"[gen] downloading from {url[:60]}...")
    subprocess.run(["curl", "-sS", "-o", str(output_path), url], check=True)
    print(f"[gen] saved -> {output_path}")


def rembg(input_path: Path, output_path: Path) -> None:
    print(f"[rembg] {input_path.name} -> {output_path.name}")
    subprocess.run([REMBG, "i", "-m", "isnet-general-use", str(input_path), str(output_path)], check=True)


def main() -> None:
    plane_raw = TMP / "plane-raw.png"
    lemon_raw = TMP / "lemon-raw.png"

    gen_image(PLANE_PROMPT, plane_raw)
    gen_image(LEMON_PROMPT, lemon_raw)

    rembg(plane_raw, ELEMENTS / "plane-fresh.png")
    rembg(lemon_raw, ELEMENTS / "lemon-fresh.png")

    print("\nDone. Output:")
    print(f"  {ELEMENTS / 'plane-fresh.png'}")
    print(f"  {ELEMENTS / 'lemon-fresh.png'}")


if __name__ == "__main__":
    main()
