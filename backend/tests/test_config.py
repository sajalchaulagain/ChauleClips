"""Configuration behaviour: warnings, production guard, path resolution."""

from __future__ import annotations

import pytest

from app.core.config import (
    DEFAULT_SECRET,
    Settings,
    assert_production_ready,
    collect_config_warnings,
)


def _settings(**overrides) -> Settings:
    # _env_file=None keeps the developer's real backend/.env out of unit tests.
    base = {
        "secret_key": "x" * 40,
        "jwt_secret_key": "y" * 40,
        "openrouter_api_key": "test-key",
    }
    base.update(overrides)
    return Settings(_env_file=None, **base)


def test_placeholder_secrets_are_reported() -> None:
    settings = _settings(secret_key=DEFAULT_SECRET, jwt_secret_key=DEFAULT_SECRET)
    warnings = " ".join(collect_config_warnings(settings))

    assert "SECRET_KEY" in warnings
    assert "JWT_SECRET_KEY" in warnings


def test_missing_openrouter_key_is_a_warning_not_a_crash() -> None:
    settings = _settings(openrouter_api_key="")
    warnings = " ".join(collect_config_warnings(settings))

    assert "OPENROUTER_API_KEY" in warnings
    assert settings.openrouter_configured is False


def test_configured_settings_have_no_warnings() -> None:
    assert collect_config_warnings(_settings()) == []


def test_production_refuses_default_secrets() -> None:
    settings = _settings(app_env="production", secret_key=DEFAULT_SECRET, debug=False)
    with pytest.raises(RuntimeError, match="unsafe configuration"):
        assert_production_ready(settings)


def test_production_requires_debug_off() -> None:
    settings = _settings(app_env="production", debug=True)
    with pytest.raises(RuntimeError, match="DEBUG must be false"):
        assert_production_ready(settings)


def test_cors_origins_are_split_and_frontend_added() -> None:
    settings = _settings(
        cors_origins="https://a.example, https://b.example",
        frontend_url="https://app.example",
    )
    assert settings.cors_origin_list == [
        "https://a.example",
        "https://b.example",
        "https://app.example",
    ]


def test_storage_path_is_absolute() -> None:
    settings = _settings(video_storage_path="../storage")
    assert settings.storage_dir.is_absolute()
    assert settings.storage_dir.name == "storage"


def test_invalid_mongodb_url_rejected() -> None:
    with pytest.raises(ValueError):
        _settings(mongodb_url="http://localhost:27017")
