# EPIC-07: Settings – Trading Strategy & Broker Management

## 1. Description
Settings module for managing trading strategies (user-defined strategies for categorising or analysing trades) and brokers (supported brokers for accounts). Together with **Account Management** (Epic 2), these form the "設定" (Settings) area: 交易策略管理、券商管理、帳號管理.

## 2. In-Scope User Stories
- **Story 7-1**: Trading Strategy Management – CRUD for user-defined trading strategies (name, description, optional parameters).
- **Story 7-2**: Broker Management – CRUD for supported brokers (code, name, display name, order); used by Account creation and dropdowns.

## 3. Relationship to Other Epics
- **Account Management** (帳號管理): Implemented in **Epic 2** (2-1 list, 2-2 CRUD + status/notes). Settings UI may group "帳號管理" with Strategy and Broker under one Settings page.
- **Tags**: Epic 3 / Epic 6 (frontend Settings-Tags) remain separate; Strategy is a different concept (strategy template or label for analysis).

## 4. Technical Notes
- Strategies: Per-user (user_id); optional link to trades later (e.g. trade.strategy_id).
- Brokers: System-wide or per-tenant; Account.broker references broker code or id (see 7-2 for migration from enum if needed).
