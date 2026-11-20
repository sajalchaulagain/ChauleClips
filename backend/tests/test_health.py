"""Phase 1 connectivity tests: the API answers, and errors have a stable shape."""

from __future__ import annotations

from httpx import AsyncClient


async def test_health_returns_ok(client: AsyncClient) -> None:
    response = await client.get("/api/v1/health")

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["service"] == "ChauleClips"
    assert body["environment"] in {"development", "test", "production"}
    assert "timestamp" in body
    # Every response carries a request id for log correlation.
    assert response.headers.get("X-Request-ID")


async def test_root_banner_points_to_docs(client: AsyncClient) -> None:
    response = await client.get("/")

    assert response.status_code == 200
    body = response.json()
    assert body["docs"] == "/docs"
    assert body["developer"] == "Sajal Chaulagain"


async def test_unknown_route_uses_consistent_error_shape(client: AsyncClient) -> None:
    response = await client.get("/api/v1/does-not-exist")

    assert response.status_code == 404
    error = response.json()["error"]
    assert error["code"] == "NOT_FOUND"
    assert isinstance(error["message"], str)
    assert error["request_id"]


async def test_security_headers_present(client: AsyncClient) -> None:
    response = await client.get("/api/v1/health")

    assert response.headers["X-Content-Type-Options"] == "nosniff"
    assert response.headers["X-Frame-Options"] == "DENY"
