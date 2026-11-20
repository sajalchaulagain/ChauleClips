"""Index definitions for the `chauleclips` database.

Why indexes are declared in code
--------------------------------
The backend creates them on startup (see `ensure_indexes`). That means a fresh
MongoDB gets exactly the indexes the code expects, and you never have to
remember to click something in Compass. Compass is still used for *inspecting*
data and verifying that these indexes exist.

A unique index is also a safety net: even if two signups race past our
"email already exists" check, MongoDB rejects the duplicate at write time.
"""

from __future__ import annotations

import logging

from pymongo import ASCENDING, DESCENDING, IndexModel
from pymongo.asynchronous.database import AsyncDatabase

logger = logging.getLogger(__name__)

# Collection name -> indexes. Keep this list in sync with docs/ARCHITECTURE.md.
INDEX_SPECS: dict[str, list[IndexModel]] = {
    # --- users ---------------------------------------------------------------
    "users": [
        # Case-insensitive uniqueness is enforced by always storing emails
        # lowercased (see users repository, Phase 2).
        IndexModel([("email", ASCENDING)], name="uniq_email", unique=True),
        IndexModel([("created_at", DESCENDING)], name="created_at_desc"),
    ],
    # --- projects ------------------------------------------------------------
    "projects": [
        IndexModel([("user_id", ASCENDING), ("created_at", DESCENDING)], name="user_created"),
        IndexModel([("user_id", ASCENDING), ("status", ASCENDING)], name="user_status"),
    ],
    # --- processing_jobs -----------------------------------------------------
    "processing_jobs": [
        IndexModel([("user_id", ASCENDING), ("created_at", DESCENDING)], name="user_created"),
        IndexModel([("project_id", ASCENDING)], name="project"),
        IndexModel([("status", ASCENDING), ("updated_at", DESCENDING)], name="status_updated"),
    ],
    # --- transcripts ---------------------------------------------------------
    "transcripts": [
        # One cached transcript per project: reusing it is what stops us from
        # transcribing the same video twice (Phase 4).
        IndexModel([("project_id", ASCENDING)], name="uniq_project", unique=True),
        IndexModel([("user_id", ASCENDING)], name="user"),
    ],
    # --- clips ---------------------------------------------------------------
    "clips": [
        IndexModel([("project_id", ASCENDING), ("created_at", ASCENDING)], name="project_created"),
        IndexModel([("user_id", ASCENDING), ("created_at", DESCENDING)], name="user_created"),
        IndexModel([("job_id", ASCENDING)], name="job"),
    ],
    # --- ai_usage ------------------------------------------------------------
    "ai_usage": [
        IndexModel([("user_id", ASCENDING), ("created_at", DESCENDING)], name="user_created"),
        IndexModel([("model", ASCENDING), ("request_status", ASCENDING)], name="model_status"),
    ],
}


async def ensure_indexes(db: AsyncDatabase) -> list[str]:
    """Create any missing indexes. Safe to call on every startup."""
    created: list[str] = []
    for collection_name, indexes in INDEX_SPECS.items():
        collection = db[collection_name]
        try:
            names = await collection.create_indexes(indexes)
            created.extend(f"{collection_name}.{name}" for name in names)
        except Exception as exc:  # noqa: BLE001 - startup must report, not crash blindly
            # A conflicting existing index is worth a loud warning, but should
            # not take the whole API down in development.
            logger.error("Could not create indexes for '%s': %s", collection_name, exc)
    if created:
        logger.info("MongoDB indexes ready (%d newly created).", len(created))
    else:
        logger.info("MongoDB indexes ready (already up to date).")
    return created


async def list_existing_indexes(db: AsyncDatabase) -> dict[str, list[str]]:
    """Used by the system status endpoint so you can confirm indexes from the UI."""
    result: dict[str, list[str]] = {}
    for collection_name in INDEX_SPECS:
        try:
            info = await db[collection_name].index_information()
            result[collection_name] = sorted(info.keys())
        except Exception:  # pragma: no cover - collection may not exist yet
            result[collection_name] = []
    return result
