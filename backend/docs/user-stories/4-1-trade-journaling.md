# Story 4-1: Trade Journaling (Entry & Log)

**Epic**: EPIC-04 Journaling System
**Status**: ready-for-dev

## 1. Story Narrative
**As a** Trader
**I want to** record a trade with price, R:R parameters, strategy tags, and mistake tags
**So that** I can review my performance and execution details.

## 2. Acceptance Criteria
- [ ] **Data Entry**: Capture `symbol`, `direction`, `entry_price`, `sl`, `tp`, `entry_date`, `images` (URLs).
- [ ] **Tagging**: Support associating multiple Strategy tags and Mistake tags (via IDs).
- [ ] **Auto-Calc**:
    - Calculate `planned_rr` (Risk:Reward) automatically if SL/TP provided.
    - If `exit_price` is provided, calculate `realized_pnl` and set status to `CLOSED`.
- [ ] **Validation**: Ensure referenced Tag IDs exist.
- [ ] **Listing**: `GET /api/v1/trades` returns trades filtered by `account_id` (context).

## 3. Technical Requirements (Guide)
- **Data Model**: `Trade` document in `trades` collection.
- **API**: `POST /api/v1/trades`, `GET /api/v1/trades`.
- **Side Effects**: Invalidating Analytics Cache on successful write.

### Architecture Compliance
- **Service**: `TradeService.create_trade`.
- **Model**: `class Trade(Document)` (See SDD 4.2).
- **Indexing**: Compound index on `(account_id, entry_date)` for query performance.

### Development Notes
- Refer to **SDD-BACKEND Section 3.3**.
- Ensure strict Pydantic validation for numerical fields.
- Handle `X-Account-ID` from header to assign the trade to the correct account.
