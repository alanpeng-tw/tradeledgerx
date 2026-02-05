# Story 7-2: Broker Management

**Epic**: EPIC-07 Settings (Strategy & Broker)
**Status**: ready-for-dev

## 1. Story Narrative
**As a** Admin / Trader
**I want to** list and manage supported brokers (券商) via API
**So that** the system can display broker options (e.g. FTMO, BingX, MCF) in account creation and settings without hard-coding (設定 – 券商管理).

## 2. Acceptance Criteria

### Read (all users)
- [x] **GET /api/v1/brokers**: List all active brokers (for dropdown in Account form). Returns array with at least: `id` or `code`, `name` or `display_name`, optional `sort_order`. Only active brokers by default.

### Create / Update / Delete (admin or config)
- [x] **POST /api/v1/brokers**: Create broker. Body: `code` (e.g. FTMO), `name` or `display_name`, optional `sort_order`, `is_active` (default true). Restrict to admin role or document as config-only.
- [x] **PATCH /api/v1/brokers/{broker_id}**: Update broker (name, display_name, sort_order, is_active). Admin only.
- [x] **DELETE /api/v1/brokers/{broker_id}**: Soft-delete or hard-delete. Admin only. Define behaviour for existing accounts using this broker (e.g. do not allow delete if accounts exist, or mark broker inactive only).

### Security & validation
- [x] GET /brokers: any authenticated user (or public for dropdown). Create/Update/Delete: admin only (or same as other admin endpoints).
- [x] `code` unique; required.

## 3. Data Model (Broker)

- **Collection**: e.g. `brokers`.
- **Fields**: `code` (str, unique, e.g. FTMO, BINGX, MCF), `name` or `display_name` (str), `sort_order` (int, default 0), `is_active` (bool, default True). Optional: `created_at`, `updated_at`.

## 4. Technical Requirements (Guide)
- **Router**: e.g. `backend/app/routers/brokers.py` – prefix `/brokers`, tags `["brokers"]`.
- **Service**: `BrokerService` with `list_active`, `create`, `get_by_id`, `update`, `delete` (or deactivate).
- **Model**: Beanie document `Broker` in `backend/app/models/broker.py`.

### Relationship to Account
- **Option A**: Keep `Account.broker` as enum; Broker API is for display/metadata only (list for UI). New brokers require code change.
- **Option B**: Change `Account.broker` to string (broker `code`); seed or migrate existing enum values into `brokers` collection. New brokers can be added without code change. Recommend Option B for flexibility (e.g. add MCF).

### Development Notes
- Seed initial brokers (FTMO, BINGX, BYBIT, META_TRADER) via migration or script if using Broker collection.
- References: Account model uses broker; EPIC-02 Account CRUD.
