# EPIC-07: Settings – Trading Strategy & Broker Management

## 1. Description
Settings UI for managing trading strategies (用戶自訂策略) and brokers (券商). Together with **Account Management** (STORY-02-04), these form the "設定" (Settings) area: 交易策略管理、券商管理、帳號管理.

## 2. Scope & Deliverables

### 3.1 Trading Strategy Management (STORY-07-01)
- [ ] **List**: Page or section to list all strategies for the current user.
- [ ] **Create**: Form to add strategy (name, description, optional parameters); call `POST /api/v1/strategies`.
- [ ] **Edit**: Form to update strategy; call `PATCH /api/v1/strategies/{id}`.
- [ ] **Delete**: Delete with confirmation; call `DELETE /api/v1/strategies/{id}`.

### 3.2 Broker Management (STORY-07-02)
- [ ] **List**: Page or section to list supported brokers (for admin or all users depending on backend).
- [ ] **Create** (admin): Form to add broker (code, name, display_name, sort_order); call `POST /api/v1/brokers`.
- [ ] **Edit** (admin): Form to update broker; call `PATCH /api/v1/brokers/{id}`.
- [ ] **Delete / Deactivate** (admin): Action with confirmation; call `DELETE` or deactivate. Depends on backend 7-2.
- [ ] **Dropdown**: Account create/edit form uses `GET /api/v1/brokers` for broker dropdown (replace or supplement hard-coded list).

### 3.3 Account Management (already defined)
- [ ] **Account Management** (帳號管理): Implemented by **STORY-02-04** (Account CRUD UI). Settings page may group "帳號管理" with Strategy and Broker under one Settings or 設定 menu.

## 3. Technical Notes
- Depends on backend **7-1** (Strategy API) and **7-2** (Broker API).
- Settings route: e.g. `/settings` with tabs or sections: 交易策略管理、券商管理、帳號管理.
