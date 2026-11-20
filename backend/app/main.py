"""ChauleClips API entry point.

Run it with:
    uvicorn app.main:app --reload --port 8000

Startup order matters:
  1. logging + config validation (fail fast on unsafe production config)
  2. MongoDB connect + index creation
  3. serve requests

Anything that fails here is reported with an actionable message instead of a
bare traceback, because a beginner's first error is nearly always "MongoDB is
not running" or "FFmpeg is missing".
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import assert_production_ready, collect_config_warnings, settings
from app.core.errors import ServiceUnavailable, register_exception_handlers
from app.core.logging import configure_logging
from app.database.mongo import mongo
from app.middleware.request_context import RequestContextMiddleware

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    configure_logging(settings)
    logger.info("Starting %s v%s (%s)", settings.app_name, settings.app_version, settings.app_env)

    assert_production_ready(settings)
    for warning in collect_config_warnings(settings):
        logger.warning("Config: %s", warning)

    # A missing database is fatal: almost every endpoint needs it. The message
    # below tells the developer exactly what to do.
    try:
        await mongo.connect(settings)
    except ServiceUnavailable as exc:
        logger.error("%s", exc.message)
        raise

    app.state.mongo_db = mongo.database
    logger.info("API ready on http://%s:%s%s", settings.backend_host, settings.backend_port, settings.api_v1_prefix)

    yield

    await mongo.close()
    logger.info("Shutdown complete.")


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description=(
            "API for ChauleClips — AI-assisted short-form clipping.\n\n"
            "Developed by Sajal Chaulagain — https://sajalchaulagain.com.np"
        ),
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url=None,
        openapi_url="/openapi.json",
    )

    # Middleware runs in reverse order of registration: CORS must be outermost
    # so even error responses carry the right headers.
    app.add_middleware(RequestContextMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,  # required for HttpOnly auth cookies
        allow_methods=["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization", "X-Request-ID"],
        expose_headers=["X-Request-ID"],
        max_age=600,
    )

    register_exception_handlers(app)
    app.include_router(api_router, prefix=settings.api_v1_prefix)

    @app.get("/", tags=["system"], summary="Service banner")
    async def root() -> dict[str, str]:
        return {
            "service": settings.app_name,
            "version": settings.app_version,
            "docs": "/docs",
            "health": f"{settings.api_v1_prefix}/health",
            "developer": "Sajal Chaulagain",
            "portfolio": "https://sajalchaulagain.com.np",
        }

    return app


app = create_app()
