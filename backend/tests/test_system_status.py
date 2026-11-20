"""System status endpoint: shape, honesty about missing services, no leaks."""

from __future__ import annotations

from httpx import AsyncClient

EXPECTED_CHECKS = {"ffmpeg", "ffprobe", "database", "storage", "openrouter"}


async def test_status_lists_every_check(client: AsyncClient) -> None:
    response = await client.get("/api/v1/system/status")

    assert response.status_code == 200
    body = response.json()
    assert body["overall"] in {"ok", "warning", "error"}
    assert {check["id"] for check in body["checks"]} == EXPECTED_CHECKS
    for check in body["checks"]:
        assert check["status"] in {"ok", "warning", "error"}
        assert check["detail"]


async def test_status_does_not_leak_secrets(client: AsyncClient) -> None:
    from app.core.config import settings

    settings.openrouter_api_key = "sk-or-v1-SUPER-SECRET-VALUE"
    try:
        response = await client.get("/api/v1/system/status")
        assert "SUPER-SECRET-VALUE" not in response.text
    finally:
        settings.openrouter_api_key = ""
