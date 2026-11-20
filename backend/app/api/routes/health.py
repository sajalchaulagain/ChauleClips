"""Liveness endpoint — no database, no disk, no subprocesses."""

from __future__ import annotations

from datetime import UTC, datetime

from fastapi import APIRouter
from fastapi import status as http_status

from app.core.config import settings
from app.schemas.system import HealthResponse

router = APIRouter(tags=["system"])


@router.get(
    "/health",
    response_model=HealthResponse,
    status_code=http_status.HTTP_200_OK,
    summary="Liveness probe",
)
async def health() -> HealthResponse:
    """Return quickly if the API process is alive.

    This is what the frontend pings to prove connectivity. It deliberately does
    NOT touch MongoDB: a slow database should be reported by /system/status,
    not make the process look dead.
    """
    return HealthResponse(
        service=settings.app_name,
        version=settings.app_version,
        environment=settings.app_env,
        timestamp=datetime.now(UTC).isoformat(),
    )
