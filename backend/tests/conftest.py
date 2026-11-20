"""Shared pytest fixtures.

Design note: these tests use httpx's ASGITransport, which calls the app
*without* running the lifespan. That keeps unit tests fast and independent of a
running MongoDB. Anything that needs a real database is an integration test and
is marked accordingly (see tests marked `@pytest.mark.integration`).
"""

from __future__ import annotations

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import create_app


@pytest.fixture
async def client() -> AsyncClient:
    """An in-process HTTP client bound to a freshly created app instance."""
    app = create_app()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        yield ac
