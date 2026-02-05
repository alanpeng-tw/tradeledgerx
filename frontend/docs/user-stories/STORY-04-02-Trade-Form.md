# STORY-04-02: Trade Entry & Editing Form

## 1. Description
The input mechanism for logging trades. This form must be intuitive and handle data validation robustly. It serves both "Create New" and "Edit Existing" use cases.

## 2. Goals
- Allow users to input trade details accurately.
- Provide real-time feedback (e.g., R:R calculation).

## 3. Acceptance Criteria
- [ ] **UI Component (`TradeFormDialog`)**:
    - Modal/Dialog layout.
    - **Fields**:
        - Symbol (Text or Autocomplete).
        - Direction (Radio/Select: Long/Short).
        - Dates (Open/Close time).
        - Prices (Entry, Exit, SL, TP).
        - Commission/Swap (Optional).
- [ ] **Logic & Validation**:
    - **Required**: Symbol, Direction, Entry Price, Date.
    - **Validation**:
        - Prices must be positive numbers.
        - Exit Date >= Entry Date.
- [ ] **Computed Values**:
    - If SL/TP entered, display "Planned R:R" immediately (e.g., "1 : 2.5").
    - If Entry/Exit entered, display "Gross PnL".
- [ ] **Submission**:
    - `POST /api/v1/trades` (Create).
    - `PUT /api/v1/trades/{id}` (Update).
    - On success: Close modal, Toast notification, Refresh List.

## 4. Technical Notes
- Library: `react-hook-form` + `zod` resolver.
- Reusable for Create/Edit (pass `initialValues`).
- This story depends on `Tag Selector` and `Media Manager` as child components.
