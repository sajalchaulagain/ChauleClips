# Troubleshooting

Every error message in ChauleClips is written to tell you what to do. This page covers the cases
that are not obvious from the message itself.

Start here: <http://localhost:5173/#status> (or `GET /api/v1/system/status`). It reports FFmpeg,
FFprobe, MongoDB, storage and the AI key in one place.

---

## Startup

### `Cannot reach MongoDB at the configured MONGODB_URL`

Startup deliberately fails here because every real endpoint needs the database.

```powershell
Get-Service MongoDB                 # Windows
Start-Service MongoDB
mongosh --eval "db.runCommand({ping:1})"
```

Common causes:
- Service stopped or set to Manual.
- `MONGODB_URL` points at the wrong port (default `mongodb://127.0.0.1:27017`).
- MongoDB installed but never started once, so the data directory does not exist.

On Linux, check `systemctl status mongod` or start the tarball manually:
`./bin/mongod --dbpath ~/.local/mongodata --bind_ip 127.0.0.1`.

### `Refusing to start in production with unsafe configuration`

Working as intended: `APP_ENV=production` requires real secrets and `DEBUG=false`.
Regenerate with `python scripts/setup/bootstrap_env.py --force`, or run locally with
`APP_ENV=development`.

### Port 8000 already in use

```powershell
Get-NetTCPConnection -LocalPort 8000 | Select-Object OwningProcess
Stop-Process -Id <OwningProcess>
```
Or run `uvicorn app.main:app --port 8001` and start Vite with
`$env:VITE_API_PROXY_TARGET="http://127.0.0.1:8001"; npm run dev`.

### Port 5173 already in use

Vite is configured with `strictPort: true`, so it fails instead of silently moving ports. Stop the
old dev server, or change `server.port` in `frontend/vite.config.ts`.

---

## FFmpeg / FFprobe

### Works in terminal, "not found" in the app

PATH was captured when the process started. Close and reopen PowerShell / restart the editor, then
restart uvicorn. The status endpoint re-runs detection on each call, so press **Re-check**.

### Point the app at a specific build

```
FFMPEG_BINARY=C:\ffmpeg\bin\ffmpeg.exe
FFPROBE_BINARY=C:\ffmpeg\bin\ffprobe.exe
```

### `Unknown encoder` / missing codecs

Some minimal Linux FFmpeg builds lack `libx264`. Install the full build
(`sudo apt install ffmpeg` on Debian gives 7.x with x264). Check with:

```bash
ffmpeg -encoders | findstr 264      # Windows
ffmpeg -encoders | grep 264         # macOS/Linux
```

---

## Frontend

### Status panel says "Backend unreachable"

The API is not running, or it is on a different port than the Vite proxy target
(default `http://127.0.0.1:8000`). Start the backend, then press **Re-check**.

### CORS error in the browser console

Only happens if you bypass the Vite proxy (for example by calling `http://127.0.0.1:8000` directly
from a page served on another origin). Add the origin to `CORS_ORIGINS` in `backend/.env` and
restart the backend.

### `npm install` fails / peer dependency complaints

Use Node 20.19+ (`node --version`). Delete `node_modules` and `package-lock.json`, then reinstall.
The project pins exact versions, so a clean install is reproducible.

### Tailwind classes have no effect

Tailwind v4 reads tokens from `src/styles/index.css` (`@theme`). Do not create a
`tailwind.config.js`; add tokens to that file instead.

### Blank page after a change

Check the browser console and the Vite terminal for a TypeScript error. `npm run typecheck` catches
it without opening a browser.

---

## Database

### Duplicate email error when no user exists

The unique index on `users.email` is doing its job — an existing record differs only by case.
Emails are normalised to lowercase before storage, so check `db.users.find({email: /you@example/i})`.

### Index creation failed at startup

Read the log line naming the collection. The usual cause is an existing index with the same name
but different options from an earlier experiment. Fix by dropping that one index in Compass, or
drop the dev database entirely:

```powershell
backend\.venv\Scripts\python.exe scripts\database\reset_dev_db.py --force --yes
```

### Reset the development database

```powershell
backend\.venv\Scripts\python.exe scripts\database\reset_dev_db.py --yes
```

Refuses to run on a database name without a `dev`/`test`/`local` marker unless `--force` is passed.

---

## AI (from Phase 5)

| Code | Meaning | What to do |
|---|---|---|
| `AI_NOT_CONFIGURED` | `OPENROUTER_API_KEY` is empty | Add a free key to `backend/.env`, restart |
| `AI_AUTH_FAILED` | key rejected (401) | Recreate the key at openrouter.ai/keys |
| `AI_QUOTA_EXHAUSTED` | free daily quota used up (429) | Wait for the reset, or switch `OPENROUTER_MODEL` / add a fallback |
| `AI_MODEL_UNAVAILABLE` | model retired or overloaded | Set another model ID; `openrouter/free` routes automatically |
| `AI_TIMEOUT` | provider too slow | Retry; long transcripts are chunked by design |
| `AI_INVALID_RESPONSE` | JSON failed validation twice | Retry once; if persistent, lower the transcript chunk size |

A missing key never blocks anything except the AI step: transcripts and manual editing keep working.

---

## Media processing (from Phase 3)

| Symptom | Cause | Fix |
|---|---|---|
| `Unsupported video` | container/codec outside the allowlist | Convert to MP4/H.264 (`ffmpeg -i in.mov -c:v libx264 -c:a aac out.mp4`) |
| `Corrupted media` | truncated or invalid file | Re-download/re-export the source |
| `Video is longer than MAX_VIDEO_DURATION_MINUTES` | limit reached | Trim the source or raise the limit |
| `Insufficient disk space` | storage full | Run `scripts/maintenance/cleanup_storage.py`, free space (needs ~3× source size while rendering) |
| Render is very slow | CPU-only encoding | Lower resolution/duration, or enable hardware encoding later |
| Clip audio out of sync | source has variable frame rate | Remux with `-vsync cfr` before uploading |

---

## Getting help effectively

Include:
1. the request id (`X-Request-ID` header or the `request_id` in the error body),
2. the matching backend log lines,
3. the output of `GET /api/v1/system/status`,
4. your OS, Python, Node and FFmpeg versions.

That set answers most questions without a back-and-forth.
