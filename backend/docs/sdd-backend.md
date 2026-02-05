# 系統設計文件 - 後端架構 (System Design Document - Backend)

**專案名稱：** TradeLedgerX (交易員全方位績效管理與復盤系統)  
**文件 ID：** SDD-BACKEND  
**版本：** 1.0.0  
**日期：** 2026/01/29  
**作者：** Winston (System Architect)  
**依據：** PRD v1.0.0, SRS v1.0.0, SDD-SYSTEM v1.0.0

---

## 1. 簡介 (Introduction)

### 1.1 目的 (Purpose)

本文件旨在定義 TradeLedgerX 後端服務 (Backend Service) 的詳細設計。重點在於如何實現 SRS 定義的 RESTful API 介面、業務邏輯處理、以及資料持久化策略，並確保滿足高效能與高可用性的非功能需求 (NFR)。

### 1.2 範圍 (Scope)

- **語言/框架**：Python 3.11+ / FastAPI [Trace: SDD-SYSTEM 1.2]。
- **資料庫 (ODM)**：MongoDB Atlas / Beanie (Asynchronous ODM)。
- **快取**：Redis (用於儀表板與日曆數據快取)。
- **驗證**：Pydantic v2 (資料驗證) + PyJWT (身份驗證)。

---

## 2. 後端架構設計 (Backend Architecture)

### 2.1 分層架構 (Layered Architecture)

系統採用標準的 Clean Architecture 變體，確保職責分離。

```mermaid
graph TD
    Request[HTTP Request] --> Middleware[Middleware Layer (Auth, CORS, Context)]
    Middleware --> Routers[API Routers (Endpoints)]
    Routers --> Services[Service Layer (Business Logic)]
    Services --> Models[ODM Models (Beanie/Pydantic)]
    Models --> DB[(MongoDB)]
    Services --> Cache[(Redis Cache)]
```

- **Routers**: 處理 HTTP 請求/回應，驗證輸入格式 (Pydantic)，不含業務邏輯。
- **Services**: 執行核心業務邏輯 (如風控計算、盈虧比計算)，處理快取策略。
- **Models**: 定義資料庫 Schema 與資料驗證規則。

### 2.2 Middleware 設計

**AuthMiddleware**: 
- 解析 `Authorization: Bearer <token>`，驗證 JWT 有效性 [Trace: SRS 2.2]。

**AccountContextMiddleware**:
- 攔截 Header 中的 `X-Account-ID`。
- 驗證該 Account ID 是否屬於當前 User。
- 將 `account_id` 注入 Request Context，供後續 Service 使用 [Trace: REQ-SYS-003, REQ-SYS-004]。

---

## 3. 模組詳細設計 (Detailed Module Design)

### 3.1 投資組合管理模組 (Portfolio Module)

負責帳戶的讀取與驗證。

**API 實作**: `GET /api/v1/accounts`

**Service 邏輯**:
- 查詢 Account collection，過濾條件 `{ user_id: current_user.id }`。
- 回傳欄位需包含 `broker` 與 `type` 以支援前端顯示 [Trace: REQ-SYS-001, AC-001-01]。

**驗證規則**:
- `broker` 欄位必須在允許清單內 (FTMO, BingX 等) [Trace: SRS 4.0 Validation Rules]。

### 3.2 風險控管模組 (Risk Management Module)

核心功能，負責計算每日虧損並回傳狀態。

**API 實作**: `GET /api/v1/risk/daily-status`

**對應需求**: [US-002], [REQ-FUNC-002], [REQ-SYS-004]

**Service 邏輯 (RiskService.calculate_daily_status)**:

1. **時間範圍**: 取得 Server Time (UTC) 當日 00:00 至 23:59。

2. **聚合查詢 (Aggregation)**:
   - **Match**: `account_id`, `status='CLOSED'`, `exit_date` 在今日範圍內。
   - **Group**: Sum `realized_pnl` where `realized_pnl < 0` (僅加總虧損交易)。

3. **計算百分比**: `loss_percent = abs(daily_loss) / initial_balance`。

4. **狀態判定**:
   - `loss_percent >= 0.8` → `DANGER` [Trace: AC-002-02]。
   - `loss_percent >= 0.6` → `WARNING`。
   - Else → `SAFE`。

**效能**: 此計算需高度優化，利用複合索引 `{ account_id: 1, exit_date: -1 }` [Trace: REQ-NFR-002]。

### 3.3 交易日誌模組 (Journaling Module)

負責交易的 CRUD 與 標籤關聯。

**API 實作**: `POST /api/v1/trades`

**對應需求**: [US-004], [REQ-FUNC-004], [REQ-SYS-006]

**Service 邏輯 (TradeService.create_trade)**:

1. **R:R 計算**: 若 Request Body 包含 `sl` (止損) 與 `tp` (止盈)，自動計算 `planned_rr = abs(tp - entry) / abs(entry - sl)`。

2. **狀態更新**: 若包含 `exit_price`，設定 `status='CLOSED'` 並計算 `realized_pnl`。

3. **標籤驗證**: 檢查 `strategy_tags` 與 `mistake_tags` 中的 UUID 是否存在於 Tags collection [Trace: SRS 4.0 TAG_NOT_FOUND]。

4. **快取失效 (Cache Invalidation)**:
   - 交易寫入成功後，必須 **刪除** Redis key: `analytics:calendar:{account_id}:*` 與 `risk:status:{account_id}` [Trace: SDD-SYSTEM 4.2]。

### 3.4 標籤管理模組 (Tag Module)

**API 實作**: `GET /api/v1/tags`, `POST /api/v1/tags`

**對應需求**: [US-003], [REQ-FUNC-003], [REQ-SYS-005]

**權限控制**: POST/PUT/DELETE 僅限 Admin 角色操作 (透過 JWT Claims 中的 `role` 判定)。

### 3.5 數據分析模組 (Analytics Module)

**API 實作**: `GET /api/v1/analytics/calendar`

**對應需求**: [REQ-FUNC-005], [REQ-SYS-008]

**Service 邏輯**:

1. **檢查快取**: 嘗試讀取 Redis `analytics:calendar:{account_id}:{month}`。
   - 若命中直接回傳 [Trace: SRS 3.5.1]。

2. **DB 查詢**: 使用 MongoDB Aggregation Pipeline 按 `exit_date` 分組，加總 `realized_pnl`。

3. **寫入快取**: 將結果存入 Redis，TTL 設定為 5 分鐘 (或直到有新交易寫入時失效)。

---

## 4. 資料庫 Schema 設計 (Database Schema)

採用 MongoDB Document 模型以適應靈活的標籤結構。

### 4.1 Collection: accounts

```python
class Account(Document):
    user_id: UUID  # Indexed
    name: str
    broker: str    # Enum: FTMO, BingX, etc.
    type: str      # Enum: CHALLENGE, LIVE
    balance: float
    currency: str = "USD"
```

### 4.2 Collection: trades

**追溯** [Trace: REQ-SYS-006]

```python
class Trade(Document):
    account_id: UUID # Indexed
    symbol: str      # e.g. XAUUSD
    direction: str   # LONG/SHORT
    entry_date: datetime # Indexed (複合索引 part 1)
    entry_price: float
    exit_date: Optional[datetime]
    exit_price: Optional[float]
    status: str      # OPEN/CLOSED (複合索引 part 2) [Trace: SDD-SYSTEM 4.1]
    images: List[str] # TradingView Chart Image URLs
    
    # 關聯
    strategy_tags: List[Link[Tag]]
    mistake_tags: List[Link[Tag]]
    
    # 計算欄位
    planned_rr: Optional[float]
    realized_pnl: Optional[float]
```

### 4.3 Collection: tags

**追溯** [Trace: REQ-SYS-005]

```python
class Tag(Document):
    name: str        # Unique, Indexed
    type: str        # STRATEGY, MISTAKE
    color: str       # Hex
```

### 4.4 索引策略 (Indexing Strategy)

依據 SDD-SYSTEM 4.1 定義：

- `db.trades.create_index([("account_id", ASCENDING), ("entry_date", DESCENDING)])` - 加速列表查詢。
- `db.trades.create_index([("account_id", ASCENDING), ("status", ASCENDING), ("exit_date", DESCENDING)])` - 加速風控每日虧損計算 [Trace: REQ-NFR-002]。

---

## 5. API 介面與錯誤處理 (API Interface & Error Handling)

### 5.1 錯誤回應標準

所有 API 異常需捕捉並轉換為標準 JSON 格式 [Trace: SDD-SYSTEM 2.1]。

```python
# Exception Handler 範例
@app.exception_handler(TradeError)
async def trade_exception_handler(request, exc):
    return JSONResponse(
        status_code=400,
        content={
            "error": {
                "code": exc.code,  # e.g. INVALID_PRICE [Trace: SRS 4.0]
                "message": exc.message,
                "request_id": request.state.request_id
            }
        }
    )
```

---

## 6. 需求追溯矩陣 (RTM - Backend Scope)

本章節確保所有後端實作皆可追溯至 SRS 與 PRD。

| SRS ID | PRD ID | 功能模組 | 後端實作元件/邏輯 | 驗證標準 (AC) |
|--------|--------|----------|-------------------|---------------|
| REQ-SYS-001 | US-001 | Portfolio | AccountService.get_user_accounts | 回傳帳戶列表含 Broker 資訊 |
| REQ-SYS-003 | US-001 | Core | AccountContextMiddleware | 請求需帶 X-Account-ID Header |
| REQ-SYS-004 | US-002 | Risk | RiskService.calculate_daily_status | 正確計算當日虧損百分比並回傳狀態 |
| REQ-SYS-005 | US-003 | Tag | TagService (CRUD) | Admin 可管理，User 僅讀取 |
| REQ-SYS-006 | US-004 | Journal | TradeService.create_trade | 成功寫入交易並關聯 Tag IDs |
| REQ-SYS-008 | US-Implicit | Analytics | AnalyticsService.get_calendar_data | 回傳每日聚合 PnL，支援 Redis 快取 |
| NFR-001 | REQ-NFR-002 | Performance | 使用 async/await 與 Redis 快取 | API 回應 < 200ms |
| NFR-002 | REQ-NFR-002 | Database | MongoDB 複合索引配置 | 查詢優化 |
| NFR-003 | - | Security | bcrypt 密碼雜湊 + PII 加密 | 資料庫不存明文密碼 |

---

## 7. 部署與配置 (Deployment & Configuration)

**Container**: Dockerfile 基於 `python:3.11-slim`。

**Server**: 使用 `uvicorn` 作為 ASGI Server，Worker 數設定為 `auto`。

**環境變數**:
- `MONGO_URI`: MongoDB 連線字串 [Trace: SDD-SYSTEM 5.1]。
- `REDIS_URL`: Redis 連線字串。
- `SECRET_KEY`: JWT 簽署金鑰。

---

**文件結尾**
