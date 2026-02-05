# EPIC-05: Analytics & Visualization

## 1. Description
Provides visual feedback on trading performance over time, specifically focusing on the PnL Calendar view which is a standard industry tool.

## 2. Requirements Traceability
| ID | Source | Description |
|---|---|---|
| REQ-SYS-008 | SRS 3.5.1 | PnL Calendar Data API |
| SDD-3.4 | SDD-FE | PnLCalendar Component Logic |

## 3. Scope & Deliverables

### 3.1 PnL Calendar
- [ ] **Month View Component**: A calendar grid (Sun-Sat).
- [ ] **Cell Rendering**:
    - Show Date.
    - Show Daily Net PnL.
    - **Color Coding**:
        - **Green**: PnL > 0
        - **Red**: PnL < 0
        - **Gray/Neutral**: PnL = 0 or No Trades.
- [ ] **Interactivity**:
    - Tooltip on hover: "3 Trades executed".
    - Click cell: Navigate to Journal filtered by that date (Nice to have).

### 3.2 Stats Aggregation (Optional/Phase 2)
- [ ] Win Rate Chart.
- [ ] PnL Curve.

## 4. Technical Notes
- Fetch data by Month (`year={YYYY}&month={MM}`).
- Handle empty days gracefully.
