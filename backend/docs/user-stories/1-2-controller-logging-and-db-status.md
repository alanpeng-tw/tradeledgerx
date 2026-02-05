# Story 1-2: Controller Logging and Database Connection Status

**Epic**: EPIC-01 Core Infrastructure
**Status**: ready-for-dev

## 1. Story Narrative
**As a** Developer / DevOps
**I want to** have consistent logging on every controller (router) entry point and visibility into database connectivity
**So that** we can trace API usage, debug issues, and monitor DB health from logs.

## 2. Acceptance Criteria
- [x] **Router logging**: Every endpoint in every router logs at least:
  - Request entry (method + path, optional: account_id or user context where available).
  - Response outcome (success / error with status code or exception).
- [x] **Database connection status in logs**: Where a request touches the database (directly or via service), log whether the DB connection is available (e.g. at request start or before first DB call), or log connection failure when detected.
- [x] **Coverage**: All existing routers are updated: `auth`, `portfolio` (accounts), `tags`, `trades`, `risk`, `analytics`. Any new router added in the future must follow the same logging convention.
- [x] **Log format**: Use a single project logging standard (e.g. Python `logging` with a common format: timestamp, level, module, message). No sensitive data (passwords, tokens) in logs.
- [x] **Health check**: Existing `/health` or equivalent continues to reflect DB/Redis status; logging does not change its contract.

## 3. Technical Requirements (Guide)
- **Framework**: FastAPI (existing). Use dependency injection or middleware if it reduces duplication (e.g. a logging middleware or a shared dependency that logs request/response).
- **Logging**: Python standard `logging`; consider structured logging (JSON) if already in use elsewhere. Logger name per module (e.g. `app.routers.trades`).
- **DB status**: Use existing Beanie/Motor client or a small helper that checks connectivity (e.g. `database.command("ping")` or equivalent) and log result; do not block request on verbose checks unless required.

### Architecture Compliance
- **Routers**: `backend/app/routers/` — all of: `auth.py`, `portfolio.py`, `tags.py`, `trades.py`, `risk.py`, `analytics.py`.
- **Core**: `backend/app/core/db.py` — may add a small `check_db_connected()` or similar for reuse in logging/middleware.
- **Middleware**: Optional: `backend/app/middleware/` for request/response logging to avoid repeating in every route.

### Development Notes
- Prefer one consistent pattern: either per-route logging or a middleware that logs all controller invocations; document the choice in code or README.
- Ensure log level is configurable (e.g. INFO in production, DEBUG in dev); avoid logging large payloads at INFO.
- Reference: SDD-SYSTEM (error response format, request_id for trace) and backend SDD for architecture.

### References
- [Source: docs/sdd-system.md] — API contract, error format, logging trace (NFR-007).
- [Source: backend/docs/sdd-backend.md] — Routers and architecture.
