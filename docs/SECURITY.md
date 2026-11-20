# Security

This document states what is implemented, what is planned, and what risks remain. It is
deliberately not a claim that the application is secure — it is a map you can check.

## 1. Secrets

- No key, password or connection string is hardcoded anywhere. `backend/app/core/config.py`
  reads them from the environment; `.env.example` files contain placeholders only.
- `scripts/setup/bootstrap_env.py` generates `SECRET_KEY` and `JWT_SECRET_KEY` with
  `secrets.token_urlsafe(48)` (~288 bits) and never overwrites an existing `.env`.
- `.gitignore` excludes `.env`, `.env.*` (with `!.env.example`), `*.pem`, `*.key`, `secrets/`.
- Startup validation: `assert_production_ready()` refuses to boot with `APP_ENV=production` if a
  secret is still `CHANGE_ME`, shorter than 32 characters, or if `DEBUG=true`.
- `GET /system/status` reports whether a key is configured, never the key itself (covered by a
  test that plants a fake key and asserts it is absent from the response).

## 2. Implemented controls

| Area | Control |
|---|---|
| Transport of errors | Consistent envelope; internal tracebacks logged server-side only |
| Headers | `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer` |
| CORS | Explicit origin allowlist from `CORS_ORIGINS` + the configured frontend URL; credentials allowed only for those origins |
| Traceability | Per-request id in logs and responses (`X-Request-ID`) |
| Database | Bound to `127.0.0.1` in local setup; unique index on `users.email` prevents duplicate accounts under race |
| Config hygiene | Unknown env vars ignored; invalid `MONGODB_URL` scheme rejected at startup |
| Logging | Security-relevant events logged without secrets or request bodies |

## 3. Planned controls (by phase)

**Phase 2 — authentication**
- Argon2id hashing via `argon2-cffi` with the library's recommended parameters; passwords never
  logged, never stored, never returned.
- Session tokens in `HttpOnly`, `SameSite=Lax` cookies (`Secure` in production), with short access
  lifetime and rotating refresh; **no tokens in `localStorage`**.
- CSRF defence: double-submit token on all state-changing requests.
- Rate limiting on signup/login/password endpoints (per IP + per email), with a constant-time
  failure path so response timing does not reveal whether an email exists.
- Generic error messages on login ("email or password is incorrect") to prevent account
  enumeration; the same applies to signup responses.

**Phase 3 — files**
- Random server-side filenames; the client filename is stored as metadata only.
- Extension allowlist *and* real container/codec validation with FFprobe (an `.exe` renamed to
  `.mp4` is rejected).
- Size limit enforced while streaming, before the whole body is written.
- Path traversal: stored paths are built from generated names; downloads resolve inside
  `storage/` and are refused if the resolved path escapes it.
- Ownership check before any file is streamed.

**Phase 6 — subprocesses**
- FFmpeg called with explicit argv lists (never `shell=True`, never string concatenation with
  user input), fixed binaries, per-job timeouts, temporary directories per job.
- Timestamps and numeric options are parsed and range-checked before they reach FFmpeg.

**Phases 3–7 — authorisation**
- Every private query includes `user_id` in the filter.
- IDOR tests: user B requesting user A's project/clip/job/file must get 404/403, never data.

## 4. Known limitations and residual risks

1. **Local-first threat model.** Intended for `127.0.0.1`. Exposing it to a network without TLS,
   a reverse proxy and a hardened MongoDB is not supported.
2. **Single application instance.** Rate limiting will be in-process by default; behind multiple
   workers it must move to a shared store (Redis or MongoDB TTL collection) to stay effective.
3. **Free AI provider.** Transcript text leaves the machine when AI analysis runs. Do not analyse
   confidential content with a provider you do not trust. Video and audio never leave the machine.
4. **Whisper model downloads** come from Hugging Face on first use; pin and verify if that matters.
5. **No email verification by default**, so a user can register with an address they do not own.
   This is a deliberate local-development trade-off and must be revisited before public deployment.
6. **Upload files are user content.** Phase 8 adds content-type hardening and a maximum pixel
   dimension check to reduce decompression-bomb style abuse.
7. **Dependencies age.** Run `pip list --outdated` / `npm outdated` before deploying and re-run the
   test suite after upgrades.
8. **No penetration test has been performed.** The checks above are design-level and unit-level.

## 5. Reporting a problem

If you find a security issue while reviewing this project, document it with: affected route,
reproduction steps, observed vs expected behaviour, and the `request_id` from the response. Then
add a regression test **before** fixing it, so the fix stays fixed.
