# Installation (Windows-first)

Beginner-friendly, step by step. Every command is PowerShell unless stated otherwise.
Commands are run from the **repository root** (`ChauleClips\`) unless a `cd` says otherwise.

If a step fails, jump to [TROUBLESHOOTING.md](TROUBLESHOOTING.md) — most failures are a missing
PATH entry or a stopped MongoDB service.

---

## 0. What you will install

| Tool | Why | Approx. download |
|---|---|---|
| Python 3.12+ | runs the backend | 25 MB |
| Node.js 20 LTS+ | builds the frontend | 30 MB |
| FFmpeg (with FFprobe) | all video/audio processing | 120 MB |
| MongoDB Community Server | the database | 300 MB |
| MongoDB Compass | inspect data visually (optional but recommended) | 150 MB |
| VS Code | editor (optional) | — |

---

## 1. Python

```powershell
winget install Python.Python.3.12
```

Or download from <https://www.python.org/downloads/> and **tick "Add python.exe to PATH"** during
installation — this is the most commonly missed box.

Close and reopen PowerShell, then verify:

```powershell
python --version    # should print Python 3.12.x or newer
```

## 2. Node.js

```powershell
winget install OpenJS.NodeJS.LTS
```

Verify in a new PowerShell window:

```powershell
node --version      # v20.x or newer
npm --version
```

## 3. FFmpeg + FFprobe

```powershell
winget install Gyan.FFmpeg
```

FFprobe ships inside the same package. **Open a new PowerShell window** (PATH is captured when a
window starts) and verify:

```powershell
ffmpeg -version
ffprobe -version
```

If `winget` is unavailable, download a build from <https://www.gyan.dev/ffmpeg/builds/>, extract it
to `C:\ffmpeg`, add `C:\ffmpeg\bin` to *System properties → Environment Variables → Path*, and
reopen PowerShell.

## 4. MongoDB Community Server

1. Download **MongoDB Community Server (MSI)** from
   <https://www.mongodb.com/try/download/community> and run it.
2. Choose **Complete** setup.
3. Keep **"Install MongoDB as a Service"** checked (default). This is what makes the database start
   with Windows.
4. Optionally install **MongoDB Compass** when the installer offers it.

Verify — the service should be `Running`:

```powershell
Get-Service MongoDB
mongosh --eval "db.runCommand({ ping: 1 })"
```

Expected output includes `{ ok: 1 }`.

> If `mongosh` is not found but the service is running, the shell was not installed. Either install
> "MongoDB Shell" separately or use Compass to connect to `mongodb://127.0.0.1:27017`.

### Inspecting the database with Compass

1. Open Compass → **New Connection**.
2. URI: `mongodb://127.0.0.1:27017` → **Connect**.
3. Open the `chauleclips` database after the backend has started once.
4. Collections you should see: `users`, `projects`, `processing_jobs`, `transcripts`, `clips`,
   `ai_usage` — created automatically together with their indexes.

Compass is read-only for development: no application feature depends on it, and it is never exposed
to end users.

## 5. Backend dependencies

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements-dev.txt
```

If PowerShell blocks the activation script:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

Then re-run `.\.venv\Scripts\Activate.ps1`.

Media/AI packages (needed from Phase 4 onwards; large, ~1 GB with models):

```powershell
python -m pip install -r requirements-media.txt
```

`faster-whisper` downloads its model on first transcription (a few hundred MB for `base`), not at
install time.

## 6. Frontend dependencies

```powershell
cd ..\frontend
npm install
```

## 7. Environment files

From the repository root:

```powershell
python scripts\setup\bootstrap_env.py
```

This creates `backend\.env` with freshly generated secrets, `frontend\.env`, and the `storage\`
subfolders. It never overwrites an existing `.env`; add `--force` only when you intend to
regenerate (this invalidates existing sessions).

Manual alternative:

```powershell
Copy-Item backend\.env.example backend\.env
python -c "import secrets; print(secrets.token_urlsafe(48))"   # paste into SECRET_KEY
python -c "import secrets; print(secrets.token_urlsafe(48))"   # paste into JWT_SECRET_KEY
Copy-Item frontend\.env.example frontend\.env
```

## 8. OpenRouter API key (free)

1. Create an account at <https://openrouter.ai>.
2. Open <https://openrouter.ai/keys> → **Create Key**.
3. Copy it **once** (it is shown only once) into `backend\.env`:

```
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxx
OPENROUTER_MODEL=openrouter/free
```

Free-model availability, context size, latency and rate limits change over time and are outside
your control. The app handles a missing key, a rejected key and an exhausted quota with distinct,
readable errors, and the AI step is never a hard dependency for the rest of the pipeline.

**Never** put this key in `frontend\.env` — anything named `VITE_*` is compiled into the public
bundle.

## 9. Start MongoDB

Installed as a service, so normally nothing to do:

```powershell
Get-Service MongoDB          # Status should be Running
Start-Service MongoDB        # only if it is stopped
```

Running manually (alternative):

```powershell
mongod --dbpath C:\data\db
```

Create `C:\data\db` first if it does not exist.

## 10. Start the backend

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000
```

Expected lines:

```
INFO | app.main | Starting ChauleClips v0.1.0 (development)
INFO | app.database.mongo | Connected to MongoDB database 'chauleclips'.
INFO | app.database.indexes | MongoDB indexes ready (14 newly created).
INFO | app.main | API ready on http://127.0.0.1:8000/api/v1
```

Check <http://127.0.0.1:8000/api/v1/health> in a browser.

If MongoDB is not running, startup stops with a message telling you exactly that — by design, so the
app never serves requests that are guaranteed to fail.

## 11. Start the frontend

New PowerShell window:

```powershell
cd frontend
npm run dev
```

Open <http://localhost:5173>. The **System status** panel should show FFmpeg, FFprobe and MongoDB
as ready, and OpenRouter as "Needs setup" until you add a key.

## 12. Or start both at once

```powershell
.\scripts\setup\dev.ps1
```

It checks MongoDB reachability first, then opens the backend and frontend in separate windows so
you can read both logs.

---

## Running the tests

```powershell
# backend
cd backend
.\.venv\Scripts\python.exe -m pytest

# frontend
cd ..\frontend
npm run test
npm run typecheck
npm run build
```

Expected today: backend 14 passed, frontend 6 passed, typecheck clean, build succeeds.

## Verifying the whole stack in one glance

Open <http://localhost:5173/#status>. Every row is a real check:

| Row | Ready means |
|---|---|
| FFmpeg / FFprobe | binaries found and executable |
| MongoDB | connected, with server version and database name |
| Media storage | folder writable, free space ≥ 5 GB |
| OpenRouter AI | a key is configured (the key itself is never displayed) |

---

## macOS / Linux notes

```bash
# FFmpeg
brew install ffmpeg            # macOS
sudo apt install ffmpeg        # Debian/Ubuntu

# MongoDB on macOS (Homebrew tap)
brew tap mongodb/brew && brew install mongodb-community
brew services start mongodb-community

# MongoDB on Debian/Ubuntu: use the official instructions for your release at
# https://www.mongodb.com/docs/manual/administration/install-on-linux/
# (there is no reliable distro package on Debian 13; the .tgz tarball works:
#   curl -O https://fastdl.mongodb.org/linux/mongodb-linux-x86_64-debian12-8.0.15.tgz
#   tar -xzf mongodb-linux-x86_64-debian12-8.0.15.tgz
#   ./mongodb-*/bin/mongod --dbpath ~/.local/mongodata --bind_ip 127.0.0.1 )

bash scripts/setup/setup.sh
bash scripts/setup/dev.sh
```

---

## Uninstalling / starting over

```powershell
# Remove generated state (keeps your source code)
Remove-Item -Recurse -Force backend\.venv, frontend\node_modules
Remove-Item backend\.env, frontend\.env
Remove-Item -Recurse -Force storage\uploads\*, storage\generated_clips\*, storage\temporary\*

# Wipe the development database (refuses without --force on non-dev names)
backend\.venv\Scripts\python.exe scripts\database\reset_dev_db.py --force
```

Then repeat step 5 onward.
