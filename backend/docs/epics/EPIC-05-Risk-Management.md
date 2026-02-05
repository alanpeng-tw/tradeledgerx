# EPIC-05: Risk Management

## 1. Description
This Epic implements the safety mechanisms of the platform. It computes the daily performance of an account and determines if the user is approaching or has breached their daily loss limits.

## 2. In-Scope User Stories
- **US-002**: Daily Loss Monitoring & Alerting.
  - "As a Trader, I want to see my realized daily loss percentage..."

## 3. Requirements Analysis (Traceability)
- **PRD**: US-002, AC-002-01, AC-002-02.
- **SRS**:
  - REQ-SYS-004: Daily Loss Status API.
- **SDD**:
  - 3.2: Risk Management Module.
  - 4.4: Indexing for Risk Query.

## 4. Technical Tasks
### 4.1 Aggregation Logic
- [ ] Implement MongoDB Aggregation Pipeline to sum `realized_pnl` for the current day (UTC 00:00 - 23:59).
- [ ] Filter only `status='CLOSED'` and `realized_pnl < 0`.

### 4.2 Computation & logic
- [ ] Calculate `loss_percentage = total_loss / initial_balance`.
- [ ] Implement thresholds:
  - Warning: >= 60%
  - Danger: >= 80%

### 4.3 API Implementation
- [ ] Implement `GET /api/v1/risk/daily-status`.
- [ ] Ensure API response time meets NFR (<200ms) by using optimized indexes.

## 5. Acceptance Criteria
- API correctly identifies "today's" trades based on server time.
- Correct status (SAFE/WARNING/DANGER) is returned based on data.
- Calculation considers *only* realized losses (not floating).
