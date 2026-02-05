# Story 1-4: Password Hash Utility API

**Epic**: EPIC-01 Core Infrastructure
**Status**: ready-for-dev

## 1. Story Narrative
**As a** Developer / Admin
**I want to** call an API with a password and get back its hash value
**So that** I can obtain a bcrypt hash for manual user setup, testing, or integration without running CLI scripts.

## 2. Acceptance Criteria
- [x] **Endpoint**: One API endpoint accepts a password (e.g. in request body) and returns the hash value in the response (same algorithm as login: bcrypt via passlib).
- [x] **Input**: Request body contains the plain-text password (e.g. `{"password": "xxx"}`). Validation: password field required, non-empty.
- [x] **Output**: Response body contains the hash string (e.g. `{"hash": "$2b$12$..."}`) so the caller can use it elsewhere (e.g. manual DB insert or other tools).
- [x] **Security**: Endpoint must be protected so only authorised callers can use it (e.g. require valid JWT and admin role, or other agreed mechanism). Do not expose as a public endpoint to avoid abuse (e.g. mass hash generation).
- [x] **Consistency**: Use the same hashing as login (`app.routers.auth.hash_password` / passlib bcrypt). No logging or storage of the plain password.
- [x] **Logging**: Subject to Story 1-2; log request/response outcome only, do not log the password or hash in full if possible.

## 3. Technical Requirements (Guide)
- **Framework**: FastAPI. Add to auth router or a small utility/admin router.
- **Hashing**: Reuse existing `hash_password` from `app.routers.auth` (passlib bcrypt); do not introduce a second algorithm.
- **Auth**: Require JWT + role check (e.g. admin only). Reuse existing AuthMiddleware and role from token.

### Architecture Compliance
- **Router**: `backend/app/routers/auth.py` (add route) or new `backend/app/routers/admin.py` / `backend/app/routers/util.py` if preferred.
- **No new services required**: Call existing `hash_password` in auth module.

### Development Notes
- Today hash is obtained via CLI: `poetry run python -c "from app.routers.auth import hash_password; print(hash_password('123456'))"`. This story replaces that workflow with an API while keeping the same hash output.
- Reference: [Source: docs/建立管理者帳號.md] — manual hash generation; [Source: backend/app/routers/auth.py] — hash_password.

### References
- [Source: backend/app/routers/auth.py] — hash_password, pwd_context.
- [Source: docs/建立管理者帳號.md] — 取得密碼的雜湊值.
