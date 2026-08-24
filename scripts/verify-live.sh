#!/usr/bin/env bash
# Post-deploy smoke check for anthonyandjenni.com
#
# WHY THIS EXISTS: on 2026-08-24 the live site returned HTTP 200 for an hour+
# while rendering a totally blank page. The HTML was fine; every asset it
# referenced 404'd, because the build carried the GH-Pages basePath
# (/anthony-jennifer-wedding) but was deployed to the Cloudflare Pages ROOT.
#
# A 200 on the page is NOT proof the site works. This script fetches the page,
# extracts the FIRST stylesheet and FIRST script it actually asks for, and
# requires those to load. That is the cheapest check that would have caught it.
#
# Usage:  bash scripts/verify-live.sh [url]     (default: https://anthonyandjenni.com)
# Exit:   0 = site genuinely renders  |  1 = broken (asset 404s or page unreachable)

set -uo pipefail

URL="${1:-https://anthonyandjenni.com}"
BASE="$(printf '%s' "$URL" | sed -E 's#(https?://[^/]+).*#\1#')"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

fail() { printf '\n\033[31m✘ BROKEN\033[0m  %s\n' "$1"; exit 1; }
ok()   { printf '\033[32m✔\033[0m %s\n' "$1"; }

printf 'Verifying %s\n\n' "$URL"

code="$(curl -sS -L --max-time 25 -o "$TMP/page.html" -w '%{http_code}' "$URL" 2>/dev/null)" \
  || fail "could not reach $URL"
[ "$code" = "200" ] || fail "page returned HTTP $code (expected 200)"
ok "page returns 200"

bytes="$(wc -c < "$TMP/page.html" | tr -d ' ')"
[ "$bytes" -gt 1000 ] || fail "page body is only ${bytes} bytes — almost certainly an error page"
ok "page body is ${bytes} bytes"

# Pull the asset paths the page ITSELF references. If the build shipped with the
# wrong basePath, these are the URLs that will 404.
css="$(grep -o 'href="[^"]*\.css[^"]*"' "$TMP/page.html" | head -1 | sed 's/href="//;s/"$//')"
js="$(grep -o 'src="[^"]*\.js[^"]*"'   "$TMP/page.html" | head -1 | sed 's/src="//;s/"$//')"

[ -n "$css" ] || [ -n "$js" ] || fail "page references no CSS or JS at all — is this the real build?"

checked=0
for path in "$css" "$js"; do
  [ -n "$path" ] || continue
  case "$path" in
    http*) asset="$path" ;;
    /*)    asset="${BASE}${path}" ;;
    *)     asset="${BASE}/${path}" ;;
  esac
  acode="$(curl -sS -o /dev/null --max-time 20 -w '%{http_code}' "$asset" 2>/dev/null)"
  if [ "$acode" != "200" ]; then
    printf '\n  referenced: %s\n  resolved:   %s\n  status:     %s\n' "$path" "$asset" "$acode"
    fail "an asset the page needs returns HTTP $acode — the page will render BLANK.
         Almost always a basePath mismatch: rebuild with the correct DEPLOY_TARGET
         (see next.config.ts) and redeploy."
  fi
  ok "asset loads (${acode}): ${path}"
  checked=$((checked + 1))
done

printf '\n\033[32m✔ LIVE OK\033[0m — page and %s referenced asset(s) all load.\n' "$checked"
