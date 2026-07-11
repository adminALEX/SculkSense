#!/usr/bin/env bash
# Commit, push to GitHub, and publish to npm.
#
# Usage:
#   ./scripts/release.sh "your commit message"
#
# Multi-line message:
#   ./scripts/release.sh "$(cat <<'EOF'
#   feat: add something
#
#   More details here.
#   EOF
#   )"
#
# Notes:
# - Runs tests, lint, and build before committing.
# - npm publish may prompt for 2FA in the browser.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [[ $# -lt 1 ]]; then
  echo "Usage: ./scripts/release.sh \"commit message\""
  exit 1
fi

COMMIT_MSG="$*"
VERSION="$(npm pkg get version | tr -d '"')"

echo "==> skulksense v${VERSION}"
echo "==> Running checks..."
npm test
npm run lint
npm run build

echo ""
echo "==> Staging changes..."
git add -A

if git diff --cached --quiet; then
  echo "No changes to commit."
  read -r -p "Publish v${VERSION} to npm anyway? [y/N] " PUBLISH_ANYWAY
  if [[ ! "${PUBLISH_ANYWAY}" =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 0
  fi
else
  echo ""
  git status --short
  echo ""
  echo "==> Commit message:"
  echo "${COMMIT_MSG}"
  echo ""
  read -r -p "Continue with commit, push, and publish? [y/N] " CONFIRM
  if [[ ! "${CONFIRM}" =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 0
  fi

  git commit -m "${COMMIT_MSG}"
  git push origin main
fi

echo ""
echo "==> Publishing to npm..."
npm publish

echo ""
echo "Done!"
echo "  GitHub: https://github.com/adminALEX/SculkSense"
echo "  npm:    https://www.npmjs.com/package/skulksense"
