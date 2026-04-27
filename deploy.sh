#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
WORKER_DIR="$SCRIPT_DIR/worker"

cd "$WORKER_DIR"

echo "Installing dependencies..."
npm install

echo "Checking Cloudflare authentication..."
if ! npx wrangler whoami > /dev/null 2>&1; then
  echo "Not logged in. Opening browser for authentication..."
  npx wrangler login
fi

if grep -q "PLACEHOLDER_KV_ID" wrangler.toml; then
  echo "Creating KV namespace..."
  KV_OUTPUT=$(npx wrangler kv namespace create SEASONS 2>&1)
  echo "$KV_OUTPUT"
  KV_ID=$(echo "$KV_OUTPUT" | grep 'id = ' | sed 's/.*id = "\([^"]*\)".*/\1/')
  if [ -z "$KV_ID" ]; then
    echo ""
    echo "Error: Could not auto-extract KV namespace ID from the output above."
    echo "Please copy the ID, update worker/wrangler.toml manually (replace PLACEHOLDER_KV_ID), then re-run."
    exit 1
  fi
  echo "Updating wrangler.toml with KV ID: $KV_ID"
  sed -i.bak "s/PLACEHOLDER_KV_ID/$KV_ID/" wrangler.toml && rm -f wrangler.toml.bak
else
  echo "KV namespace already configured, skipping creation."
fi

echo "Deploying Worker..."
DEPLOY_OUTPUT=$(npx wrangler deploy 2>&1)
echo "$DEPLOY_OUTPUT"

WORKER_URL=$(echo "$DEPLOY_OUTPUT" | grep -oE 'https://[^[:space:]]+workers\.dev' | head -1)

echo ""
echo "Deployment complete!"
if [ -n "$WORKER_URL" ]; then
  echo "Worker URL: $WORKER_URL"
  echo ""
  echo "Next: Update WORKER_URL in index.html to:"
  echo "  $WORKER_URL"
else
  echo "Next: Find your Worker URL in the output above, then update WORKER_URL in index.html."
fi
