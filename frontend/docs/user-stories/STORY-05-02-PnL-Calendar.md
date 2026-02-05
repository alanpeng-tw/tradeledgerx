# STORY-05-02: PnL Calendar Component

## 1. Description
The centerpiece of the Analytics page. A monthly calendar view that visualizes daily performance.

## 2. Goals
- Provide a "Bird's-eye view" of trading consistency.
- Quick navigation to specific trading days.

## 3. Acceptance Criteria
- [ ] **UI Component (`PnLCalendar`)**:
    - **Header**: Shows "January 2026" with Prev/Next Month buttons.
    - **Grid**: 7 columns (Sun-Sat), 4-6 rows.
- [ ] **Day Cell Rendering**:
    - Top-right: Date number.
    - Center: PnL Amount (if any).
    - **Color**:
        - Green Background (light) if PnL > 0.
        - Red Background (light) if PnL < 0.
        - Gray/White if no trades.
- [ ] **Interaction**:
    - **Tooltip**: Hover date to show "X trades".
    - **Click**: Navigate to Journal (`/journal?date=YYYY-MM-DD`).

## 4. Technical Notes
- Can use a library like `react-calendar` and customize tile content, or build a simple CSS Grid 7x6 layout (recommended for full control).
- Responsive: Cells might need to shrink or simplify on mobile.
