# EPIC-04: Journaling System (Trades)

## 1. Description
The core feature for data entry. This Epic handles the recording of trades, allowing users to log their activity, link it to specific accounts, and tag it with strategies/mistakes. It also handles automatic calculations like R:R (Risk:Reward).

## 2. In-Scope User Stories
- **US-004**: Trade Journaling.
  - "As a Trader, I want to add a trade record with price, tags, etc..."

## 3. Requirements Analysis (Traceability)
- **PRD**: US-004, AC-004-01, AC-004-02, AC-004-03, REQ-SYS-006.
- **SRS**:
  - REQ-SYS-006: Create Trade API.
  - REQ-SYS-007: Get Trade List API.
- **SDD**:
  - 3.3: Journaling Module.
  - 4.2: Collection `trades`.
  - 4.4: Indexing Strategy.

## 4. Technical Tasks
### 4.1 Data Modeling
- [ ] Create `Trade` model with references to `Account` and `Tag`.
- [ ] Define fields: `symbol`, `direction`, `entry_date`, `entry_price`, `sl`, `tp`, `exit_date`, `exit_price`, `status`, `images`.
- [ ] Create Database Indexes (Compound Key: `account_id` + `entry_date`).

### 4.2 Business Logic (Service Layer)
- [ ] Implement `create_trade` logic:
  - Calculate `planned_rr` if SL/TP provided.
  - Determine `status` (OPEN/CLOSED) based on `exit_price`.
  - Calculate `realized_pnl` if closed.
- [ ] Implement **Cache Invalidation**: Clear Redis analytics keys on new trade entry.

### 4.3 API Implementation
- [ ] Implement `POST /api/v1/trades` with Pydantic validation.
- [ ] Implement `GET /api/v1/trades` with pagination and filtering (by date, symbol, tags).

## 5. Acceptance Criteria
- User can log a trade with all required fields.
- Tags are properly linked (validated against Tag collection).
- R:R is auto-calculated correctly.
- New trades appear immediately in the trade list.
