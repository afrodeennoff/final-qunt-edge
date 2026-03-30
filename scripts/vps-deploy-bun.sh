#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-$(pwd)}"
BRANCH="${BRANCH:-main}"
PM2_APP_NAME="${PM2_APP_NAME:-qunt-edge}"
HEALTH_URL="${HEALTH_URL:-http://127.0.0.1:${PORT:-3000}/api/health}"
HEALTH_RETRIES="${HEALTH_RETRIES:-10}"
HEALTH_DELAY_SECONDS="${HEALTH_DELAY_SECONDS:-3}"

cd "$APP_DIR"

if ! command -v bun >/dev/null 2>&1; then
  echo "bun is not installed. Install it first: curl -fsSL https://bun.sh/install | bash"
  exit 1
fi

if ! command -v pm2 >/dev/null 2>&1; then
  echo "pm2 is not installed. Install it first: npm i -g pm2"
  exit 1
fi

echo "Deploying branch: $BRANCH"
git fetch origin "$BRANCH"
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"

echo "Installing dependencies with bun..."
bun ci

echo "Building app..."
bun run build

echo "Starting/reloading with PM2..."
if pm2 describe "$PM2_APP_NAME" >/dev/null 2>&1; then
  APP_DIR="$APP_DIR" pm2 restart "$PM2_APP_NAME" --update-env
else
  APP_DIR="$APP_DIR" pm2 start ecosystem.config.cjs --only "$PM2_APP_NAME" --update-env
fi
pm2 save

echo "Deployment complete. Health check: $HEALTH_URL"
for attempt in $(seq 1 "$HEALTH_RETRIES"); do
  if curl -fsS "$HEALTH_URL"; then
    echo "Health check passed on attempt $attempt/$HEALTH_RETRIES"
    exit 0
  fi

  if [ "$attempt" -lt "$HEALTH_RETRIES" ]; then
    echo "Health check failed (attempt $attempt/$HEALTH_RETRIES). Retrying in ${HEALTH_DELAY_SECONDS}s..."
    sleep "$HEALTH_DELAY_SECONDS"
  fi
done

echo "Health check failed after $HEALTH_RETRIES attempts."
exit 1
