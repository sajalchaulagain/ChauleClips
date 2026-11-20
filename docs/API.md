# API reference

Base URL: `http://127.0.0.1:8000` · Version prefix: `/api/v1`
Interactive docs: <http://127.0.0.1:8000/docs> (generated from the code, always current)

Every response carries `X-Request-ID`. Every failure uses the error envelope in
[ARCHITECTURE.md §5](ARCHITECTURE.md#5-error-contract).

## Endpoints implemented today

### `GET /`
Service banner: name, version, docs URL, developer credit. No authentication.

```json
{
  "service": "ChauleClips",
  "version": "0.1.0",
  "docs": "/docs",
  "health": "/api/v1/health",
  "developer": "Sajal Chaulagain",
  "portfolio": "https://sajalchaulagain.com.np"
}
```

### `GET /api/v1/health`
Liveness only — no database, no disk, no subprocess. Use this for uptime checks.

```json
{
  "status": "ok",
  "service": "ChauleClips",
  "version": "0.1.0",
  "environment": "development",
  "timestamp": "2026-11-20T05:12:06.184229+00:00"
}
```

### `GET /api/v1/system/status`
Deep readiness report used by the landing page and (later) Settings. Public on purpose: it never
contains secrets, only whether a key is configured.

```json
{
  "overall": "warning",
  "app": { "name": "ChauleClips", "version": "0.1.0", "environment": "development", "debug": true },
  "checks": [
    { "id": "ffmpeg", "label": "FFmpeg", "status": "ok", "detail": "ffmpeg version 7.1.5 …", "hint": null },
    { "id": "ffprobe", "label": "FFprobe", "status": "ok", "detail": "ffprobe version 7.1.5 …", "hint": null },
    { "id": "database", "label": "MongoDB", "status": "ok", "detail": "connected — v8.0.15, db 'chauleclips'", "hint": null },
    { "id": "storage", "label": "Media storage", "status": "ok", "detail": "/…/storage — 18.5 GB free", "hint": null },
    { "id": "openrouter", "label": "OpenRouter AI", "status": "warning", "detail": "no API key configured (AI analysis disabled)", "hint": "Create a free key at https://openrouter.ai/keys and set OPENROUTER_API_KEY." }
  ],
  "config_warnings": ["OPENROUTER_API_KEY is not set. …"]
}
```

`overall` is `error` if any check is an error, otherwise `warning` if any is a warning, otherwise `ok`.

### Error codes in use

| HTTP | `code` | Meaning |
|---|---|---|
| 401 | `AUTH_REQUIRED` | no/invalid session |
| 403 | `PERMISSION_DENIED` | resource belongs to another user |
| 404 | `NOT_FOUND` | unknown route or resource |
| 409 | `CONFLICT` | duplicate email, duplicate job |
| 413 | `PAYLOAD_TOO_LARGE` | upload exceeds `MAX_VIDEO_SIZE_MB` |
| 422 | `VALIDATION_FAILED` | request body/query failed validation (`details` names the field) |
| 429 | `RATE_LIMITED` | too many auth attempts or AI quota exhausted |
| 503 | `SERVICE_UNAVAILABLE` | MongoDB unreachable, queue full, provider down |
| 500 | `INTERNAL_ERROR` | unexpected; check backend logs with the request id |

## Authentication endpoints

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/auth/signup` | Create an account and start a session |
| `POST` | `/auth/login` | Verify credentials and start a session |
| `POST` | `/auth/logout` | Clear the session cookie |
| `GET` | `/auth/me` | Return the signed-in account |

The session is an HttpOnly cookie. Passwords are stored as Argon2id hashes.

## Planned endpoints

Added phase by phase; this list is the contract being built towards.

| Phase | Endpoints |
|---|---|
| 2 | `POST /auth/signup`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`, `PATCH /auth/profile`, `POST /auth/password` |
| 3 | `POST /projects`, `GET /projects`, `GET /projects/{id}`, `DELETE /projects/{id}`, `POST /projects/{id}/thumbnail`, `GET /media/{...}` (authorised streaming) |
| 4 | `GET /projects/{id}/transcript`, `POST /projects/{id}/transcribe` |
| 5 | `POST /projects/{id}/analyze`, `GET /projects/{id}/candidates` |
| 6 | `POST /projects/{id}/jobs`, `GET /jobs/{id}`, `WS /jobs/{id}/events` |
| 7 | `GET /clips/{id}`, `PATCH /clips/{id}`, `POST /clips/{id}/regenerate`, `GET /projects/{id}/download.zip` |
