# Story 1-3: Test Database Connection Controller

**Epic**: EPIC-01 Core Infrastructure
**Status**: ready-for-dev

## 1. Story Narrative
**As a** Developer / DevOps
**I want to** call a dedicated API endpoint that explicitly tests database connectivity
**So that** I can verify MongoDB (and optionally Redis) from outside the service (e.g. scripts, monitoring, runbooks) without calling business endpoints.

## 2. Acceptance Criteria
- [x] **New endpoint**: A controller (router) exposes at least one endpoint whose sole purpose is to test database connectivity (e.g. `GET /api/v1/health/db` or `GET /api/v1/db/connectivity`).
- [x] **MongoDB check**: The endpoint performs a real connectivity check (e.g. `database.command("ping")` or Beanie/Motor equivalent) and returns:
  - **200** with a body indicating success (e.g. `{"status": "ok", "mongodb": "connected"}`).
  - **503** (or 500) with a body indicating failure when the database is unreachable (e.g. `{"status": "error", "mongodb": "disconnected", "detail": "..."}`).
- [x] **Optional Redis**: If the same endpoint or a related one can also test Redis connectivity (e.g. `ping`), return both MongoDB and Redis status in the response; otherwise only MongoDB is required.
- [x] **No auth required for this endpoint** (or document clearly if it is protected): typically health/connectivity endpoints are unauthenticated for use by load balancers and ops.
- [x] **Logging**: The endpoint is included in the controller logging story (1-2); each call is logged (success or failure).
- [x] **Idempotent & safe**: GET only; no side effects.

## 3. Technical Requirements (Guide)
- **Framework**: FastAPI. Add a small router (e.g. `health.py` or `db.py`) or extend existing health logic in `main.py`; if kept in `main.py`, still treat it as a “controller” for logging and consistency.
- **Database**: Use existing `app.core.db` Beanie/Motor client; reuse the same connection used by the app (no new connection pool for this endpoint).
- **Response format**: JSON; align with existing health response style (e.g. `main.py` `/health`) for consistency.

### Architecture Compliance
- **Routers**: Either `backend/app/routers/health.py` (new) or a dedicated `backend/app/routers/db.py`, or a clearly named section in `main.py` with the same logging standard as other controllers.
- **Core**: `backend/app/core/db.py` — use existing init/client; add or reuse a function that pings MongoDB (and optionally Redis from `app.core.redis`).

### Development Notes
- Distinguish from existing `GET /health`: that can remain the “general” health check; this endpoint is specifically for **database connectivity** so monitoring/scripts can target DB without parsing generic health.
- Consider rate-limiting or keeping the check cheap (single ping) to avoid abuse.
- Reference: EPIC-01 (DB connectivity), Story 1-1 (health check), Story 1-2 (logging).

### References
- [Source: backend/app/main.py] — existing `/health` and lifespan/init_db.
- [Source: backend/app/core/db.py] — Beanie init and client.
- [Source: backend/docs/epics/EPIC-01-Core-Infrastructure.md] — Database connectivity requirements.
