# ChauleClips

**Find the moment. Create the story.**

ChauleClips is a free-first, local-first AI clipping workspace for long-form video. Give it a
video you own or have permission to edit, and it finds the strongest standalone moments,
transcribes them locally, has a free AI model score the candidates, then renders finished
short-form clips with captions using FFmpeg.

No paid APIs. No paid transcription. No cloud storage. Your video never leaves your machine —
only transcript text is sent to the AI provider.

Developed by **[Sajal Chaulagain](https://sajalchaulagain.com.np)**.

---

## Status — read this first

The project is built in phases, and each phase is verified before the next one starts. Here is
the honest state of the repository today:

| Phase | What it delivers | State |
|---|---|---|
| 1 | Foundation: structure, FastAPI + MongoDB, landing page, live environment report | **Complete and verified** |
| 1.5 | Premium dark UI: design system, application shell, redesigned landing/auth/settings | **Complete and verified** |
| 2 | Authentication (Argon2 + HttpOnly cookies) & dashboard | Authentication implemented; dashboard planned |
| 3 | Authorised uploads, FFprobe validation, thumbnails, storage management | Planned |
| 4 | Local faster-whisper transcription with timestamped segments | Planned |
| 5 | OpenRouter analysis, prompt library, local ranking engine | Planned |
| 6 | FFmpeg rendering: aspect ratio, framing, captions, audio | Planned |
| 7 | Clip editor, re-export, history, ZIP download | Planned |
| 8 | Full test suite, security review, performance tuning | Planned |

The dashboard and backend phases 3 through 8 are not implemented yet, so the product screens that depend on them
(dashboard data, uploads, processing, clip results, editor) render an explicit "scheduled for Phase
N" state inside the real app shell. There are no fake forms, no invented statistics and no dead
controls anywhere in this repository. Signup and sign-in create real MongoDB accounts and HttpOnly
sessions; video processing features remain scheduled for later phases.

What you can do right now: run the API, run the web app, walk the full shell, and see a live report
of your FFmpeg, MongoDB, storage and AI configuration.

### Interface

- **Dark, editor-first design system** — semantic tokens (`bg-canvas`, `surface`, `raised`, `line`,
  `accent`) declared once in `frontend/src/styles/index.css`.
- **Inter Variable**, bundled locally (no CDN request), so the app renders identically offline.
- **22 UI primitives** — buttons, inputs, selects, segmented controls, switches, sliders, tabs,
  panels, badges, progress, skeletons, empty states, tooltips, toasts, menus, avatars, alerts.
- **Application shell** — collapsible sidebar, breadcrumbs, live API indicator, mobile drawer.
- 12 / 13 / 14 / 16 / 20 / 26 / 34 / 44 px type scale; 10 / 14 / 18 px radii; one soft shadow ramp.
- Motion is 150–220 ms, transform/opacity only, and fully disabled under
  `prefers-reduced-motion`.

---

## Features (design targets for the finished pipeline)

- **Three genuinely good clips, not three random timestamps** — candidates are scored on hook
  strength, standalone context, clarity, ending quality and audience interest, then re-ranked
  locally to remove overlaps and repetition.
- **Local transcription** with faster-whisper on CPU; timestamps kept per segment and per word,
  cached per project so changing caption styles never re-transcribes.
- **Free AI models via OpenRouter**, with configurable model IDs, fallbacks, exponential backoff,
  response caching and usage tracking. A missing key disables only the AI step.
- **Real output controls**: 1–5 (or custom) clips, 15 s–3 min durations with min/max limits,
  9:16 / 16:9 / 1:1, 720p/1080p, seven caption presets, smart framing, audio normalisation and
  fades.
- **Authorised sources only**: file upload for content you may edit, plus YouTube URL metadata
  and preview with a clear explanation of what cannot be processed.
- **Real progress**: every stage is a backend stage — inspect, extract audio, transcribe,
  analyse, rank, render, thumbnail, verify.

---

## Technology stack

| Layer | Choice |
|---|---|
| Frontend | React 19, TypeScript 5.9, Vite 8, Tailwind CSS 4, React Router 7, Axios, Lucide, React Hook Form + Zod, Zustand |
| Backend | Python 3.13 (3.12+), FastAPI 0.165, Pydantic 2, pydantic-settings, PyMongo async driver |
| Security | Argon2id (`argon2-cffi`), PyJWT, HttpOnly cookies, rate limiting |
| Database | MongoDB Community 8 (local), MongoDB Compass for inspection |
| AI | OpenRouter free models (structured JSON output) |
| Media | FFmpeg 7 / FFprobe, faster-whisper, OpenCV, NumPy, PySceneDetect, Pillow |

Full rationale for each choice is in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md), and the
phase-by-phase plan is in [`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md).

---

## Prerequisites

| Tool | Version | Check |
|---|---|---|
| Python | 3.12+ (3.13 verified) | `python --version` |
| Node.js | 20.19+ (Vite 8 requirement) | `node --version` |
| FFmpeg + FFprobe | 6+ (7.1 verified) | `ffmpeg -version` |
| MongoDB Community Server | 7+ (8.0 verified) | `mongosh --version` |
| MongoDB Compass | any (optional, GUI) | — |

You also need a free [OpenRouter](https://openrouter.ai/keys) key for the AI step. Without it the
app runs, and the AI check reports "needs setup" instead of pretending.

---

## Quick start (Windows PowerShell)

These are the short version. The beginner-friendly version with install commands, screenshots of
what to expect, and troubleshooting is in **[`docs/INSTALLATION.md`](docs/INSTALLATION.md)**.

```powershell
# 1. Install the tools (once)
winget install Python.Python.3.12
winget install OpenJS.NodeJS.LTS
winget install Gyan.FFmpeg
#    MongoDB Community Server: https://www.mongodb.com/try/download/community
#    (choose "Complete" so mongosh and the service are installed)

# 2. Open a NEW PowerShell window so PATH updates apply, then:
cd path\to\ChauleClips
.\scripts\setup\setup.ps1          # venv, dependencies, .env with secure secrets

# 3. Add your free AI key (optional for now)
notepad backend\.env               # OPENROUTER_API_KEY=sk-or-v1-...

# 4. Start MongoDB (installed as a Windows service — usually already running)
Get-Service MongoDB

# 5. Start both apps
.\scripts\setup\dev.ps1
```

Open <http://localhost:5173>. The **System status** panel on the landing page tells you exactly
what is working.

**macOS / Linux:**

```bash
bash scripts/setup/setup.sh
# edit backend/.env, then:
bash scripts/setup/dev.sh
```

---

## Running the two apps manually

Backend (terminal 1):

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000
```

Frontend (terminal 2):

```powershell
cd frontend
npm run dev
```

| URL | What it is |
|---|---|
| <http://localhost:5173> | Web app (Vite proxies `/api` to the backend) |
| <http://127.0.0.1:8000/docs> | Interactive API documentation |
| <http://127.0.0.1:8000/api/v1/health> | Liveness probe |
| <http://127.0.0.1:8000/api/v1/system/status> | Full environment report |

---

## Environment configuration

Two files, both created from templates, both ignored by git:

- `backend/.env` — from `backend/.env.example`. Holds secrets, database URL, AI key, limits.
- `frontend/.env` — from `frontend/.env.example`. Only non-secret values; every `VITE_*`
  variable is public in the browser bundle.

`scripts/setup/bootstrap_env.py` generates cryptographically secure `SECRET_KEY` and
`JWT_SECRET_KEY` values for you and never overwrites an existing `.env`.

Required to start: `MONGODB_URL`, `DATABASE_NAME` (both have working local defaults).
Required for real security: `SECRET_KEY`, `JWT_SECRET_KEY` (generated by setup; production
refuses to boot with the placeholders).
Required for AI: `OPENROUTER_API_KEY`.
Required for media: FFmpeg on PATH (or `FFMPEG_BINARY` / `FFPROBE_BINARY`).

Never commit `.env`. Never put an API key in a `VITE_*` variable.

---

## Tests

```powershell
# Backend (14 tests)
cd backend
.\.venv\Scripts\python.exe -m pytest

# Frontend (15 tests + typecheck + production build)
cd frontend
npm run test
npm run typecheck
npm run build
```

Current state: backend 14 passed, frontend 15 passed, typecheck clean, production build succeeds.
Routes are code-split, so the landing page does not download the auth forms or settings panels.

---

## Project layout

```
ChauleClips/
├── frontend/                 React + TypeScript app
│   └── src/
│       ├── components/
│       │   ├── ui/           design system primitives (22 components)
│       │   ├── layout/       app shell (sidebar, topbar), public header/footer, brand
│       │   ├── auth/         split auth layout, password input
│       │   ├── app/          page header, honest pending-screen state
│       │   └── environment/  live system-status panel
│       ├── pages/            landing, auth, app screens, 404
│       ├── hooks/            data-fetching hooks
│       ├── services/         axios client, API helpers, form validation schemas
│       ├── store/            Zustand stores (auth state arrives in Phase 2)
│       ├── styles/           Tailwind v4 design tokens + base styles
│       ├── types/            types mirroring backend schemas
│       └── utils/
├── backend/                  FastAPI app
│   └── app/
│       ├── api/routes/       HTTP endpoints, one module per resource
│       ├── core/             config, logging, errors
│       ├── database/         Mongo client, index definitions
│       ├── models/           document shapes
│       ├── schemas/          Pydantic request/response models
│       ├── repositories/     all MongoDB queries live here
│       ├── services/         business logic (ai, transcription, video, captions, audio)
│       ├── workers/          background job runners
│       ├── middleware/       request context, security headers
│       └── main.py
├── database/                 DB docs + reset script
├── storage/                  uploads, extracted_audio, temporary, generated_clips, thumbnails
├── docs/                     architecture, installation, API, security, AI pipeline, troubleshooting
└── scripts/                  setup, database, maintenance
```

The rule that shapes this structure: **routes never touch MongoDB directly.** A route validates
input and calls a service; the service calls a repository; the repository is the only code that
knows collection names. That is what makes ownership checks auditable in one place.

---

## Storage management

Media lives under `storage/` (configurable via `VIDEO_STORAGE_PATH`) and is **never** stored
inside MongoDB — only paths and metadata are.

```powershell
# See what would be deleted (dry run by default)
backend\.venv\Scripts\python.exe scripts\maintenance\cleanup_storage.py --older-than-days 14

# Actually delete
backend\.venv\Scripts\python.exe scripts\maintenance\cleanup_storage.py --older-than-days 14 --delete
```

Uploads and rendered clips are ignored by git, so a `git status` stays clean after a heavy
session.

---

## Security summary

Implemented now: generated secrets via env only, no secrets in source, CORS restricted to
configured origins, consistent non-leaky error responses, request ids, security headers,
production startup guard, MongoDB bound to localhost, automatic unique index on email.

Planned and tracked in [`docs/SECURITY.md`](docs/SECURITY.md): Argon2 hashing, HttpOnly cookie
sessions with CSRF protection, auth rate limiting, upload validation, safe FFmpeg invocation,
per-user ownership enforcement on every query.

No project is "completely secure". `SECURITY.md` lists residual risks instead of claiming
otherwise.

---

## Troubleshooting (most common)

| Symptom | Cause | Fix |
|---|---|---|
| Status panel says "Backend unreachable" | FastAPI not running | `cd backend; uvicorn app.main:app --reload` |
| MongoDB check fails | Service not started / wrong URL | `Get-Service MongoDB`, check `MONGODB_URL` |
| `ffmpeg` works in a terminal, not in the app | PATH changed after the terminal opened | Open a new terminal / restart the editor |
| AI check shows "needs setup" | No `OPENROUTER_API_KEY` | Add a free key to `backend/.env`, restart the backend |
| `422` on API calls | Validation error | Read `error.details` — it names the exact field |
| CORS error in the browser | Frontend on an origin not in `CORS_ORIGINS` | Add the origin to `backend/.env` |

More in [`docs/TROUBLESHOOTING.md`](docs/TROUBLESHOOTING.md).

---

## Documentation

- [UI audit & redesign plan](docs/UI_AUDIT.md) — what existed, what changed, how it was verified
- [Implementation plan](docs/IMPLEMENTATION_PLAN.md) — phases, decisions, acceptance checks
- [Architecture](docs/ARCHITECTURE.md) — request flow, layers, data model, indexes
- [Installation](docs/INSTALLATION.md) — Windows-first step-by-step setup
- [API reference](docs/API.md) — endpoints, error contract
- [Security](docs/SECURITY.md) — decisions, threats, residual risks
- [AI pipeline](docs/AI_PIPELINE.md) — transcription → analysis → ranking design
- [Troubleshooting](docs/TROUBLESHOOTING.md)

---

## Legal and ethical use

ChauleClips is for videos you own or have explicit permission to edit. It does not bypass YouTube
access controls, DRM or download restrictions, and it will not accept "I pasted a link" as proof
of permission. If a source cannot be processed through an authorised mechanism, the app asks you
to upload the permitted file instead.

Background music must be yours or licensed for your use. You are responsible for what you publish.

---

## License

MIT — see [LICENSE](LICENSE).

Developed by **Sajal Chaulagain** · <https://sajalchaulagain.com.np>
