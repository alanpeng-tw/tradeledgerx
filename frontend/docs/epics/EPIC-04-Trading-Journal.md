# EPIC-04: Trading Journal System

## 1. Description
The core feature for data entry. Allows traders to log their trades, tag them with strategies or mistakes, and upload evidence (screenshots/URLs).

## 2. Requirements Traceability
| ID | Source | Description |
|---|---|---|
| REQ-SYS-006 | SRS 3.4.1 | Create Trade API |
| REQ-SYS-007 | SRS 3.4.2 | List Trades API (Pagination/Filter) |
| AC-004-03 | SDD-FE 3.3 | Media Attachments (Preview/Remove) |
| REQ-NFR-001 | SDD-FE 3.3 | Form Performance (React.memo) |

## 3. Scope & Deliverables

### 3.1 Trade List (Journal View)
- [ ] **Data Grid**: Table showing trades (Symbol, Direction, Entry/Exit, PnL, Tags).
- [ ] **Pagination**: Server-side pagination.
- [ ] **Filters**: Date range, Symbol, Tags.

### 3.2 Trade Entry Form (Add/Edit)
- [ ] **Dialog/Modal**: `TradeFormDialog`.
- [ ] **Fields**:
    - Symbol (e.g., XAUUSD).
    - Direction (Long/Short).
    - Entry Price, Exit Price, SL, TP.
    - Date/Time.
- [ ] **Tag Selection**:
    - Multi-select component for Strategies and Mistakes.
    - Sources data from `GET /api/v1/tags`.
- [ ] **Media Attachments**:
    - Input field for image URLs (e.g., TradingView links).
    - Preview list of added images.

### 3.3 Logic & Validation
- [ ] Use `react-hook-form` for form state.
- [ ] Validate required fields (Price > 0, etc.).
- [ ] Auto-calculate R:R (Risk:Reward) if SL/TP provided (Frontend visual only).

## 4. Technical Notes
- Optimistic updates are recommended for determining if a trade was added successfully.
- Ensure `TagMultiSelect` handles large lists efficiently (virtualization if needed).
