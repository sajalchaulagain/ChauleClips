"""Response schemas for health and system-status endpoints.

Declaring them here means /docs documents the real response shape, and a typo
in the service layer fails loudly during development instead of silently
changing the API contract.
"""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel


class HealthResponse(BaseModel):
    """Cheap liveness probe: does the API process answer at all?"""

    status: Literal["ok"] = "ok"
    service: str
    version: str
    environment: str
    timestamp: str


class SystemCheck(BaseModel):
    id: str
    label: str
    status: Literal["ok", "warning", "error"]
    detail: str
    hint: str | None = None


class AppInfo(BaseModel):
    name: str
    version: str
    environment: str
    debug: bool


class SystemStatusResponse(BaseModel):
    """Detailed readiness report shown on the landing page and in Settings."""

    overall: Literal["ok", "warning", "error"]
    app: AppInfo
    checks: list[SystemCheck]
    config_warnings: list[str]
