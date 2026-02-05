# Story 7-1: Trading Strategy Management

**Epic**: EPIC-07 Settings (Strategy & Broker)
**Status**: ready-for-dev

## 1. Story Narrative
**As a** Trader (User)
**I want to** create, read, update, and delete my trading strategies (e.g. 策略名稱、說明、參數)
**So that** I can classify and analyse trades by strategy and manage strategy metadata in one place (設定 – 交易策略管理).

## 2. Acceptance Criteria

### Create
- [x] **POST /api/v1/strategies**: Create a new strategy for the current user. Body: `name` (required), `description` (optional), optional `parameters` (e.g. JSON or key-value). `user_id` from JWT. Returns 201 with created strategy.

### Read
- [x] **GET /api/v1/strategies**: List all strategies for the current user. Returns array of strategies.
- [x] **GET /api/v1/strategies/{strategy_id}**: Get one strategy by ID. Return 404 if not found or not owned by current user.

### Update
- [x] **PATCH /api/v1/strategies/{strategy_id}**: Update strategy (name, description, parameters). Only owner can update. Return 404 if not found or not owned.

### Delete
- [x] **DELETE /api/v1/strategies/{strategy_id}**: Delete strategy. Only owner can delete. Return 204 on success, 404 if not found or not owned. Define behaviour when trades reference this strategy (e.g. set strategy_id to null, or prevent delete if in use).

### Security & validation
- [x] All endpoints require JWT; scope by `user_id`. Users cannot access other users' strategies.
- [x] Validate required fields (e.g. name non-empty).

## 3. Data Model (TradingStrategy)

- **Collection**: e.g. `strategies` or `trading_strategies`.
- **Fields**: `user_id` (Indexed), `name` (str), `description` (optional str), `parameters` (optional – JSON/dict or structured fields). Timestamps optional (`created_at`, `updated_at`).

## 4. Technical Requirements (Guide)
- **Router**: e.g. `backend/app/routers/strategies.py` – prefix `/strategies`, tags `["strategies"]`.
- **Service**: `StrategyService` with `create`, `list_by_user`, `get_by_id`, `update`, `delete`; all filter by `user_id`.
- **Model**: Beanie document `TradingStrategy` in `backend/app/models/`.

### Architecture Compliance
- Same pattern as Account CRUD: routers, services, models; JWT for user_id.

### Development Notes
- Optional future: link Trade to strategy (e.g. `trade.strategy_id`). This story only covers Strategy CRUD; trade linkage can be a later story.
