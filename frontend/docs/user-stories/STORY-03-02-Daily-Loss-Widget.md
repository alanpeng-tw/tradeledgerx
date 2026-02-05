# STORY-03-02: Daily Loss Widget UI

## 1. Description
The primary display component for risk status. It shows the raw numbers (Amount and Percentage) to the trader.

## 2. Goals
- Clear, readable display of PnL metrics.
- Visual distinction based on risk severity.

## 3. Acceptance Criteria
- [ ] **Component (`DailyLossWidget`)**:
    - **Input**: Data from `useDailyRisk` hook.
    - **Layout**: Card or Box.
    - **Content**:
        - Label: "Daily Loss".
        - Value: Currency formatted (e.g., "$ -1,250.00").
        - Percentage: (e.g., "2.5%").
- [ ] **Styling**:
    - If `status` is SAFE: Standard/Neutral color.
    - If `status` is WARNING: Yellow/Orange text or border.
    - If `status` is DANGER: Red bold text.
- [ ] **Loading State**:
    - Display a Skeleton (gray bar) while fetching.

## 4. Technical Notes
- Use `Intl.NumberFormat` for currency display.
- Ensure negative signs are handled correctly (Backend returns positive "loss amount", so display logic might need to add sign or label clearly).
