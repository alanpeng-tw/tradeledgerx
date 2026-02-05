# Story 2-1: Multi-Account Management

**Epic**: EPIC-02 Portfolio Management
**Status**: ready-for-dev

## 1. Story Narrative
**As a** Trader (User)
**I want to** clearly switch between 'Challenge' (Exam) and 'Live' (Real) accounts
**So that** I can track performance independently for different contexts.

## 2. Acceptance Criteria
- [ ] **Account List**: `GET /api/v1/accounts` returns all accounts for the current user.
- [ ] **Metadata**: Each account object includes `name`, `broker` (e.g., FTMO, BingX), `type` (CHALLENGE/LIVE), `balance`, and `currency`.
- [ ] **Security**: Users cannot access accounts belonging to others.
- [ ] **Broker Validation**: `broker` field must be one of the allowed values (Enum).

## 3. Technical Requirements (Guide)
- **Data Model**: `Account` document in `accounts` collection.
- **API**: `GET /api/v1/accounts`.
- **Validation**:
    - `broker` must be validated against an Enum.
    - `user_id` must match `current_user.id` from JWT.

### Architecture Compliance
- **Service**: `AccountService.get_user_accounts(user_id)`.
- **Model**: `class Account(Document)` (See SDD 4.1).
- **Router**: `PortfolioRouter`.

### Development Notes
- Refer to **SDD-BACKEND Section 3.1** for implementation details.
- This is the source of truth for `account_id` used in `X-Account-ID` header.
