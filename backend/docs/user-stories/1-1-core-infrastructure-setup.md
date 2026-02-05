# Story 1-1: Core Infrastructure Setup

**Epic**: EPIC-01 Core Infrastructure
**Status**: ready-for-dev

## 1. Story Narrative
**As a** Developer
**I want to** initialize the backend project structure with FastAPI, MongoDB, and Authentication
**So that** we have a secure and scalable foundation for building business features.

## 2. Acceptance Criteria
- [ ] **Project Structure**: Standard Clean Architecture folders (routers, services, models) created.
- [ ] **Dependencies**: `pyproject.toml` configured with FastAPI, Beanie, Pydantic, PyJWT, Redis.
- [ ] **Database Connectivity**:
    - Service connects to MongoDB via Beanie.
    - Service connects to Redis.
    - Health check endpoint (`GET /health`) returns 200 OK with DB status.
- [ ] **Authentication**:
    - `AuthMiddleware` correctly validates JWT Bearer tokens.
    - `AccountContextMiddleware` extracts `X-Account-ID` from headers.
    - 401 Unauthorized returned for invalid tokens.
- [ ] **Containerization**: `Dockerfile` and `docker-compose.yml` allow starting the stack locally.

## 3. Technical Requirements (Guide)
- **Framework**: FastAPI (Python 3.11+).
- **ODM**: Beanie (Async MongoDB ODM).
- **Auth**: PyJWT for token validation.
- **Config**: Use `pydantic-settings` to load `.env`.

### Architecture Compliance
- **Routers**: `backend/app/routers/`
- **Services**: `backend/app/services/`
- **Models**: `backend/app/models/`
- **Middleware**: `backend/app/middleware/`

### Development Notes
- Use `uvicorn` for the server.
- Ensure `deploy.sh` script is created for easy startup.
- Follow the `SDD-BACKEND` Section 2 (Architecture) and Section 5 (Error Handling).
