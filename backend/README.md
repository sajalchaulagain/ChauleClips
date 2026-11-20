# Backend (FastAPI)

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000
```

- API root: <http://127.0.0.1:8000>
- Docs: <http://127.0.0.1:8000/docs>
- Liveness: `GET /api/v1/health`
- Environment report: `GET /api/v1/system/status`

## Where things live

```
app/
├── main.py                  app factory, lifespan (logging → config guard → MongoDB), middleware
├── core/
│   ├── config.py            all settings in one typed place + startup warnings/guards
│   ├── logging.py           consistent log format
│   └── errors.py            AppError hierarchy + handlers = one error envelope
├── database/
│   ├── mongo.py             client lifetime, ping, dependency
│   └── indexes.py           index definitions, applied at startup
├── api/
│   ├── router.py            aggregates route modules under /api/v1
│   └── routes/              health.py, system.py (auth.py, projects.py … in later phases)
├── schemas/                 Pydantic response/request models
├── models/                  document shapes (Phase 2+)
├── repositories/            ALL MongoDB queries (Phase 2+)
├── services/                business logic; ai/ transcription/ video/ captions/ audio/ later
├── workers/                 background jobs (Phase 6)
├── middleware/              request id + security headers
└── utils/                   small helpers
```

## Conventions

- Routes do input/output only; they never touch MongoDB.
- Repositories own queries and always receive `user_id` for private data.
- Raise `AppError` subclasses for expected failures; unexpected ones become `INTERNAL_ERROR`.
- Every new setting goes in `core/config.py` **and** `.env.example` with a comment.
- No `print()`; use `logging.getLogger(__name__)`.

## Tests

```powershell
.\.venv\Scripts\python.exe -m pytest          # unit tests (no MongoDB required)
.\.venv\Scripts\python.exe -m pytest -q -k config
```

Tests use `httpx.ASGITransport` without the lifespan, so they run without a database. Anything that
needs MongoDB is marked `integration` and documented as such.
