# EPIC-02: Portfolio & Account Management

## 1. Description
Implement the multi-account management system. Traders often manage multiple funds (Prop Firms, Personal), and the system must allow global switching between these accounts without reloading the page.

## 2. Requirements Traceability
| ID | Source | Description |
|---|---|---|
| REQ-SYS-001 | SRS 3.1.1 | Get Account List API |
| REQ-SYS-002 | SRS 3.1.2 | Client-side Account Switching |
| REQ-SYS-003 | SRS 3.1.2 | Header Injection (`X-Account-ID`) |

## 3. Scope & Deliverables

### 3.1 Global State Management
- [ ] **Store**: Create `useAuthStore` (or `useAccountStore`) to manage:
    - `accounts`: List of available accounts.
    - `activeAccountId`: Currently selected account UUID.
- [ ] **Persistence**: `activeAccountId` must survive page reloads (localStorage).

### 3.2 Account Switcher UI
- [ ] **Selector Component**: Dropdown in the Top Bar (Header) to list accounts.
- [ ] Display account details: Name, Broker (e.g., FTMO), Type (Challenge/Live).

### 3.3 API Integration
- [ ] Integrate `GET /api/v1/accounts`.
- [ ] Update **Axios Interceptor**:
    - Read `activeAccountId` from store.
    - Inject header `X-Account-ID: <uuid>` to **all** outgoing requests.

### 3.4 Account CRUD UI (STORY-02-04)
- [ ] **List / Manage**: Page or section to list all accounts and manage them (create, edit, delete).
- [ ] **Create**: Form to add new account (name, broker, type, balance, etc.); call `POST /api/v1/accounts`.
- [ ] **Edit**: Form to update account (including **status** e.g. ACTIVE/FAILED/CLOSED and **notes** e.g. 爆倉); call `PATCH /api/v1/accounts/{id}`.
- [ ] **Delete**: Delete action with confirmation; call `DELETE /api/v1/accounts/{id}`. Depends on backend 2-2.

## 4. Technical Notes
- If `activeAccountId` is null, prompt user to select an account or default to the first one available.
- Switching accounts should trigger a "soft reset" of data (e.g., invalidate React Query cache for `['trades']`, `['stats']`).
