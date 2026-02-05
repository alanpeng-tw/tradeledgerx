# EPIC-02: Portfolio Management

## 1. Description
This Epic focuses on managing user trading accounts. It involves defining the Account data model and providing APIs for the frontend to list and switch between accounts. This module is the source of truth for `account_id` which defines the scope of all other operations.

## 2. In-Scope User Stories
- **US-001 (Story 2-1)**: Multi-account switching and management.
  - "As a Trader, I want to clearly switch between 'Challenge' and 'Live' accounts..."
- **Story 2-2**: Account CRUD and status/notes.
  - Create, read (list + single), update, delete trading accounts via API; support `status` (e.g. ACTIVE, FAILED, CLOSED) and `notes` (e.g. 爆倉) so users can mark failed exams and manage multiple accounts.

## 3. Requirements Analysis (Traceability)
- **PRD**: US-001, AC-001-01.
- **SRS**:
  - REQ-SYS-001: Get Account List API.
  - REQ-SYS-003: X-Account-ID usage (Server-side validation part).
- **SDD**:
  - 3.1: Portfolio Management Module.
  - 4.1: Collection `accounts`.

## 4. Technical Tasks
### 4.1 Data Modeling
- [ ] Create `Account` Beanie model with fields: `user_id`, `name`, `broker`, `type`, `balance`, `currency`.
- [ ] Add validators for `broker` types (FTMO, BingX, etc.).

### 4.2 API Implementation
- [ ] Implement `GET /api/v1/accounts` endpoint (list).
- [ ] Implement `GET /api/v1/accounts/{account_id}` (single), `POST /api/v1/accounts` (create), `PATCH /api/v1/accounts/{account_id}` (update), `DELETE /api/v1/accounts/{account_id}` (delete).
- [ ] Implement logic to filter/scope all operations by `current_user.id`.

### 4.3 Validation
- [ ] Ensure `broker` field only accepts allowed Enum values.

## 5. Acceptance Criteria
- User can retrieve a list of their own accounts via API.
- Accounts contain correct metadata (Type: Challenge/Live).
- Trying to access another user's account returns 403/404.
