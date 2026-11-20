# ChauleClips — Implementation Plan

**Developer:** Sajal Chaulagain · [sajalchaulagain.com.np](https://sajalchaulagain.com.np)
**Tagline:** Find the moment. Create the story.
**Status:** Phase 1 complete and verified. Phases 2–8 planned below.

This document is the working plan for the project: what gets built, in what order, how each
phase is verified, and why the main technical decisions were made. It is kept in the
repository so the plan and the code never drift apart.

---

## 1. Environment inspection (done before writing any code)

The project was developed and verified on this exact machine before Phase 1 started:

| Component | Found | Action taken |
|---|---|---|
| OS | Debian 13 (trixie), Linux x86_64 | Development baseline. Windows commands are documented in `INSTALLATION.md` since Windows is your primary environment. |
| Python | 3.13.18 | Supported (target range 3.11–3.13). Project targets "3.12 or compatible stable". |
| Node / npm | 20.20.2 / 10.8.2 | Meets Vite 8 requirement (Node 20.19+). |
| FFmpeg / FFprobe | **missing** | Installed via apt: **7.1.5**. Detected at runtime by the status endpoint. |
| MongoDB | **missing** (no `mongod`, no `mongosh`, Debian has no server package) | Installed MongoDB Community **8.0.15** and started on `127.0.0.1:27017`. |
| MongoDB Compass | not installed (GUI, optional) | Documented in `INSTALLATION.md`; the app does not need it to run. |
| Docker | missing | Not required. Nothing in the project depends on Docker. |
| pip packages | numpy, opencv, pillow, pydantic, argon2, httpx present | Ignored: the project uses its own virtualenv to keep versions reproducible. |
| Workspace | empty, no existing ChauleClips files | Initialised cleanly, nothing was overwritten. |
| Disk | ~21 GB free | Enough for real video work; the status endpoint warns below 5 GB. |

Two consequences you should know about:

1. **MongoDB must be installable on your machine.** It is free, but on Windows it needs the
   official installer (documented step by step). There is no apt package for it on Debian 13,
   which is why the tarball route is documented as well.
2. **FFmpeg is not optional.** Upload validation, thumbnails, transcription audio, rendering
   and verification all call `ffmpeg`/`ffprobe`. The status endpoint reports it as an *error*
   when missing, not a warning, because nothing meaningful works without it.

---

## 2. Technology decisions and the reasons

These are the choices a beginner most often asks about.

### 2.1 PyMongo async instead of Motor
The original stack listed "Motor or the official MongoDB Python driver". Motor is deprecated by
MongoDB, and the official driver now ships an async API (`pymongo.AsyncMongoClient`). Using the
official driver means: one dependency instead of two, the same query API as the synchronous
driver you will see in every tutorial, and a maintained path. Verified with `pymongo==4.20.1`.

### 2.2 Tailwind CSS v4 (CSS-first config)
There is no `tailwind.config.js` any more. Design tokens are declared in
`frontend/src/styles/index.css` with `@theme`, and every token instantly becomes a utility
(`bg-brand-600`, `text-ink-500`, `rounded-card`). One file controls the whole visual language —
easier to keep consistent than scattering hex codes across components.

### 2.3 No external font or icon CDN
The UI uses the system font stack and inline SVG icons (Lucide components). This keeps the app
identical offline, avoids a third-party request on every page load, and makes it render
correctly inside sandboxed previews that have no network access.

### 2.4 HttpOnly cookie sessions, not tokens in `localStorage`
Planned for Phase 2. A JWT in `localStorage` is readable by any injected script, so one XSS bug
becomes full account takeover. Cookies marked `HttpOnly` + `SameSite=Lax` + `Secure` (in
production) are not readable from JavaScript. CSRF is handled with a double-submit token on
state-changing requests.

### 2.5 One error shape for the whole API
Every failure returns `{"error": {"code", "message", "details", "request_id"}}`. The frontend can
display `message` and branch on `code` without parsing prose. `request_id` is echoed in the
`X-Request-ID` header and appears in the backend log line, so a user-reported bug is one grep
away.

### 2.6 Relative `/api` URL + Vite proxy
In development the browser calls `http://localhost:5173/api/v1/...`; Vite proxies that to
FastAPI on `:8000`. Consequences: no CORS friction, no hardcoded backend URL in frontend code,
and the same relative paths keep working behind a reverse proxy in production.

### 2.7 Honest placeholders
Routes that are not built yet (`/login`, `/signup`, `/dashboard`) render a page that states
which phase delivers them and what will be inside. No fake form, no fake numbers, no button
that silently does nothing.

---

## 3. Phase plan

Each phase ends with: implementation → verification (tests + manual check) → a short report of
files touched, how to test it, and what still needs configuration.

### Phase 1 — Foundation ✅ complete
**Delivered**
- Repository structure (`frontend/`, `backend/`, `database/`, `storage/`, `docs/`, `scripts/`).
- Backend: typed settings (`pydantic-settings`), logging, error contract, request-id + security
  headers middleware, MongoDB lifetime management with automatic index creation, CORS.
- API: `GET /api/v1/health`, `GET /api/v1/system/status`, `GET /`.
- Frontend: React 19 + TypeScript + Vite 8 + Tailwind v4, design system (colors, typography,
  radii, shadows, Button/Card/Badge/Alert/Spinner/StatusPill), public layout, landing page,
  live environment panel, honest placeholders, 404 page.
- Tooling: `bootstrap_env.py` (secret generation), `setup.ps1` / `setup.sh`, `dev.ps1` /
  `dev.sh`, `reset_dev_db.py`, `cleanup_storage.py`.
- Docs: this plan, README, architecture, installation, API, security.

**Verification performed**
- `pytest` → 14 tests pass (health, error shape, security headers, config guards, status shape,
  no secret leakage).
- `npm run typecheck` → clean; `npm run build` → 356 kB JS / 23 kB CSS; `npm run test` → 6 tests pass.
- Live run: browser → Vite (:5173) → proxy → FastAPI (:8000) → MongoDB (:27017) worked; the
  status panel showed real values (FFmpeg 7.1.5, MongoDB 8.0.15, storage free space,
  OpenRouter "needs setup"). No console errors; desktop and 390 px mobile layouts checked.
- Indexes verified in MongoDB: `users.uniq_email` (unique), project/job/status/created_at indexes.

**Still needs configuration:** an OpenRouter API key (optional until Phase 5).

### Phase 2 — Authentication & dashboard (next)
**Scope:** `users` repository, `User` model, Argon2id hashing, signup/login/logout, HttpOnly
cookie session + CSRF token, rate limiting on auth endpoints, `get_current_user` dependency,
ownership-scoped queries, protected routes in React, login/signup/profile/settings pages,
dashboard with real per-user counts and an empty state.

**Acceptance checks:** register → record in `users` with an Argon2 hash and no plaintext;
duplicate email rejected (409); wrong password rejected (401) and rate-limited after N attempts;
`/api/v1/auth/me` returns the session user; a second user cannot read the first user's projects;
expired/absent cookie redirects to `/login`; logout clears the cookie; tests cover all of it.

### Phase 3 — Media management
**Scope:** upload endpoint with streaming size limits, extension + real container/codec
validation via FFprobe, duration limits, random stored filenames, thumbnail generation, project
and job documents, storage abstraction (`StorageService`) so a future object store can drop in.

**Acceptance checks:** valid MP4 accepted and stored under a random name; `.exe` renamed to
`.mp4` rejected; oversized upload rejected mid-stream, not after writing 2 GB; corrupted file
produces a readable error; thumbnail exists and is served through an authorised route; a second
user's project files are unreachable by ID guessing.

### Phase 4 — Transcription
**Scope:** audio extraction (16 kHz mono WAV), faster-whisper CPU transcription with segment and
word timestamps, language detection, transcript caching per project, transcript viewer UI.

**Acceptance checks:** a 60–90 s test clip produces segments with monotonic timestamps inside
the video duration; re-running analysis reuses the cached transcript (no second transcription);
unsupported language reports clearly; transcript is only visible to its owner.

### Phase 5 — AI intelligence
**Scope:** OpenRouter client (single place, key from backend env), configurable model +
fallbacks, JSON-schema-constrained responses validated with Pydantic, one repair attempt for
malformed JSON, exponential backoff with jitter for 429/5xx, per-request usage logging in
`ai_usage`, response caching, chunking for long transcripts, versioned prompt templates per
content type, local ranking engine (overlap removal, duration fit, sentence boundaries, topic
diversity).

**Acceptance checks:** with a key, one analysis call returns three validated candidates; with no
key the API returns a clear `AI_NOT_CONFIGURED`; with a forced 429 the client backs off and then
reports quota exhaustion without looping; invalid JSON is repaired once and rejected if still
invalid; overlapping candidates are de-duplicated; tests use mocked AI responses only (zero
quota burned).

### Phase 6 — Video generation
**Scope:** FFmpeg render service with safe argv lists (never shell strings), aspect-ratio
transform (crop / pad / blurred background), optional face-tracking crop via OpenCV, caption
burn-in from word timestamps with the seven presets, audio options (normalise, fades, ducking
for music), per-job temp directories, output verification with FFprobe, background worker with
real stage progress over WebSocket (polling fallback).

**Acceptance checks:** rendered clip length matches the requested window (±100 ms), audio stays
in sync, captions match the spoken words at the right times, each aspect ratio produces correct
dimensions, the output plays in a browser, a killed job is marked interrupted and its temp
files are cleaned up.

### Phase 7 — Editor & history
**Scope:** clip editor (trim, caption style/position/size, framing, audio, re-export), per-clip
and ZIP download, delete clip/project with file cleanup, retry failed jobs, project history with
filters, settings page.

**Acceptance checks:** re-export with a different caption preset produces a new file and keeps
the old one until replaced; deleting a project removes only that project's media; ZIP contains
exactly the selected clips; another user's clip cannot be edited or downloaded.

### Phase 8 — Tests, security & documentation
**Scope:** full backend suite (auth, isolation, uploads, pipeline with mocked AI, renderer),
frontend component tests, one authorised small-video end-to-end test, security review
(SECURITY.md updated with residual risks), dependency review, performance pass on a 10-minute
video, README polish, manual end-to-end procedure with a real OpenRouter key.

---

## 4. Known constraints to design around

1. **Free AI models are volatile.** Availability, context size, latency and rate limits change
   without notice. The design assumes fallbacks and a clear "quota exhausted" path; AI is never
   a hard dependency for viewing transcripts or editing locally.
2. **CPU transcription is slow.** `base` on CPU is roughly real-time-ish for short videos;
   a 2-hour podcast will take a long time. That is why transcription is cached per project and
   runs in a worker, never inside a request.
3. **YouTube URLs are metadata + preview only.** No downloader is implemented, because a link is
   not permission. Users must upload a file they are allowed to edit. `yt-dlp` is deliberately
   *not* a dependency.
4. **Free hosting cannot process video.** The API and the video worker are separate processes
   from day one so a later deployment can put the worker on its own machine.
5. **Storage grows quickly.** Render outputs plus source uploads are large; the cleanup script
   and retention settings ship with Phase 3/7.

---

## 5. What "done" means

The project is complete when every acceptance criterion in the master specification runs
locally: register → log in → upload an authorised video → inspect → transcribe → analyse →
rank → configure → render → preview → download → history, with real progress, real error
messages, secrets only on the backend, and one user unable to touch another user's data.

Nothing in this repository will claim a feature works before that check has actually been run.
