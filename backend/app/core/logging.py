"""Logging setup: readable in development, one-line-per-event in production.

We log to stdout on purpose — when you later run the API under a process
manager (Render, systemd, Docker) stdout is captured for free.
"""

from __future__ import annotations

import logging
import sys

from app.core.config import Settings

LOG_FORMAT_DEV = "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"
LOG_FORMAT_PROD = "%(asctime)s | %(levelname)s | %(name)s | %(message)s"


def configure_logging(settings: Settings) -> None:
    """Configure the root logger once, at startup."""
    level = logging.DEBUG if settings.debug else logging.INFO

    # uvicorn installs its own handlers; we replace them with one consistent
    # format so app logs and server logs look the same in the terminal.
    root = logging.getLogger()
    root.handlers.clear()

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(
        logging.Formatter(LOG_FORMAT_DEV if settings.debug else LOG_FORMAT_PROD)
    )
    root.addHandler(handler)
    root.setLevel(level)

    # These libraries are extremely chatty at DEBUG level.
    for noisy in ("httpx", "httpcore", "pymongo", "watchfiles"):
        logging.getLogger(noisy).setLevel(logging.WARNING)


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)
