"""Request context middleware: a request id + security headers on every response.

The request id is what makes debugging possible: it is printed in every log
line for that request and also returned to the client inside error bodies, so
a user can paste it and you can grep for it.
"""

from __future__ import annotations

import logging
import time
import uuid
from collections.abc import Awaitable, Callable

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

logger = logging.getLogger("app.request")

# Routes that are polled by the dashboard; logging each one would bury real events.
QUIET_PATHS = {"/api/v1/health"}


class RequestContextMiddleware(BaseHTTPMiddleware):
    async def dispatch(
        self,
        request: Request,
        call_next: Callable[[Request], Awaitable[Response]],
    ) -> Response:
        # Reuse a proxy-generated id when present, otherwise create one.
        request_id = request.headers.get("X-Request-ID") or uuid.uuid4().hex[:16]
        request.state.request_id = request_id
        started = time.perf_counter()

        response = await call_next(request)

        elapsed_ms = (time.perf_counter() - started) * 1000
        response.headers["X-Request-ID"] = request_id

        # These are cheap, safe defaults for a JSON API. A browser cannot be
        # tricked into sniffing or framing API responses.
        response.headers.setdefault("X-Content-Type-Options", "nosniff")
        response.headers.setdefault("X-Frame-Options", "DENY")
        response.headers.setdefault("Referrer-Policy", "no-referrer")

        if request.url.path not in QUIET_PATHS:
            logger.info(
                "%s %s -> %s (%.0f ms) [%s]",
                request.method,
                request.url.path,
                response.status_code,
                elapsed_ms,
                request_id,
            )
        return response
