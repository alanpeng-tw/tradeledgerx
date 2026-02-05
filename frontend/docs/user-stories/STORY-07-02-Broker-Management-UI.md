# STORY-07-02: Broker Management UI

## 1. Description
Provide UI for listing and (for admin) managing supported brokers (券商管理). Brokers are used in Account create/edit (dropdown). This story depends on backend **7-2 Broker Management API**.

## 2. Goals
- Users (or admins) can see the list of supported brokers under Settings – 券商管理.
- Admin can add, edit, and delete/deactivate brokers so new brokers (e.g. MCF) can be added without code change.
- Account create/edit form uses broker list from API for dropdown.

## 3. Acceptance Criteria

### 3.1 List Brokers
- [x] **Entry**: Under Settings (設定), a section or tab "券商管理" opens the broker management view.
- [x] **List**: Display supported brokers (call `GET /api/v1/brokers`). Show at least: code, name/display_name, sort_order, is_active.

### 3.2 Create Broker (admin)
- [x] **Form**: Form with fields: code (e.g. FTMO, MCF), name or display_name, optional sort_order, is_active.
- [x] **Submit**: Call `POST /api/v1/brokers`. Restrict to admin role (hide or disable for non-admin). On success, refresh list.

### 3.3 Edit Broker (admin)
- [x] **Form**: Edit form for an existing broker. Fields: code (read-only or editable per backend), name, sort_order, is_active.
- [x] **Submit**: Call `PATCH /api/v1/brokers/{broker_id}`. Admin only. On success, refresh list.

### 3.4 Delete / Deactivate Broker (admin)
- [x] **Action**: Button to delete or deactivate broker. Confirm dialog before calling `DELETE` or deactivate endpoint.
- [x] **After action**: Refresh list; if broker dropdown is used in Account form, ensure it refetches brokers.

### 3.5 Account Form Integration
- [x] **Dropdown**: In Account create/edit form (STORY-02-04), broker dropdown options come from `GET /api/v1/brokers` instead of (or in addition to) hard-coded list. Ensure dropdown updates after broker list changes.

### 3.6 Types & API Client
- [x] **Types**: Define `Broker` (id, code, name/display_name, sort_order, is_active); align with backend 7-2.
- [x] **API client**: Add `getBrokers()`, `createBroker()`, `updateBroker()`, `deleteBroker()` in `api/brokers.ts` (or equivalent). Restrict create/update/delete to admin if needed.

## 4. Technical Notes
- GET /brokers may be callable by any authenticated user (for dropdown); create/update/delete admin only per backend.
- **Backend dependency**: Backend story **7-2 (Broker Management)** must be implemented first. If backend keeps Broker as enum initially, frontend can still prepare UI and switch to API when 7-2 is done.

## 5. References
- Backend user story: `backend/docs/user-stories/7-2-broker-management.md`
- Account form: STORY-02-04 (Account CRUD UI)
