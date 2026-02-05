# STORY-02-03: Account Switcher Component

## 1. Description
The UI element that allows users to see which account they are viewing and switch to a different one. This is a critical navigation element located in the global header.

## 2. Goals
- Provide easy access to account switching.
- Display key info to prevent errors (e.g., trading on the wrong account).

## 3. Acceptance Criteria
- [x] **UI Component (`AccountSwitcher`)**:
    - Placed in the top **Header** (AppBar).
    - Displays current account Name and Broker (e.g., "FTMO - Challenge" or "BingX (BINGX)").
    - Format: Dropdown menu (Select or Menu).
- [x] **Interaction**:
    - Clicking opens the list of all available accounts.
    - **Selecting a new account MUST have visible effect**: When the user selects a different account from the dropdown, the following MUST happen (no "no response" behavior):
        1. Call `setActiveAccount(id)` so the active account in the store is updated.
        2. Call `queryClient.invalidateQueries(...)` for **all account-scoped data** (e.g. `['accounts']`, `['trades']`, `['risk']`, `['analytics']`, `['strategies']`, or equivalent keys) so that subsequent API calls use the new `X-Account-ID` and data refetches for the new account.
        3. The dropdown display MUST update immediately to show the selected account name (e.g. "BingX (BINGX)").
        4. Page content (Dashboard, Journal, Analytics, Settings, etc.) MUST refresh to show data for the newly selected account; API requests MUST carry the new `X-Account-ID` header.
- [x] **Feedback**:
    - UI updates immediately to reflect the new choice (dropdown label + any data on the page).
    - App context refreshes so that all account-scoped views show the new account's data.
- [x] **Empty State**:
    - If no accounts exist (new user), show "No Accounts".

## 4. Technical Notes
- Use MUI `Select` or `Menu` component.
- **Critical**: When account changes, we must invalidate relevant React Query keys (e.g. `queryClient.invalidateQueries(['trades'])`, `queryClient.invalidateQueries(['accounts'])`, and any other keys that depend on `activeAccountId`) to force a data refresh. The dropdown `value` or selected item MUST be bound to `activeAccountId` from the store so that selection updates the store and triggers invalidation.
- **Verify**: After selecting another account, check Network tab to confirm `X-Account-ID` changes on the next request, and that list/data on the current page updates (e.g. strategy list, trades) to the new account.
