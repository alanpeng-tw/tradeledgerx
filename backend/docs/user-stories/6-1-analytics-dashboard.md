# Story 6-1: Analytics Dashboard (PnL Calendar)

**Epic**: EPIC-06 Analytics Dashboard
**Status**: ready-for-dev

## 1. Story Narrative
**As a** Trader
**I want to** view a calendar showing daily profit/loss
**So that** I can identify consistency and performance trends.

## 2. Acceptance Criteria
- [ ] **Aggregation**: Group trades by `exit_date` (YYYY-MM-DD).
- [ ] **Metrics**: For each day, provide `total_pnl`, `trade_count`, `win_count`, `loss_count`.
- [ ] **Caching**:
    - First request hits DB and caches result in Redis (TTL 5 min).
    - Subsequent requests hit Redis.
    - Cache Key: `analytics:calendar:{account_id}:{month}`.
- [ ] **Invalidation**: Cache is cleared when a new trade is added/updated (See Story 4-1).

## 3. Technical Requirements (Guide)
- **API**: `GET /api/v1/analytics/calendar`.
- **Cache**: Redis.

### Architecture Compliance
- **Service**: `AnalyticsService.get_calendar_data`.
- **Middlewares**: Ensure Account Context is used for the key.

### Development Notes
- Refer to **SDD-BACKEND Section 3.5**.
- Visualize the data structure needed for the frontend calendar component (e.g., list of day objects).
