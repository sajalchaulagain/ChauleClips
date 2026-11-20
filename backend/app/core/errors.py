"""One error shape for the whole API.

Every failure — validation, auth, quota, missing file — is returned as:

    {
      "error": {
        "code": "MACHINE_READABLE_CODE",
        "message": "Human readable explanation of what happened.",
        "details": {...} | null,
        "request_id": "..."
      }
    }

The frontend can therefore show `error.message` directly and still branch on
`error.code`. Internal tracebacks are logged, never returned to the client,
unless DEBUG is on.
"""

from __future__ import annotations

import logging
from typing import Any

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = logging.getLogger(__name__)


class AppError(Exception):
    """Base class for expected, user-facing errors."""

    code = "APP_ERROR"
    status_code = status.HTTP_400_BAD_REQUEST
    message = "Something went wrong."

    def __init__(
        self,
        message: str | None = None,
        *,
        code: str | None = None,
        status_code: int | None = None,
        details: Any = None,
    ) -> None:
        self.message = message or self.message
        self.code = code or self.code
        self.status_code = status_code or self.status_code
        self.details = details
        super().__init__(self.message)


class ValidationFailed(AppError):
    code = "VALIDATION_FAILED"
    status_code = status.HTTP_422_UNPROCESSABLE_CONTENT
    message = "Some of the submitted values are invalid."


class AuthenticationRequired(AppError):
    code = "AUTH_REQUIRED"
    status_code = status.HTTP_401_UNAUTHORIZED
    message = "You need to sign in to do that."


class PermissionDenied(AppError):
    code = "PERMISSION_DENIED"
    status_code = status.HTTP_403_FORBIDDEN
    message = "You do not have access to this resource."


class NotFound(AppError):
    code = "NOT_FOUND"
    status_code = status.HTTP_404_NOT_FOUND
    message = "The requested resource was not found."


class Conflict(AppError):
    code = "CONFLICT"
    status_code = status.HTTP_409_CONFLICT
    message = "That action conflicts with the current state."


class RateLimited(AppError):
    code = "RATE_LIMITED"
    status_code = status.HTTP_429_TOO_MANY_REQUESTS
    message = "Too many requests. Please wait a moment and try again."


class ServiceUnavailable(AppError):
    code = "SERVICE_UNAVAILABLE"
    status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    message = "A required service is not available right now."


def _error_body(
    request: Request,
    code: str,
    message: str,
    details: Any = None,
) -> dict[str, Any]:
    return {
        "error": {
            "code": code,
            "message": message,
            "details": details,
            "request_id": getattr(request.state, "request_id", None),
        }
    }


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def _app_error_handler(request: Request, exc: AppError) -> JSONResponse:
        # 5xx means our bug; 4xx means the caller's mistake. Log accordingly.
        log = logger.error if exc.status_code >= 500 else logger.warning
        log("%s %s -> %s (%s)", request.method, request.url.path, exc.code, exc.message)
        return JSONResponse(
            status_code=exc.status_code,
            content=_error_body(request, exc.code, exc.message, exc.details),
        )

    @app.exception_handler(RequestValidationError)
    async def _validation_handler(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        # Reduce Pydantic's verbose errors to field + reason pairs.
        details = [
            {
                "field": ".".join(str(part) for part in err["loc"][1:]) or "body",
                "reason": err["msg"],
            }
            for err in exc.errors()
        ]
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            content=_error_body(
                request,
                "VALIDATION_FAILED",
                "Some of the submitted values are invalid.",
                details,
            ),
        )

    @app.exception_handler(StarletteHTTPException)
    async def _http_handler(
        request: Request, exc: StarletteHTTPException
    ) -> JSONResponse:
        code = {
            401: "AUTH_REQUIRED",
            403: "PERMISSION_DENIED",
            404: "NOT_FOUND",
            405: "METHOD_NOT_ALLOWED",
            413: "PAYLOAD_TOO_LARGE",
            429: "RATE_LIMITED",
        }.get(exc.status_code, "HTTP_ERROR")
        message = exc.detail if isinstance(exc.detail, str) else "Request failed."
        return JSONResponse(
            status_code=exc.status_code,
            content=_error_body(request, code, message),
            headers=getattr(exc, "headers", None),
        )

    @app.exception_handler(Exception)
    async def _unhandled_handler(request: Request, exc: Exception) -> JSONResponse:
        # Full traceback in the log, generic message to the client.
        logger.exception("Unhandled error on %s %s", request.method, request.url.path)
        detail = repr(exc) if app.debug else None
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=_error_body(
                request,
                "INTERNAL_ERROR",
                "An unexpected error occurred. Check the backend logs for details.",
                detail,
            ),
        )
