#!/usr/bin/env python3
"""Extract paper-craft elements (airplane, lemon cluster) from storyboard panels
into transparent-bg PNGs via fal.ai rembg endpoint."""

import base64
import json
import os
import subprocess
import sys
from pathlib import Path
from urllib.request import Request, urlopen

# Source canonical env per workflows.md §2.5
if not os.environ.get("FAL_KEY"):
    env_file = Path.home() / ".claude" / ".env"
    if env_file.exists():
        for line in env_file.read_text().splitlines():
            if line.startswith("FAL_KEY=") and not line.lstrip().startswith("#"):
                os.environ["FAL_KEY"] = line.split("=", 1)[1].strip()
                break

FAL_KEY = os.environ.get("FAL_KEY")
if not FAL_KEY:
    print("ERROR: FAL_KEY not set in env or ~/.claude/.env", file=sys.stderr)
    sys.exit(1)

PROJECT = Path(__file__).resolve().parent.parent
PANELS = PROJECT / "assets/master-refs/panels"
OUT = PROJECT / "assets/master-refs/elements"
TMP = Path("/tmp/wedding-elements")

OUT.mkdir(parents=True, exist_ok=True)
TMP.mkdir(parents=True, exist_ok=True)


def crop(src: Path, dst: Path, x: int, y: int, w: int, h: int) -> None:
    subprocess.run(
        [
            "ffmpeg", "-y", "-loglevel", "error",
            "-i", str(src),
            "-vf", f"crop={w}:{h}:{x}:{y}",
            str(dst),
        ],
        check=True,
    )
    print(f"  cropped → {dst.name}")


def rembg(input_path: Path, output_path: Path) -> None:
    b64 = base64.b64encode(input_path.read_bytes()).decode()
    data_uri = f"data:image/png;base64,{b64}"
    payload = json.dumps({"image_url": data_uri})

    # birefnet/v2 = high-quality matting, better for watercolor edges than basic rembg
    proc = subprocess.run(
        [
            "curl", "-sS", "-X", "POST",
            "https://fal.run/fal-ai/birefnet/v2",
            "-H", f"Authorization: Key {FAL_KEY}",
            "-H", "Content-Type: application/json",
            "--data-binary", payload,  # inline avoids chunked encoding
        ],
        check=True,
        capture_output=True,
        text=True,
    )
    result_json = proc.stdout

    result = json.loads(result_json)
    img = result.get("image") or {}
    result_url = img.get("url")
    if not result_url:
        raise RuntimeError(f"No image URL in response: {result_json[:500]}")

    subprocess.run(
        ["curl", "-sS", "-o", str(output_path), result_url],
        check=True,
    )
    print(f"  birefnet done -> {output_path.name}")


def main() -> None:
    # Panels are 520x900. Coords below are first guesses — verify visually + adjust.
    print("Cropping regions from panels...")
    crop(PANELS / "panel-03-distance.png", TMP / "airplane-crop.png", x=280, y=60, w=220, h=220)
    crop(PANELS / "panel-05-promise.png", TMP / "lemon-crop.png", x=0, y=600, w=240, h=300)
    crop(PANELS / "panel-01-meeting.png", TMP / "lemon-alt-crop.png", x=0, y=600, w=200, h=300)

    print("\nRemoving backgrounds via fal.ai rembg...")
    rembg(TMP / "airplane-crop.png", OUT / "airplane.png")
    rembg(TMP / "lemon-crop.png", OUT / "lemon-cluster.png")
    rembg(TMP / "lemon-alt-crop.png", OUT / "lemon-cluster-alt.png")

    print("\nDone. Output in:", OUT)


if __name__ == "__main__":
    main()
