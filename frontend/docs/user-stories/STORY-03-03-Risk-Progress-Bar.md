# STORY-03-03: Risk Progress Bar & Animations

## 1. Description
A visual progress bar that "fills up" as the trader approaches their daily loss limit. This provides a quick, at-a-glance understanding of risk exposure.

## 2. Goals
- Immediate visual feedback.
- Psychological warning via colors and animations.

## 3. Acceptance Criteria
- [ ] **Component (`RiskProgressBar`)**:
    - **Input**: `loss_percentage` (0 to 100+), `status`.
    - **Bar Logic**: Width = `min(percentage, 100)%`.
- [ ] **Color thresholds**:
    - < 60%: Green.
    - 60% - 79.9%: Yellow/Orange.
    - >= 80%: Red.
- [ ] **Animation (The "Blink")**:
    - **Condition**: Only when `status === 'DANGER'`.
    - **Effect**: The entire bar or a glow effect pulses opacity (CSS keyframes).
- [ ] **Tooltip** (Nice to have):
    - Hovering shows "Limit: 5% (Example)".

## 4. Technical Notes
- Use `MUI LinearProgress` with custom styled components (`sx` prop).
- CSS Animation: `@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }`.
