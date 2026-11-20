# Database

MongoDB Community Server, database name **`chauleclips`**, bound to `127.0.0.1:27017` locally.

## How this folder is used

| Path | Purpose |
|---|---|
| `docs/ARCHITECTURE.md` (§6) | collection shapes, field meanings, index table |
| `backend/app/database/indexes.py` | **single source of truth** for indexes — applied at startup |
| `scripts/database/reset_dev_db.py` | drop the development database (guarded) |
| `indexes/`, `seed/` | reserved for Compass-compatible exports and sample data used by tests |

Indexes are created by the application, not by hand. That way a fresh install always matches the
code, and you never have to remember a Compass step. Use Compass to *verify*, not to define.

## Connect with Compass

1. New Connection → `mongodb://127.0.0.1:27017` → Connect.
2. Database `chauleclips` appears after the backend has started once.
3. Collections: `users`, `projects`, `processing_jobs`, `transcripts`, `clips`, `ai_usage`.
4. Per-collection **Indexes** tab should match:

| Collection | Indexes |
|---|---|
| users | `_id`, `uniq_email` (unique), `created_at_desc` |
| projects | `_id`, `user_created`, `user_status` |
| processing_jobs | `_id`, `user_created`, `project`, `status_updated` |
| transcripts | `_id`, `uniq_project` (unique), `user` |
| clips | `_id`, `project_created`, `user_created`, `job` |
| ai_usage | `_id`, `user_created`, `model_status` |

## Guarantees the schema provides

- **No media in the database.** Only paths and metadata. Video files live in `storage/`.
- **One account per email.** Enforced by a unique index, not only by an application check, so two
  simultaneous signups cannot both succeed.
- **One transcript per project.** Re-running analysis reuses it instead of re-transcribing.
- **Ownership is queryable.** Every private document carries `user_id`, and every private query
  filters on it.

## Local-only safety

- Bind address is `127.0.0.1`; never open MongoDB to the internet for development.
- If you enable database authentication, use `mongodb://user:pass@127.0.0.1:27017/?authSource=admin`
  in `backend/.env` — never in source code.
- Development credentials belong in `.env` only (git-ignored).

## Reset

```powershell
backend\.venv\Scripts\python.exe scripts\database\reset_dev_db.py --yes
```

Then restart the backend to recreate collections and indexes. The script refuses to drop a database
whose name lacks a `dev`/`test`/`local` marker unless `--force` is passed.
