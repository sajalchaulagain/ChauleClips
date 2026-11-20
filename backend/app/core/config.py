"""Typed application settings loaded from environment variables.

Why this file exists
--------------------
Every configurable value lives here exactly once. The rest of the backend asks
`settings.<name>` instead of reading `os.environ` in random places, so a missing
or broken value is caught at startup instead of half-way through a video job.

Values come from (highest priority first):
  1. real environment variables
  2. backend/.env
  3. the safe defaults below
"""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# backend/app/core/config.py -> parents[2] == backend/
BACKEND_DIR = Path(__file__).resolve().parents[2]
PROJECT_ROOT = BACKEND_DIR.parent

DEFAULT_SECRET = "CHANGE_ME"


def _split_csv(value: str) -> list[str]:
    """Turn "a, b,,c" into ["a", "b", "c"] without leaving empty items behind."""
    return [item.strip() for item in value.split(",") if item.strip()]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(BACKEND_DIR / ".env"),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # --- Application ---------------------------------------------------------
    app_name: str = "ChauleClips"
    app_env: Literal["development", "production", "test"] = "development"
    app_version: str = "0.1.0"
    debug: bool = True
    api_v1_prefix: str = "/api/v1"

    # --- Secrets -------------------------------------------------------------
    secret_key: str = DEFAULT_SECRET
    jwt_secret_key: str = DEFAULT_SECRET
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = Field(default=30, ge=5, le=1440)
    jwt_refresh_token_expire_days: int = Field(default=7, ge=1, le=90)

    # --- Server --------------------------------------------------------------
    backend_host: str = "127.0.0.1"
    backend_port: int = 8000
    frontend_url: str = "http://localhost:5173"
    cors_origins: str = "http://localhost:5173"

    # --- Database ------------------------------------------------------------
    mongodb_url: str = "mongodb://127.0.0.1:27017"
    database_name: str = "chauleclips"
    mongodb_timeout_ms: int = Field(default=5000, ge=500, le=60000)

    # --- OpenRouter (optional until AI features are used) --------------------
    openrouter_api_key: str = ""
    openrouter_base_url: str = "https://openrouter.ai/api/v1"
    openrouter_model: str = "openrouter/free"
    openrouter_fallback_models: str = ""
    openrouter_timeout_seconds: float = 120.0
    openrouter_max_retries: int = Field(default=2, ge=0, le=5)

    # --- Storage & limits ----------------------------------------------------
    video_storage_path: str = "../storage"
    max_video_size_mb: int = Field(default=2048, ge=1)
    max_video_duration_minutes: int = Field(default=180, ge=1)

    # --- Media tooling -------------------------------------------------------
    ffmpeg_binary: str = ""
    ffprobe_binary: str = ""
    ffmpeg_timeout_seconds: int = Field(default=1800, ge=30)

    # --- Transcription -------------------------------------------------------
    whisper_model: str = "base"
    whisper_device: Literal["cpu", "cuda"] = "cpu"
    whisper_compute_type: str = "int8"

    # --- Optional account features ------------------------------------------
    email_verification_enabled: bool = False
    password_reset_enabled: bool = False

    # ------------------------------------------------------------------ helpers
    @field_validator("mongodb_url")
    @classmethod
    def _require_mongo_scheme(cls, value: str) -> str:
        if not value.startswith(("mongodb://", "mongodb+srv://")):
            raise ValueError("MONGODB_URL must start with mongodb:// or mongodb+srv://")
        return value

    @property
    def cors_origin_list(self) -> list[str]:
        """Origins allowed to call the API from a browser."""
        origins = _split_csv(self.cors_origins)
        # The frontend URL is always allowed so a typo in CORS_ORIGINS cannot
        # silently break local login.
        if self.frontend_url and self.frontend_url not in origins:
            origins.append(self.frontend_url)
        return origins

    @property
    def openrouter_fallback_list(self) -> list[str]:
        return _split_csv(self.openrouter_fallback_models)

    @property
    def openrouter_configured(self) -> bool:
        return bool(self.openrouter_api_key.strip())

    @property
    def is_production(self) -> bool:
        return self.app_env == "production"

    @property
    def storage_dir(self) -> Path:
        """Absolute path of the media root (storage/ by default)."""
        path = Path(self.video_storage_path).expanduser()
        if not path.is_absolute():
            path = (BACKEND_DIR / path).resolve()
        return path

    def storage_subdir(self, name: str) -> Path:
        return self.storage_dir / name

    @property
    def ffmpeg_path(self) -> str:
        return self.ffmpeg_binary or "ffmpeg"

    @property
    def ffprobe_path(self) -> str:
        return self.ffprobe_binary or "ffprobe"


def collect_config_warnings(settings: Settings) -> list[str]:
    """Non-fatal problems, logged at startup and shown in the system status.

    We deliberately do not crash local development for a missing OpenRouter key
    or a placeholder secret, but production is a different story: see
    `assert_production_ready`.
    """
    warnings: list[str] = []

    if settings.secret_key == DEFAULT_SECRET:
        warnings.append(
            "SECRET_KEY is still the placeholder. Run scripts/setup to generate "
            "a real value before deploying."
        )
    if settings.jwt_secret_key == DEFAULT_SECRET:
        warnings.append("JWT_SECRET_KEY is still the placeholder.")
    if settings.secret_key == settings.jwt_secret_key and settings.secret_key != DEFAULT_SECRET:
        warnings.append(
            "SECRET_KEY and JWT_SECRET_KEY are identical; use separate values."
        )
    if not settings.openrouter_configured:
        warnings.append(
            "OPENROUTER_API_KEY is not set. The app runs, but AI clip analysis "
            "stays disabled until you add a free key from https://openrouter.ai/keys."
        )
    if settings.email_verification_enabled or settings.password_reset_enabled:
        warnings.append(
            "EMAIL_VERIFICATION_ENABLED / PASSWORD_RESET_ENABLED are on but no SMTP "
            "settings exist yet; these features stay off in this version."
        )
    return warnings


def assert_production_ready(settings: Settings) -> None:
    """Refuse to boot production with development secrets."""
    if not settings.is_production:
        return

    problems = []
    if settings.secret_key == DEFAULT_SECRET or len(settings.secret_key) < 32:
        problems.append("SECRET_KEY must be a random value of at least 32 characters.")
    if settings.jwt_secret_key == DEFAULT_SECRET or len(settings.jwt_secret_key) < 32:
        problems.append("JWT_SECRET_KEY must be a random value of at least 32 characters.")
    if settings.debug:
        problems.append("DEBUG must be false in production.")
    if problems:
        raise RuntimeError(
            "Refusing to start in production with unsafe configuration:\n  - "
            + "\n  - ".join(problems)
        )


@lru_cache
def get_settings() -> Settings:
    """Cached settings instance (import this everywhere instead of Settings())."""
    return Settings()


settings = get_settings()
