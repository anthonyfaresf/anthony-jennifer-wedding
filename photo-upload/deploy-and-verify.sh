#!/bin/bash
# One-shot deploy + LIVE verification for the wedding photo-upload Worker.
# Requires: `npx wrangler login` completed (OAuth). Intentionally strips
# CLOUDFLARE_API_TOKEN so the narrow rotated token can't shadow the OAuth session.
set -euo pipefail
cd "$(dirname "$0")"

echo "== 1/4 typecheck =="
npm run typecheck

echo "== 2/4 deploy =="
env -u CLOUDFLARE_API_TOKEN npx wrangler deploy

echo "== 3/4 live health =="
sleep 3
curl -sS -m 15 https://photos.anthonyandjenni.com/api/health -w '\nHTTP %{http_code}\n'

echo "== 4/4 live end-to-end browser upload =="
SCRATCH="/private/tmp/claude-501/-Users-anthonyffares-Anthony-s-Vault-Projects-wedding-website/4ed2607b-ce99-4ab2-a77a-35bd5f2b25af/scratchpad"
cd "$SCRATCH"
TEST_FILE="/Users/anthonyffares/Anthony's Vault/Projects/wedding-website/public/photos/positano.jpg" \
BASE_URL="https://photos.anthonyandjenni.com" \
UPLOADER_NAME="prod-verify-claude" \
node e2e-upload-test.mjs
echo "DEPLOY+VERIFY: ALL GREEN"
