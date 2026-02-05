# STORY-02-04: Account CRUD UI (Create / Edit / Delete)

## 1. Description
Provide pages and forms so users can create new trading accounts, edit existing ones (including setting status and notes, e.g. 爆倉), and delete accounts. This story depends on backend **2-2 Account CRUD API** being implemented.

## 2. Goals
- Users can add new accounts (e.g. new FTMO challenge, BingX live) from the UI.
- Users can update an account (e.g. mark status as 失敗, add notes 爆倉) when an exam fails.
- Users can delete an account they no longer need.
- Account list and switcher continue to work and optionally show status/notes.

## 3. Acceptance Criteria

### 3.1 Account Management Entry
- [x] **Entry point**: A way to open "Account Management" (e.g. menu item, settings page, or dedicated route such as `/accounts`).
- [x] **List view**: Display all accounts for the current user (reuse or extend data from `getAccounts()`). Show at least: name, broker, type, balance, currency, **status**, **notes** (if present).

### 3.2 Create Account
- [x] **Form**: Form to create a new account with fields: name, broker (dropdown: FTMO, BINGX, BYBIT, META_TRADER), type (CHALLENGE / LIVE), balance, currency (default USD), optional initial_balance, daily_loss_limit.
- [x] **Submit**: On submit, call `POST /api/v1/accounts` with the form data. On success, refresh account list and optionally invalidate `['accounts']` so switcher and list are up to date.
- [x] **Validation**: Required fields validated; broker and type from allowed values.

### 3.3 Edit Account
- [x] **Form**: Edit form (or inline edit) for an existing account. Editable fields: name, broker, type, balance, initial_balance, daily_loss_limit, currency, **status** (e.g. ACTIVE / FAILED / CLOSED), **notes** (free text).
- [x] **Use case**: User can set status to "失敗" and notes to "爆倉" when an exam account fails.
- [x] **Submit**: Call `PATCH /api/v1/accounts/{account_id}`. On success, refresh list and account store.

### 3.4 Delete Account
- [x] **Action**: Button or action to delete an account.
- [x] **Confirmation**: Confirm dialog (e.g. "確定刪除此帳戶？") before calling `DELETE /api/v1/accounts/{account_id}`.
- [x] **After delete**: If the deleted account was the active one, clear or switch to another account; refresh list and invalidate queries.

### 3.5 Types & API Client
- [x] **Types**: Extend `Account` (or equivalent) to include `status` and `notes` (and any other new backend fields). Align with backend 2-2 (AccountStatus: ACTIVE, FAILED, CLOSED).
- [x] **API client**: Add `createAccount()`, `getAccountById()`, `updateAccount()`, `deleteAccount()` in `api/accounts.ts` (or equivalent), calling the backend CRUD endpoints.

## 4. Technical Notes
- Use existing auth: all API calls must send JWT; backend will use `user_id` from token.
- After create/update/delete, call `queryClient.invalidateQueries(['accounts'])` so AccountSwitcher and list stay in sync.
- Consider permission: only account owner can CRUD (backend enforces; frontend just calls API).
- **Backend dependency**: Backend story **2-2 (Account CRUD and status/notes)** must be done first so endpoints and `status`/`notes` exist.

## 5. References
- Backend user story: `backend/docs/user-stories/2-2-account-crud-and-status-notes.md`
- Existing frontend: STORY-02-02 (Account API), STORY-02-03 (Account Switcher)
