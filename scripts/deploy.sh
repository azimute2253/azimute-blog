#!/usr/bin/env bash
set -euo pipefail

# Deploy azimute-blog: build → push dist to gh-pages
# Usage: ./scripts/deploy.sh [commit message]

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
REMOTE_URL="https://github.com/azimute2253/azimute-blog.git"
MSG="${1:-deploy: $(date +%Y-%m-%d_%H:%M)}"

cd "$REPO_DIR"

echo "→ Building..."
npm run build --silent

cd dist

# Ensure CNAME survives (GitHub Pages needs it)
echo "azimute.cc" > CNAME

# Init fresh git, commit, force-push to gh-pages
rm -rf .git
git init -b gh-pages
git config user.email "azimute@openclaw.dev"
git config user.name "Azimute"
git add -A
git commit -m "$MSG" --quiet
git remote add origin "$REMOTE_URL"
git push origin gh-pages --force --quiet

echo "✓ Deployed to gh-pages"
