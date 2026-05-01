#!/bin/bash
# Design-focused Gemini video analyzer for wedding-website IG references.
#
# Different from .claude/scripts/gemini-video-analyzer.sh which is competitor-AD focused
# (extracts hooks, scripts, "phrases to steal").
# This one extracts DESIGN signals: palette, typography, animation, composition,
# scroll/transition moments, tone direction match — for synthesizing BRAND_GUIDE.md.
#
# Usage: GEMINI_API_KEY=xxx bash _analyze-design.sh
# Reads .mp4 files in Reels/ subfolders, writes one JSON per video to _analysis/

set -uo pipefail

# Auto-source canonical .env (per .claude/rules/workflows.md §2.5)
if [ -z "${GEMINI_API_KEY:-}" ] && [ -f "$HOME/.claude/.env" ]; then
  set -a; source "$HOME/.claude/.env"; set +a
fi

API_KEY="${GEMINI_API_KEY:?GEMINI_API_KEY env var required}"
MODEL="${GEMINI_MODEL:-gemini-2.5-flash}"
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
REELS_DIR="$PROJECT_DIR/Reels"
ANALYSIS_DIR="$PROJECT_DIR/_analysis"
mkdir -p "$ANALYSIS_DIR"

PROMPT='You are a senior design director analyzing a wedding-website / digital-invitation video reference. Extract DESIGN signals (not marketing/script). Return strict JSON, no markdown fences.

{
  "post_purpose": "wedding website / digital invitation / save-the-date / rsvp page / other",
  "color_palette": {
    "dominant_hex": ["#XXXXXX", "..."],
    "tone": "ivory-and-gold | neutral-warm | terracotta-cream | navy-blush | high-contrast-mono | desaturated-romantic | pastel | other",
    "background_value": "near-white | cream | beige | dusty-pink | dark | other"
  },
  "typography": {
    "display_style": "serif-classic | serif-editorial | display-script | sans-geometric | sans-humanist | mono | mixed",
    "display_weight_feel": "delicate-thin | regular | bold-statement",
    "body_style": "serif | sans | mixed",
    "treatment_signals": ["uppercase tracking", "italic accents", "very large type", "very small type", "hand-script accents"]
  },
  "tone_direction": {
    "best_match": "classic-elegant | editorial-modern | cinematic-romantic | playful-warm | minimal-quiet",
    "confidence": "high | medium | low",
    "evidence": "1 sentence pointing to specific frames or moments"
  },
  "animation_rhythm": {
    "pace": "slow-cinematic | medium | snappy-modern | almost-still",
    "motion_types": ["fade-in", "slide-up", "parallax", "scale", "blur-reveal", "letter-by-letter", "envelope-opening", "page-turn", "scroll-reveal", "mask-reveal"],
    "transition_signature": "1 sentence describing the most distinctive transition"
  },
  "section_structures_observed": ["full-bleed-hero", "split-grid", "asymmetric", "stacked-cards", "centered-symmetric", "edge-aligned", "envelope-frame", "story-arc", "carousel-of-cards"],
  "imagery_treatment": "untouched-photo | warm-filter | bw-accent | sepia | overexposed | film-grain | none-uses-illustration | mixed",
  "interaction_or_motion_moments": [
    {"timestamp_sec": 0, "what_happens": "1 line"}
  ],
  "languages_visible": ["EN", "FR", "AR", "other"],
  "uniquely_borrowable_idea": "1 sentence — the single most ownable design idea I would steal for a wedding-website build",
  "anti_patterns_to_avoid": ["1 line each — anything that feels generic / overdone / clichéd"]
}'

analyze_one() {
  local VIDEO="$1"
  local FOLDER_NAME="$(basename "$(dirname "$VIDEO")")"
  local OUTPUT="$ANALYSIS_DIR/$FOLDER_NAME.json"
  local NUM_BYTES
  NUM_BYTES=$(wc -c < "$VIDEO" | tr -d ' ')

  echo "[$FOLDER_NAME] uploading ($NUM_BYTES bytes)..." >&2

  local UPLOAD_URL
  UPLOAD_URL=$(curl -s -D - -X POST \
    "https://generativelanguage.googleapis.com/upload/v1beta/files?key=$API_KEY" \
    -H "X-Goog-Upload-Protocol: resumable" \
    -H "X-Goog-Upload-Command: start" \
    -H "X-Goog-Upload-Header-Content-Length: $NUM_BYTES" \
    -H "X-Goog-Upload-Header-Content-Type: video/mp4" \
    -H "Content-Type: application/json" \
    -d "{\"file\":{\"display_name\":\"$FOLDER_NAME\"}}" \
    | grep -i "x-goog-upload-url:" | awk '{print $2}' | tr -d '\r\n')

  if [ -z "$UPLOAD_URL" ]; then
    echo "[$FOLDER_NAME] FAIL: no upload URL" >&2
    echo "{\"error\":\"no upload URL\"}" > "$OUTPUT"
    return 1
  fi

  local FILE_INFO
  FILE_INFO=$(curl -s -X POST "$UPLOAD_URL" \
    -H "Content-Length: $NUM_BYTES" -H "X-Goog-Upload-Offset: 0" \
    -H "X-Goog-Upload-Command: upload, finalize" --data-binary "@$VIDEO")

  local FILE_URI FILE_NAME
  FILE_URI=$(echo "$FILE_INFO" | python3 -c "import sys,json; print(json.load(sys.stdin)['file']['uri'])" 2>/dev/null)
  FILE_NAME=$(echo "$FILE_INFO" | python3 -c "import sys,json; print(json.load(sys.stdin)['file']['name'])" 2>/dev/null)

  if [ -z "$FILE_URI" ]; then
    echo "[$FOLDER_NAME] FAIL: upload error → $FILE_INFO" >&2
    echo "$FILE_INFO" > "$OUTPUT"
    return 1
  fi

  for i in {1..30}; do
    local STATE
    STATE=$(curl -s "https://generativelanguage.googleapis.com/v1beta/$FILE_NAME?key=$API_KEY" \
      | python3 -c "import sys,json; print(json.load(sys.stdin).get('state','UNKNOWN'))" 2>/dev/null)
    [ "$STATE" = "ACTIVE" ] && break
    sleep 2
  done

  echo "[$FOLDER_NAME] analyzing..." >&2
  local RESPONSE ANALYSIS
  for attempt in 1 2 3 4; do
    RESPONSE=$(curl -s -X POST \
      "https://generativelanguage.googleapis.com/v1beta/models/$MODEL:generateContent?key=$API_KEY" \
      -H "Content-Type: application/json" \
      -d "{\"contents\":[{\"parts\":[{\"file_data\":{\"mime_type\":\"video/mp4\",\"file_uri\":\"$FILE_URI\"}},{\"text\":$(echo "$PROMPT" | python3 -c "import sys,json; print(json.dumps(sys.stdin.read()))")}]}]}")
    if echo "$RESPONSE" | grep -q '"RESOURCE_EXHAUSTED"\|"code": 429'; then
      local wait=$((attempt * 15))
      echo "[$FOLDER_NAME] rate limited, retry $attempt in ${wait}s..." >&2
      sleep $wait
      continue
    fi
    ANALYSIS=$(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['candidates'][0]['content']['parts'][0]['text'])" 2>/dev/null)
    if [ -n "$ANALYSIS" ]; then break; fi
    sleep 5
  done

  if [ -z "$ANALYSIS" ]; then
    echo "[$FOLDER_NAME] FAIL: empty analysis → $RESPONSE" >&2
    echo "$RESPONSE" > "$OUTPUT"
    return 1
  fi

  # Strip code fences if Gemini wrapped JSON anyway
  echo "$ANALYSIS" | sed -E 's/^```(json)?//' | sed -E 's/```$//' > "$OUTPUT"
  echo "[$FOLDER_NAME] done → $OUTPUT" >&2
}

export -f analyze_one
export API_KEY MODEL ANALYSIS_DIR PROMPT

echo "Analyzing reels in parallel..." >&2
for VIDEO in "$REELS_DIR"/*/01.mp4; do
  [ -f "$VIDEO" ] && analyze_one "$VIDEO" &
done
wait

echo "" >&2
echo "✓ All analyses written to $ANALYSIS_DIR/" >&2
ls -la "$ANALYSIS_DIR/" >&2
