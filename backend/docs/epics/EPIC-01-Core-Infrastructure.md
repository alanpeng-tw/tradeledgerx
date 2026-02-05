# EPIC-01: Core Infrastructure & Authentication

## 1. Description
This Epic covers the foundational setup of the backend service, including project structure initialization, database connections (MongoDB/Redis), authentication/authorization middleware (JWT), and containerization. It establishes the "skeleton" of the application upon which other modules will be built.

## 2. In-Scope User Stories & Requirements
While not directly mapping to user-facing stories in the PRD, these are prerequisites for all functional requirements.
- **SRS 2.2**: Authentication mechanism (JWT, Bearer Token).
- **SRS 5.3**: Reliability & Graceful Shutdown.
- **SDD 2.1**: Clean Architecture Setup (Routers, Services, Models).
- **SDD 2.2**: Middleware Implementation (AuthMiddleware, AccountContextMiddleware).
- **SDD 7**: Deployment Configuration (Dockerfile, Environment Variables).

## 3. Technical Tasks
### 3.1 Project Setup
- [ ] Initialize Python FastAPI project structure.
- [ ] Configure `pyproject.toml` (dependencies: fastapi, uvicorn, beanie, pydantic, pyjwt, redis).
- [ ] Set up Environment Variable management (`.env` loading).

### 3.2 Database Connectivity
- [ ] Implement MongoDB connection with Beanie ODM initialization.
- [ ] Implement Redis connection pool.
- [ ] Create `deploy.sh` and `docker-compose.yml` for local development (Mongo + Redis + Backend).

### 3.3 Authentication & Security
- [ ] Implement `AuthMiddleware` to validate JWT.
- [ ] Implement `AccountContextMiddleware` to parse `X-Account-ID`.
- [ ] Configure CORS middleware (whitelisting frontend domain).
- [ ] Implement Global Exception Handler (Standard Error Response format).

## 4. Acceptance Criteria
- Service starts successfully via `docker-compose up`.
- Health check endpoint returns 200 OK with DB status.
- Protected endpoints reject requests without valid Bearer Token (401).
- Requests with `X-Account-ID` correctly inject the ID into the request context.
