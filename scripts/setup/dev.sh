#!/usr/bin/env bash
# Start backend + frontend together for local development (macOS / Linux).
# Ctrl+C stops both.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
VENV_PY="$ROOT/backend/.venv/bin/python"

[ -x "$VENV_PY" ] || { echo "Run scripts/setup/setup.sh first."; exit 1; }

if ! (echo > /dev/tcp/127.0.0.1/27017) 2>/dev/null; then
  echo "WARNING: MongoDB is not reachable on 127.0.0.1:27017."
fi

cleanup() { kill 0 2>/dev/null || true; }
trap cleanup EXIT INT TERM

(cd "$ROOT/backend" && "$VENV_PY" -m uvicorn app.main:app --reload --port 8000) &
(cd "$ROOT/frontend" && npm run dev) &

wait
