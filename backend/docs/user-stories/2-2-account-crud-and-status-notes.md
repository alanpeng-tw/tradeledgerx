# Story 2-2: Account CRUD and Status/Notes

**Epic**: EPIC-02 Portfolio Management
**Status**: ready-for-dev

## 1. Story Narrative
**As a** Trader (User)
**I want to** create, read, update, and delete my trading accounts via API, and mark accounts as failed with a note (e.g. 爆倉)
**So that** I can manage multiple accounts (FTMO exam, BingX live, etc.), record when an exam account fails, and add new accounts when I buy another challenge or open a new live account.

## 2. Acceptance Criteria

### Create
- [x] **POST /api/v1/accounts**: Create a new trading account for the current user. Body: `name`, `broker`, `type` (CHALLENGE/LIVE), `balance`, optional `initial_balance`, `daily_loss_limit`, `currency`. `user_id` set from JWT. Returns 201 with created account.

### Read
- [x] **GET /api/v1/accounts**: (Already in 2-1) List all accounts for the current user.
- [x] **GET /api/v1/accounts/{account_id}**: Get a single account by ID. Return 404 if not found or not owned by current user.

### Update
- [x] **PATCH /api/v1/accounts/{account_id}**: Update an account. Allowed fields: `name`, `broker`, `type`, `balance`, `initial_balance`, `daily_loss_limit`, `currency`, **`status`**, **`notes`**. Only the owner can update. Return 404 if not found or not owned.
- [x] **Status & notes**: User can set `status` to e.g. ACTIVE / FAILED / CLOSED and `notes` to free text (e.g. "爆倉") so that a failed FTMO exam can be marked and other accounts (BingX live, another exam) continue to be used.

### Delete
- [x] **DELETE /api/v1/accounts/{account_id}**: Soft-delete or hard-delete an account. Only the owner can delete. Return 204 on success, 404 if not found or not owned.

### Security & validation
- [x] All endpoints require JWT; `user_id` is taken from token. Users cannot access or modify other users' accounts.
- [x] `broker` must be one of the allowed Enum values. `type` must be CHALLENGE or LIVE. `status` must be one of the allowed values (e.g. ACTIVE, FAILED, CLOSED).

## 3. Data Model (Account)

Ensure `Account` has:

- Existing: `name`, `broker`, `type`, `balance`, `initial_balance`, `daily_loss_limit`, `currency`, `user_id`.
- **status** (e.g. `AccountStatus` enum: ACTIVE, FAILED, CLOSED). Default: ACTIVE. Used to mark exam failed or account closed.
- **notes** (optional str). Free text for remarks (e.g. "爆倉", "通過 Phase 1").

## 4. Technical Requirements (Guide)
- **Router**: `backend/app/routers/portfolio.py` — add POST, GET by id, PATCH, DELETE.
- **Service**: `AccountService` — add `create_account`, `get_account_by_id`, `update_account`, `delete_account`; all must filter by `user_id`.
- **Model**: `Account` in `backend/app/models/account.py` — add `status` (enum, default ACTIVE), `notes` (optional str).

### Architecture Compliance
- **Routers**: `backend/app/routers/portfolio.py`
- **Service**: `backend/app/services/account_service.py`
- **Model**: `backend/app/models/account.py`

### Development Notes
- Story 2-1 covers list (GET /accounts); this story adds create, get-one, update, delete and the status/notes fields.
- When listing accounts (GET /accounts), consider whether to filter by status (e.g. only ACTIVE) or return all and let frontend show status/notes.
- References: SDD-BACKEND Section 3.1, EPIC-02.
