# Instagram References — How To Add Them

## To add references
1. Open `_urls.txt` in this folder
2. Paste each Instagram URL on its own line (Reels, carousel posts, photo posts all work)
3. Save the file
4. Tell me "download the IG references" — I'll run `gallery-dl` against this folder

## What happens after download
- Reels download as `.mp4`
- Carousels download as numbered `.jpg` (one per slide)
- Photos download as `.jpg`
- Auto-organized into `Reels/`, `Carousels/`, `Photos/` subfolders by my organizer script
- Gemini analyzes each video frame-by-frame for animation patterns + scroll moments
- Output: `../SYNTHESIS.md` — a synthesized design direction merged with `BRAND_GUIDE.md`

## Requirements (per `.claude/scripts/gallery-dl-config.json`)
- Chrome must be logged into Instagram (cookies-from-browser auth)
- yt-dlp is NOT a substitute — gallery-dl is the 2026 IG downloader

## After analysis
The Instagram references are PRIMARY input for the brand direction. The synthesized output dictates:
- Color palette (extracted from dominant tones in the references)
- Typography style (editorial vs minimal vs script-accented)
- Animation rhythm (slow cinematic vs snappy modern)
- Section structures (full-bleed hero vs split-grid vs stacked)

Drop URLs → I run download → I show you the synthesis → you confirm direction → build starts.
