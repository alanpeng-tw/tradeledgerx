# STORY-07-01: Trading Strategy Management UI

## 1. Description
Provide UI for users to create, list, edit, and delete their trading strategies (交易策略管理). This story depends on backend **7-1 Trading Strategy Management API**.

## 2. Goals
- Users can add and manage their own strategies (e.g. 策略名稱、說明、參數) under Settings – 交易策略管理.
- Strategy list and forms call backend CRUD endpoints.

## 3. Acceptance Criteria

### 3.1 Entry & List
- [x] **Entry**: Under Settings (設定), a section or tab "交易策略管理" opens the strategy management view.
- [x] **List**: Display all strategies for the current user (call `GET /api/v1/strategies`). Show at least: name, description (if any), optional parameters.

### 3.2 Create Strategy
- [x] **Form**: Form with fields: name (required), description (optional), optional parameters (e.g. key-value or JSON).
- [x] **Submit**: On submit, call `POST /api/v1/strategies`. On success, refresh list and close or reset form.

### 3.3 Edit Strategy
- [x] **Form**: Edit form (or inline edit) for an existing strategy. Fields: name, description, parameters.
- [x] **Submit**: Call `PATCH /api/v1/strategies/{strategy_id}`. On success, refresh list.

### 3.4 Delete Strategy
- [x] **Action**: Button or action to delete a strategy.
- [x] **Confirmation**: Confirm dialog before calling `DELETE /api/v1/strategies/{strategy_id}`.
- [x] **After delete**: Refresh list; invalidate relevant queries.

### 3.5 Types & API Client
- [x] **Types**: Define `Strategy` (or equivalent) with id, name, description, parameters; align with backend 7-1.
- [x] **API client**: Add `getStrategies()`, `getStrategyById()`, `createStrategy()`, `updateStrategy()`, `deleteStrategy()` in `api/strategies.ts` (or equivalent).

## 4. Technical Notes
- All API calls require JWT; backend scopes by user_id.
- After create/update/delete, invalidate `['strategies']` (or equivalent) so list stays in sync.
- **Backend dependency**: Backend story **7-1 (Trading Strategy Management)** must be implemented first.

## 5. References
- Backend user story: `backend/docs/user-stories/7-1-trading-strategy-management.md`
