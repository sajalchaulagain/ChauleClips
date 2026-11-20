#!/usr/bin/env bash
# One-time setup for ChauleClips on macOS / Linux (and CI).
# Usage: bash scripts/setup/setup.sh [--skip-media]
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SKIP_MEDIA="${1:-}"

echo "ChauleClips setup — $ROOT"

command -v python3 >/dev/null || { echo "Python 3.12+ is required."; exit 1; }
command -v node >/dev/null || { echo "Node.js 20+ is required."; exit 1; }

for tool in ffmpeg ffprobe; do
  if command -v "$tool" >/dev/null; then echo "$tool found"; else
    echo "WARNING: $tool not found — install it before uploading videos."
  fi
done

VENV="$ROOT/backend/.venv"
[ -d "$VENV" ] || python3 -m venv "$VENV"
"$VENV/bin/python" -m pip install --upgrade pip --quiet
"$VENV/bin/python" -m pip install -r "$ROOT/backend/requirements-dev.txt"
if [ "$SKIP_MEDIA" != "--skip-media" ]; then
  echo "Installing media/AI dependencies (large)…"
  "$VENV/bin/python" -m pip install -r "$ROOT/backend/requirements-media.txt"
fi

(cd "$ROOT/frontend" && npm install --no-fund --no-audit)
"$VENV/bin/python" "$ROOT/scripts/setup/bootstrap_env.py"

echo "Setup finished. Start with: bash scripts/setup/dev.sh"
