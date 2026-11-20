#!/usr/bin/env python3
"""Create local environment files and media folders from the templates.

Why a Python script instead of "copy the file and edit it by hand":
  - it generates cryptographically secure SECRET_KEY / JWT_SECRET_KEY values,
  - it never overwrites an existing .env (so a re-run cannot destroy your keys),
  - it works identically on Windows PowerShell, macOS and Linux.

Usage (from the repository root):
    python scripts/setup/bootstrap_env.py
    python scripts/setup/bootstrap_env.py --force   # regenerate .env files
"""

from __future__ import annotations

import argparse
import re
import secrets
import shutil
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
BACKEND_DIR = PROJECT_ROOT / "backend"
FRONTEND_DIR = PROJECT_ROOT / "frontend"
STORAGE_DIR = PROJECT_ROOT / "storage"

STORAGE_SUBDIRS = ("uploads", "extracted_audio", "temporary", "generated_clips", "thumbnails")

# Values that must never survive into a working .env.
SECRET_FIELDS = ("SECRET_KEY", "JWT_SECRET_KEY")


def generate_secret(length: int = 48) -> str:
    """URL-safe random string (~288 bits of entropy at the default length)."""
    return secrets.token_urlsafe(length)


def render_env(template: Path, overrides: dict[str, str]) -> str:
    """Replace KEY=... lines for the given keys, keeping comments and order."""
    lines: list[str] = []
    for line in template.read_text(encoding="utf-8").splitlines():
        match = re.match(r"^([A-Z0-9_]+)=(.*)$", line)
        if match and match.group(1) in overrides:
            lines.append(f"{match.group(1)}={overrides[match.group(1)]}")
        else:
            lines.append(line)
    return "\n".join(lines) + "\n"


def write_env(template: Path, target: Path, overrides: dict[str, str], force: bool) -> str:
    if target.exists() and not force:
        return f"kept existing {target.relative_to(PROJECT_ROOT)}"
    if not template.exists():
        return f"SKIPPED {target.name}: template {template.name} missing"
    target.write_text(render_env(template, overrides), encoding="utf-8")
    return f"created {target.relative_to(PROJECT_ROOT)}"


def ensure_storage() -> list[str]:
    created: list[str] = []
    for name in STORAGE_SUBDIRS:
        path = STORAGE_DIR / name
        if not path.is_dir():
            path.mkdir(parents=True, exist_ok=True)
            created.append(name)
    return created


def check_binary(command: str) -> bool:
    return shutil.which(command) is not None


def main() -> int:
    parser = argparse.ArgumentParser(description="Bootstrap ChauleClips local config.")
    parser.add_argument(
        "--force",
        action="store_true",
        help="Overwrite existing .env files (invalidates current sessions).",
    )
    args = parser.parse_args()

    print("ChauleClips — environment bootstrap")
    print("-" * 42)

    backend_env = BACKEND_DIR / ".env"
    backend_overrides = {field: generate_secret() for field in SECRET_FIELDS}
    print(" ", write_env(BACKEND_DIR / ".env.example", backend_env, backend_overrides, args.force))

    # The frontend template has no secrets; VITE_* values are public by design.
    print(
        " ",
        write_env(FRONTEND_DIR / ".env.example", FRONTEND_DIR / ".env", {}, args.force),
    )

    created = ensure_storage()
    print(
        "  storage directories:",
        "all present" if not created else f"created {', '.join(created)}",
    )

    print("-" * 42)
    checks = [
        ("python", check_binary("python") or check_binary("python3")),
        ("node", check_binary("node")),
        ("npm", check_binary("npm")),
        ("ffmpeg", check_binary("ffmpeg")),
        ("ffprobe", check_binary("ffprobe")),
        ("mongod", check_binary("mongod") or check_binary("mongosh")),
    ]
    for name, ok in checks:
        print(f"  {'OK  ' if ok else 'MISS'}  {name}")

    missing = [name for name, ok in checks if not ok]
    if missing:
        print(
            "\n  Missing tools: "
            + ", ".join(missing)
            + "\n  See docs/INSTALLATION.md for install commands. The app can still"
            "\n  start, but uploads/rendering need FFmpeg and login needs MongoDB."
        )

    print(
        "\nNext steps:\n"
        "  1. Add a free OpenRouter key to backend/.env (OPENROUTER_API_KEY=...)\n"
        "     — optional for now; AI analysis stays disabled until it is set.\n"
        "  2. Start MongoDB.\n"
        "  3. Start the backend:  cd backend && uvicorn app.main:app --reload\n"
        "  4. Start the frontend: cd frontend && npm run dev\n"
        "  5. Open http://localhost:5173 and check the System status panel."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
