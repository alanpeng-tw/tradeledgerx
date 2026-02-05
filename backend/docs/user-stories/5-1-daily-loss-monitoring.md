# Story 5-1: Daily Loss Monitoring & Alerting

**Epic**: EPIC-05 Risk Management
**Status**: ready-for-dev

## 1. Story Narrative
**As a** Trader
**I want to** see my daily realized loss percentage vs. account balance
**So that** I can prevent account blowout or violating Prop Firm rules.

## 2. Acceptance Criteria
- [ ] **Aggregation**: Calculate Sum of `realized_pnl` for all `CLOSED` trades in user's TODAY (Server Time UTC 00:00-23:59).
- [ ] **Filtering**: Only count LOSSES (negative PnL). Do not offset with profits (Conservative calculation).
- [ ] **Calculation**: `loss_percent = abs(daily_loss_sum) / initial_balance`.
- [ ] **Status Logic**:
    - < 60%: `SAFE`
    - >= 60%: `WARNING` (Yellow)
    - >= 80%: `DANGER` (Red)
- [ ] **Performance**: Response time < 200ms using optimized DB indexes.

## 3. Technical Requirements (Guide)
- **API**: `GET /api/v1/risk/daily-status`.
- **Database**: MongoDB Aggregation Pipeline.

### Architecture Compliance
- **Service**: `RiskService.calculate_daily_status`.
- **Indexing**: Essential to have index on `(account_id, status, exit_date)` (See SDD 4.4 / 3.2).

### Development Notes
- Refer to **SDD-BACKEND Section 3.2**.
- Be careful with Timezones. Store dates in UTC, query in UTC.
