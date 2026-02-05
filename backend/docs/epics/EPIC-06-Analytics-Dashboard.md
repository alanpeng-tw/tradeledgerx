# EPIC-06: Analytics Dashboard

## 1. Description
This Epic handles the visualization data for the "Calendar" view, providing a high-level overview of trading performance over a specific month. It heavily relies on caching to ensure performance.

## 2. Requirements (Implicit / Functional)
- **REQ-SYS-008**: Profit/Loss Calendar Visualization.
- **PRD**: "Visualized calendar component."

## 3. Requirements Analysis (Traceability)
- **SRS**: REQ-SYS-008.
- **SDD**:
  - 3.5: Analytics Module.
  - 4.2: Cache Invalidation Strategy.

## 4. Technical Tasks
### 4.1 Data Aggregation
- [ ] Create aggregation query to group trades by `exit_date` (YYYY-MM-DD).
- [ ] Sum PnL and count trades per day.

### 4.2 Caching Strategy
- [ ] Implement Redis Caching logic in `AnalyticsService`.
  - Key format: `analytics:calendar:{account_id}:{month}`.
  - TTL: 5 minutes.
  - Logic: Read Cache -> If Miss, DB Query -> Write Cache.

### 4.3 API Implementation
- [ ] Implement `GET /api/v1/analytics/calendar?year=X&month=Y`.

## 5. Acceptance Criteria
- Returns correctly aggregated PnL per day for the requested month.
- First request triggers DB query; subsequent requests (within 5 min) hit CACHE.
- Cache is invalidated if a new trade is added (verified via integration test with Epic-04).
