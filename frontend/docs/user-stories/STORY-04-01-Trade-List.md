# STORY-04-01: Trade List Grid

## 1. Description
The main view of the Journaling module. It displays a tabular list of all historical trades, allowing the user to review performance, filter by specific criteria, and initiate edits.

## 2. Goals
- Efficiently display large sets of trade data.
- Provide powerful filtering and sorting capabilities.

## 3. Acceptance Criteria
- [ ] **UI Component (`TradeDatagrid`)**:
    - Build using MUI `DataGrid` (or standard Table if lightweight).
    - **Columns**:
        - Date/Time (Sortable).
        - Symbol (e.g., EURUSD).
        - Type (Long/Short) - Color coded (Green/Red).
        - Entry/Exit Price.
        - PnL (Amount & R-multiple).
        - Tags (Display as Chips).
        - Actions (Edit/Delete buttons).
- [ ] **Data Fetching**:
    - Endpoint: `GET /api/v1/trades`.
    - **Pagination**: Server-side (Limit/Offset or Page/Size).
    - **Filters**:
        - Date Range Picker.
        - Accounts (Inherited from Global State).
- [ ] **Interaction**:
    - Clicking "Edit" opens the Trade Form (Story 04-02).
    - Clicking "Delete" confirms and calls `DELETE /api/v1/trades/{id}`.

## 4. Technical Notes
- Use `useQuery` with `keepPreviousData: true` for smooth pagination.
- Filter state should be managed in the URL query params (`useSearchParams`) so links are shareable/bookmarkable.
