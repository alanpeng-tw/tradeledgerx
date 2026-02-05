# STORY-02-01: Global Account State Management

## 1. Description
Establish the client-side state management for handling user accounts. Since the entire application context (Dashboard, Journal, Analytics) depends on which trading account is currently selected, this state must be globally accessible and persistent.

## 2. Goals
- Store the list of available accounts.
- Track the currently active account.
- Persist the selection across browser sessions.

## 3. Acceptance Criteria
- [ ] **Zustand Store (`useAuthStore` or `useAccountStore`)**:
    - State `accounts`: Array of Account objects (ID, Name, Broker, Type, Balance).
    - State `activeAccountId`: String (UUID) | null.
- [ ] **Actions**:
    - `setAccounts(accounts)`: Updates the list.
    - `setActiveAccount(id)`: Updates the selected ID and saves to `localStorage`.
- [ ] **Persistence**:
    - On app load (Hydration), `activeAccountId` should be read from `localStorage`.
    - If the stored ID matches an account in the fetched list, set it as active.
- [ ] **Default Selection Logic**:
    - If no account is stored (or stored one is invalid), default to the *first* account in the list.

## 4. Technical Notes
- **File**: `src/store/authStore.ts` (Extend existing) or `src/store/accountStore.ts`.
- Ensure type safety with TypeScript interfaces for the Account object.
