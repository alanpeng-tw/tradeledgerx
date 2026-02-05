# STORY-05-03: Performance Charts (Phase 2)

## 1. Description
High-level statistical visualizations to complement the calendar view. This story is marked for **Phase 2** but defined here for architectural awareness.

## 2. Goals
- Visualize Win Rate and Equity Growth.

## 3. Acceptance Criteria
- [ ] **Win Rate Chart**:
    - Doughnut Chart.
    - Segments: Wins (Green), Losses (Red), Break-even (Gray).
    - Center text: "55% Win Rate".
- [ ] **Cumulative PnL Curve**:
    - Line Chart.
    - X-Axis: Trade Count or Date.
    - Y-Axis: Balance/PnL.
    - Helper line at 0.

## 4. Technical Notes
- Recommended Library: `recharts` or `chart.js`.
- This story requires a new API endpoint (`GET /api/v1/analytics/stats`) which might not be fully defined in SRS v1.0.0 yet, so treat as tentative.
