#!/usr/bin/env python3
"""Report (and optionally delete) orphaned or old files in storage/.

Used from Phase 3 onwards, when uploads and rendered clips start accumulating.

    python scripts/maintenance/cleanup_storage.py --dry-run
    python scripts/maintenance/cleanup_storage.py --older-than-days 14 --delete

Safety rules:
  - only touches files inside the configured storage directory,
  - ignores .gitkeep,
  - --dry-run is the default behaviour (delete requires --delete).
"""

from __future__ import annotations

import argparse
import sys
import time
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(PROJECT_ROOT / "backend"))

from app.core.config import settings  # noqa: E402

SKIP_NAMES = {".gitkeep"}


def main() -> int:
    parser = argparse.ArgumentParser(description="Clean old files from storage/.")
    parser.add_argument("--older-than-days", type=int, default=7)
    parser.add_argument("--delete", action="store_true", help="Actually delete (default is dry run).")
    args = parser.parse_args()

    storage = settings.storage_dir.resolve()
    cutoff = time.time() - args.older_than_days * 86400
    total_bytes = 0
    candidates: list[Path] = []

    for sub in ("uploads", "extracted_audio", "temporary", "generated_clips", "thumbnails"):
        folder = (storage / sub)
        if not folder.is_dir():
            continue
        for path in folder.rglob("*"):
            if not path.is_file() or path.name in SKIP_NAMES:
                continue
            # Defence in depth against symlinks pointing outside storage/.
            if storage not in path.resolve().parents:
                print(f"  skip (outside storage): {path}")
                continue
            if path.stat().st_mtime < cutoff:
                candidates.append(path)
                total_bytes += path.stat().st_size

    print(f"Storage: {storage}")
    print(f"Older than {args.older_than_days} day(s): {len(candidates)} file(s), "
          f"{total_bytes / (1024**2):.1f} MB")

    for path in candidates[:20]:
        print(f"  {path.relative_to(storage)}")
    if len(candidates) > 20:
        print(f"  … and {len(candidates) - 20} more")

    if args.delete and candidates:
        for path in candidates:
            path.unlink(missing_ok=True)
        print(f"Deleted {len(candidates)} file(s).")
    elif candidates:
        print("Dry run only. Re-run with --delete to remove them.")

    return 0


if __name__ == "__main__":
    sys.exit(main())
