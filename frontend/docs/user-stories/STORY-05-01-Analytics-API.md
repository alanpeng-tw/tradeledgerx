# STORY-05-01: Analytics API Integration

## 1. Description
Implement the data fetching layer for the Analytics module, specifically targeting the calendar aggregated data.

## 2. Goals
- Retrieve monthly performance data.
- Handle data caching to prevent unnecessary re-fetches.

## 3. Acceptance Criteria
- [ ] **API Client**:
    - `getPnLCalendar(year, month)` function.
    - Endpoint: `GET /api/v1/analytics/calendar`.
    - Params: `year` (int), `month` (int).
- [ ] **React Query**:
    - Hook: `usePnLCalendar(date)`.
    - Key: `['analytics', 'calendar', activeAccountId, year, month]`.
    - **Stale Time**: 5 minutes (as per SRS).
- [ ] **Data Model (Response)**:
    - Array of objects: `{ date, pnl, trade_count }`.

## 4. Technical Notes
- Ensure the query updates automatically when the user changes the "viewing month".
- Handle empty arrays (no trades in that month) gracefully.
