#!/usr/bin/env python3
"""Drop the local development database (transcripts, projects, users, clips).

Destructive by design, so it refuses to run unless you confirm:
    python scripts/database/reset_dev_db.py --yes

It reads MONGODB_URL / DATABASE_NAME from backend/.env, and also refuses to
touch a database whose name does not end with a development marker unless
--force is passed. That stops you from wiping a production database by reflex.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from pymongo import MongoClient

PROJECT_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(PROJECT_ROOT / "backend"))

from app.core.config import settings  # noqa: E402  (needs the path above)


def main() -> int:
    parser = argparse.ArgumentParser(description="Drop the ChauleClips dev database.")
    parser.add_argument("--yes", action="store_true", help="Skip the confirmation prompt.")
    parser.add_argument(
        "--force",
        action="store_true",
        help="Allow dropping a database name that does not look like a dev database.",
    )
    args = parser.parse_args()

    name = settings.database_name
    if not args.force and not any(marker in name for marker in ("dev", "test", "local")):
        print(
            f"Refusing to drop '{name}': the name has no dev/test marker.\n"
            "Use --force if you are certain."
        )
        return 1

    print(f"Database : {name}\nServer   : {settings.mongodb_url}")
    if not args.yes:
        answer = input("This deletes every user, project, transcript and clip record. Type 'drop' to continue: ")
        if answer.strip().lower() != "drop":
            print("Aborted.")
            return 1

    client = MongoClient(settings.mongodb_url, serverSelectionTimeoutMS=5000)
    client.drop_database(name)
    client.close()
    print(f"Dropped '{name}'. Restart the backend to recreate the collections and indexes.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
