# EPIC-03: Risk Management Dashboard

## 1. Description
The "Head-up Display" for the trader. Ideally, this is the default home page. It provides immediate feedback on the current trading session's risk status to prevent emotional trading (Tilting).

## 2. Requirements Traceability
| ID | Source | Description |
|---|---|---|
| REQ-SYS-004 | SRS 3.2.1 | Get Daily Loss Status API |
| NFR-001 | SRS 5.1 | Performance (< 200ms) |
| SDD-3.2 | SDD-FE | Risk Widgets & Progress Bar Logic |

## 3. Scope & Deliverables

### 3.1 UI Components
- [ ] **Daily Loss Widget**:
    - Display Current Daily Loss (Amount & Percentage).
    - Display Max Daily Loss Limit (Configurable or static).
- [ ] **Risk Progress Bar**:
    - Visual bar filling up as loss increases.
    - **Green**: Safe (< 60%).
    - **Yellow**: Warning (60% - 79%).
    - **Red**: Danger (>= 80%).
    - **Animation**: Danger state should have a pulsing/blinking effect.

### 3.2 Business Logic
- [ ] Fetch data from `GET /api/v1/risk/daily-status`.
- [ ] Auto-refresh logic (optional, or rely on manual refresh/socket).
- [ ] Handle `X-Account-ID` dependancy (Dashboard must reload when account switches).

## 4. Technical Notes
- Use `React Query` for data fetching.
- Ensure the progress bar calculation logic matches the backend's formula: `(loss / initial_balance) * 100`.
