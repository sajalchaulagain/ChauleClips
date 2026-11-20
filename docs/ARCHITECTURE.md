# Architecture

This document explains how a request travels through ChauleClips, why the code is split the way
it is, and what is stored in MongoDB.

## 1. High-level shape

```
Browser (React SPA :5173)
   │  relative URLs: /api/v1/...
   ▼
Vite dev server  ──(proxy /api)──►  FastAPI (:8000)
                                        │
                        ┌───────────────┼────────────────┐
                        ▼               ▼                ▼
                  MongoDB :27017   storage/ (files)   FFmpeg / FFprobe
                                                       faster-whisper (Phase 4)
                                                       OpenRouter (Phase 5)
```

Two processes today, three later:

1. **API** (`backend/`) — stateless HTTP layer.
2. **Worker** (`backend/app/workers/`, Phase 6) — long video jobs. Separate from the API from the
   start, because free hosting cannot process video and the worker must be able to move to its
   own machine without rewriting the app.
3. **Frontend** (`frontend/`) — static build, deployable to any static host.

## 2. Backend layering

```
api/routes/*.py      HTTP only: parse input, call a service, shape the response
      │
services/*.py        business logic: validation, orchestration, external calls
      │
repositories/*.py    the ONLY place that touches MongoDB collections/queries
      │
database/            client lifetime + indexes
```

Rules that keep this honest:

- A route never imports `motor`/`pymongo` collections directly.
- A repository never raises HTTP exceptions; it returns data or a domain error.
- A service never reads `request` objects; it takes plain arguments.
- Ownership is enforced in the repository query (`{"_id": ..., "user_id": current_user.id}`),
  not as an `if` after fetching. Fetch-then-check is how IDOR bugs happen.

### Why the dependency-injected database handle
`get_database_from_request(request)` returns the handle stored on `app.state` during startup.
Tests can therefore pass a fake database without patching module globals, and there is exactly
one client per process instead of one per request.

## 3. Frontend structure

```
pages/            one file per route, composition only
  app/            workspace screens (rendered inside AppShell)
  auth/           login, signup, forgot-password (rendered inside AuthLayout)
components/
  ui/             22 design-system primitives — the only place raw colours appear
  layout/         AppShell, Sidebar, Topbar, Brand, PublicHeader, SiteFooter, navigation.ts
  auth/           AuthLayout (split screen), PasswordInput
  app/            PageHeader, PendingScreen (honest "Phase N" state)
  environment/    SystemStatusPanel (live API data)
hooks/            data fetching (useSystemStatus, later useProjects)
services/         axios instance + typed API functions + Zod form schemas
store/            Zustand stores for cross-page client state (auth user from Phase 2)
types/            types mirroring backend schemas
styles/           Tailwind v4 design tokens (index.css) + base styles
```

### 3.1 Design system

Tokens are declared once in `src/styles/index.css` with Tailwind v4's `@theme`:

| Group | Tokens |
|---|---|
| Surfaces | `canvas` · `rail` · `surface` · `raised` · `inlay` · `line` · `line-strong` |
| Text | `fg` · `fg-muted` · `fg-subtle` |
| Accents | `accent` · `accent-strong` · `accent-soft` · `info` · `success` · `warning` · `danger` |
| Shape | `radius-control` 10px · `radius-card` 14px · `radius-panel` 18px |
| Depth | `shadow-card` · `shadow-panel` · `shadow-pop` |

Rules that keep it consistent:

- Components use semantic tokens (`bg-surface`, `text-fg-muted`), never raw hex values.
- Two gradients exist in the whole app: the hero glow and the primary button surface.
- Every primitive implements hover, focus-visible, active, disabled, loading and invalid states.
- Motion is 150–220 ms on transform/opacity and is disabled by `prefers-reduced-motion`.
- Icons are Lucide components; brand marks are inline SVG (no icon font, no image request).
- Inter Variable ships in the bundle (`@fontsource-variable/inter`), so there is no CDN request.

### 3.2 Shell separation

`PublicLayout` (marketing), `AuthLayout` (split form/brand) and `AppShell` (sidebar + topbar) are
three different shells on purpose. The app shell is already the production experience: navigation,
breadcrumbs, the live API state pill and the persisted sidebar-collapse preference all work today,
so pending screens only need their content filled in.

A component never calls `axios` directly. It calls a function in `services/`, which is why the
error contract (`ApiError` with `code`/`message`/`request_id`) is applied in one place.

## 4. Request flow example — `GET /api/v1/system/status`

1. `RequestContextMiddleware` assigns a request id, times the call, adds security headers.
2. `api/routes/system.py` calls `collect_system_status(settings)`.
3. `services/system_service.py` runs the checks: FFmpeg/FFprobe via fixed argv subprocess calls
   (no shell), MongoDB via `ping`, storage writability + free space, AI key presence.
4. The result is validated against `schemas/system.py` and returned.
5. Errors anywhere become the standard error envelope; a traceback is logged, never returned.

## 5. Error contract

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Some of the submitted values are invalid.",
    "details": [{ "field": "email", "reason": "value is not a valid email address" }],
    "request_id": "0f3c9a1b7d2e4c58"
  }
}
```

`code` is stable and machine-readable; `message` is safe to show a user; `details` is
optional and typed per error; `request_id` matches the backend log line for that request.

## 6. Data model (MongoDB `chauleclips`)

Collections and their purpose:

| Collection | Holds |
|---|---|
| `users` | account record; `email` unique (always stored lowercased) |
| `projects` | one entry per source video: source type, reference, metadata, status |
| `processing_jobs` | one entry per pipeline run: stage, progress, options, error |
| `transcripts` | cached transcript + timestamped segments, unique per project |
| `clips` | rendered clip metadata, scores, selection reason, file paths, caption/audio settings |
| `ai_usage` | one record per AI request: model, status, tokens, timing |

Media files are **never** stored as BSON. Only relative paths are stored, and files are served
through authorised routes that check ownership before streaming.

### Indexes (created automatically at startup, `backend/app/database/indexes.py`)

| Collection | Index | Why |
|---|---|---|
| users | `uniq_email` (unique) | prevents duplicate accounts even under a race |
| users | `created_at` desc | admin-ish listings |
| projects | `user_id + created_at` desc | dashboard "recent projects" |
| projects | `user_id + status` | "processing" / "failed" tabs |
| processing_jobs | `user_id + created_at` desc | job history |
| processing_jobs | `project_id` | job lookup per project |
| processing_jobs | `status + updated_at` desc | worker recovery of interrupted jobs |
| transcripts | `uniq_project` (unique) | one cached transcript per project |
| clips | `project_id + created_at` | results page ordering |
| clips | `user_id + created_at` desc | "quick access to previous clips" |
| ai_usage | `user_id + created_at` desc | quota reporting per user |
| ai_usage | `model + request_status` | health of model choices |

## 7. Storage layout

```
storage/
├── uploads/           original user files (random names, never the client's filename)
├── extracted_audio/   16 kHz mono WAV used for transcription
├── temporary/         per-job scratch directories (deleted on success and on failure)
├── generated_clips/   rendered MP4s
└── thumbnails/        JPEG posters for projects and clips
```

`VIDEO_STORAGE_PATH` makes the root configurable, so a future deployment can point it at a mounted
volume or swap in an object-store implementation behind the same `StorageService` interface.

## 8. Processing stages

```
uploading → inspecting → extracting_audio → transcribing → analysing
          → selecting → rendering → thumbnailing → verifying → completed
```

Progress is derived from completed stages (and, inside transcription, from segment count), never
from a timer. That is why the percentage in the UI can be trusted.

## 9. Deployment path (future)

| Piece | Where it can go | Constraint |
|---|---|---|
| Frontend | Netlify / any static host | needs `VITE_API_BASE_URL` pointing at the API |
| API | Render and similar | must not run video jobs on a free instance |
| Database | MongoDB Atlas | same indexes; set `MONGODB_URL` + network access |
| Worker | dedicated machine / GPU box | shares the DB, needs the same `storage/` volume |
| Storage | object storage | implement behind `StorageService`; keep paths relative |

Nothing in the code assumes `localhost`: hosts, ports, origins and storage roots all come from
environment variables.
