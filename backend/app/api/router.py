"""Aggregates every route module under a single /api/v1 router.

New resources get one `include_router` line here, e.g.:
    from app.api.routes import auth
    api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
"""

from __future__ import annotations

from fastapi import APIRouter

from app.api.routes import auth, health, system

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(system.router)
api_router.include_router(auth.router)
