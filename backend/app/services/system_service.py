"""Environment / system checks surfaced by `GET /api/v1/system/status`.

This is not decoration: the frontend shows these results on the landing page and
in Settings, and you will look at them every time something "does not work".
Each check answers three questions — is it working, what exactly did we find,
and what should the user do about it.
"""

from __future__ import annotations

import asyncio
import shutil
import subprocess
from dataclasses import asdict, dataclass
from typing import Literal

from app.core.config import Settings, collect_config_warnings
from app.database.mongo import mongo

CheckState = Literal["ok", "warning", "error"]


@dataclass(slots=True)
class Check:
    id: str
    label: str
    status: CheckState
    detail: str
    hint: str | None = None


def _run_version_command(binary: str, args: list[str]) -> tuple[bool, str]:
    """Run a `-version` command safely and return the first line."""
    if shutil.which(binary) is None:
        return False, "not found on PATH"
    try:
        result = subprocess.run(  # noqa: S603 - fixed argv, no shell, no user input
            [binary, *args],
            capture_output=True,
            text=True,
            timeout=10,
            check=False,
        )
    except (OSError, subprocess.SubprocessError) as exc:
        return False, f"could not execute: {exc}"

    if result.returncode != 0:
        return False, (result.stderr or "non-zero exit code").strip().splitlines()[0]

    first_line = (result.stdout or "").strip().splitlines()
    return True, first_line[0] if first_line else "installed"


def _check_ffmpeg(settings: Settings) -> list[Check]:
    ffmpeg_ok, ffmpeg_detail = _run_version_command(settings.ffmpeg_path, ["-version"])
    ffprobe_ok, ffprobe_detail = _run_version_command(settings.ffprobe_path, ["-version"])

    def state(ok: bool) -> CheckState:
        return "ok" if ok else "error"

    return [
        Check(
            id="ffmpeg",
            label="FFmpeg",
            status=state(ffmpeg_ok),
            detail=ffmpeg_detail,
            hint=None if ffmpeg_ok else "Install FFmpeg and make sure it is on PATH.",
        ),
        Check(
            id="ffprobe",
            label="FFprobe",
            status=state(ffprobe_ok),
            detail=ffprobe_detail,
            hint=None if ffprobe_ok else "FFprobe ships with FFmpeg; check your PATH.",
        ),
    ]


def _check_storage(settings: Settings) -> Check:
    storage = settings.storage_dir
    required = ["uploads", "extracted_audio", "temporary", "generated_clips", "thumbnails"]
    missing = [name for name in required if not (storage / name).is_dir()]

    try:
        storage.mkdir(parents=True, exist_ok=True)
        for name in missing:
            (storage / name).mkdir(parents=True, exist_ok=True)
        probe = storage / ".write-test"
        probe.write_text("ok", encoding="utf-8")
        probe.unlink()
    except OSError as exc:
        return Check(
            id="storage",
            label="Media storage",
            status="error",
            detail=f"{storage} is not writable: {exc}",
            hint="Check folder permissions or change VIDEO_STORAGE_PATH.",
        )

    usage = shutil.disk_usage(storage)
    free_gb = usage.free / (1024**3)
    status: CheckState = "ok" if free_gb >= 5 else "warning"
    return Check(
        id="storage",
        label="Media storage",
        status=status,
        detail=f"{storage} — {free_gb:.1f} GB free",
        hint=None if status == "ok" else "Video processing needs free disk space (5 GB+).",
    )


async def _check_database() -> Check:
    ok, error = await mongo.ping()
    if not ok:
        return Check(
            id="database",
            label="MongoDB",
            status="error",
            detail=error or "unreachable",
            hint="Start MongoDB Community Server and verify MONGODB_URL.",
        )
    info = await mongo.server_info()
    return Check(
        id="database",
        label="MongoDB",
        status="ok",
        detail=f"connected — v{info.get('version', '?')}, db '{info.get('database', '?')}'",
    )


def _check_openrouter(settings: Settings) -> Check:
    if settings.openrouter_configured:
        return Check(
            id="openrouter",
            label="OpenRouter AI",
            status="ok",
            detail=f"key configured — model '{settings.openrouter_model}'",
        )
    return Check(
        id="openrouter",
        label="OpenRouter AI",
        status="warning",
        detail="no API key configured (AI analysis disabled)",
        hint="Create a free key at https://openrouter.ai/keys and set OPENROUTER_API_KEY.",
    )


async def collect_system_status(settings: Settings) -> dict:
    """Run every check (concurrently where it makes sense) and summarise."""
    ffmpeg_checks, storage_check = await asyncio.gather(
        asyncio.to_thread(_check_ffmpeg, settings),
        asyncio.to_thread(_check_storage, settings),
    )
    db_check = await _check_database()
    openrouter_check = _check_openrouter(settings)

    checks = [*ffmpeg_checks, db_check, storage_check, openrouter_check]

    # Overall state: an error dominates, then warnings, then all good.
    if any(c.status == "error" for c in checks):
        overall: CheckState = "error"
    elif any(c.status == "warning" for c in checks):
        overall = "warning"
    else:
        overall = "ok"

    return {
        "overall": overall,
        "app": {
            "name": settings.app_name,
            "version": settings.app_version,
            "environment": settings.app_env,
            "debug": settings.debug,
        },
        "checks": [asdict(check) for check in checks],
        "config_warnings": collect_config_warnings(settings),
    }
