"""MongoDB connection lifecycle.

Key decisions
-------------
1. **PyMongo's async API** (`AsyncMongoClient`) instead of Motor. MongoDB
   deprecated Motor in favour of this official async client, so using it keeps
   us on a maintained path with the same driver underneath.
2. **No connection at import time.** The client is created in the FastAPI
   lifespan. Importing a module should never open sockets — otherwise unit
   tests and CLI scripts open connections they never use.
3. **One client per process.** `AsyncMongoClient` is already a connection pool;
   creating a client per request would exhaust connections.
"""

from __future__ import annotations

import logging
from typing import Any

from fastapi import Request
from pymongo import AsyncMongoClient
from pymongo.asynchronous.database import AsyncDatabase
from pymongo.errors import PyMongoError

from app.core.config import Settings
from app.core.errors import ServiceUnavailable
from app.database.indexes import ensure_indexes

logger = logging.getLogger(__name__)


class MongoConnection:
    """Owns the Mongo client and exposes the database handle."""

    def __init__(self) -> None:
        self._client: AsyncMongoClient | None = None
        self._db: AsyncDatabase | None = None
        self._database_name: str | None = None

    async def connect(self, settings: Settings) -> None:
        """Open the connection, verify it, and create indexes."""
        self._client = AsyncMongoClient(
            settings.mongodb_url,
            serverSelectionTimeoutMS=settings.mongodb_timeout_ms,
            # Store datetimes as real BSON dates, not strings.
            tz_aware=False,
        )
        self._db = self._client[settings.database_name]
        self._database_name = settings.database_name

        try:
            await self._client.admin.command("ping")
        except PyMongoError as exc:
            await self.close()
            raise ServiceUnavailable(
                "Cannot reach MongoDB at the configured MONGODB_URL. "
                "Start MongoDB locally (see docs/INSTALLATION.md) and try again.",
                details={"reason": str(exc)},
            ) from exc

        logger.info("Connected to MongoDB database '%s'.", settings.database_name)
        await ensure_indexes(self._db)

    async def close(self) -> None:
        if self._client is not None:
            await self._client.close()
            logger.info("MongoDB connection closed.")
        self._client = None
        self._db = None

    @property
    def is_connected(self) -> bool:
        return self._db is not None

    @property
    def database(self) -> AsyncDatabase:
        if self._db is None:
            raise ServiceUnavailable(
                "Database connection is not initialised yet.", code="DB_NOT_READY"
            )
        return self._db

    async def ping(self) -> tuple[bool, str | None]:
        """Returns (ok, error_message). Used by the status endpoint."""
        if self._client is None:
            return False, "Client not initialised."
        try:
            await self._client.admin.command("ping")
            return True, None
        except PyMongoError as exc:
            return False, str(exc)

    async def server_info(self) -> dict[str, Any]:
        if self._client is None:
            return {}
        try:
            info = await self._client.server_info()
            return {
                "version": info.get("version"),
                "database": self._database_name,
            }
        except PyMongoError:
            return {}


# Single shared instance for the whole process.
mongo = MongoConnection()


def get_database() -> AsyncDatabase:
    """FastAPI dependency: the current database handle.

    Repositories receive this instead of importing `mongo` directly, which keeps
    them easy to test with a fake database.
    """
    return mongo.database


def get_database_from_request(request: Request) -> AsyncDatabase:
    """Dependency variant that fails cleanly if startup did not connect."""
    database = getattr(request.app.state, "mongo_db", None)
    if database is None:
        raise ServiceUnavailable(
            "Database is unavailable. Check the backend logs.", code="DB_UNAVAILABLE"
        )
    return database
