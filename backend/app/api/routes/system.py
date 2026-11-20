"""Deep readiness report: MongoDB, FFmpeg/FFprobe, storage, AI configuration."""

from __future__ import annotations

from fastapi import APIRouter

from app.core.config import settings
from app.schemas.system import SystemStatusResponse
from app.services.system_service import collect_system_status

router = APIRouter(tags=["system"])


@router.get(
    "/system/status",
    response_model=SystemStatusResponse,
    summary="Environment readiness report",
)
async def system_status() -> SystemStatusResponse:
    """Report which parts of the stack are actually working.

    Public on purpose: it contains no secrets (never the API key itself, only
    whether one is configured) and it is the fastest way for a new developer to
    see what is missing.
    """
    return SystemStatusResponse(**await collect_system_status(settings))
