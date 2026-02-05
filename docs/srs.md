# 軟體需求規格書 (Software Requirements Specification)

**專案名稱：** TradeLedgerX (交易員全方位績效管理與復盤系統)
**版本：** 1.0.0
**日期：** 2026/01/29
**狀態：** Formal Draft
**適用對象：** 後端開發人員、前端開發人員、QA 測試人員

---

# 1. 簡介 (Introduction)

## 1.1 目的 (Purpose)
本文件定義 TradeLedgerX 系統的軟體功能需求、API 介面行為與資料驗證規則。此文件作為前後端開發的**唯一真理來源 (Single Source of Truth)**，確保系統實作符合 PRD v1.0.0 的業務目標。

## 1.2 範圍 (Scope)
本系統為採用前後端分離架構的 Web 應用程式：
* **前端**：React SPA，負責 UI 呈現與使用者交互。
* **後端**：FastAPI RESTful API，負責業務邏輯、資料庫操作與快取管理。
* **資料界接**：前後端透過 REST API (JSON) 進行通訊。

## 1.3 定義與縮寫
* **API Contract**: 前後端對 API 輸入輸出的約定。
* **JWT**: JSON Web Token，用於無狀態身份驗證。
* **PnL**: Profit and Loss (損益)。

---

# 2. 系統架構與介面規範 (System Architecture & Interface)

## 2.1 API 設計原則 (API Design Principles)
* **通訊協定**: HTTP/1.1 or HTTP/2 (over TLS).
* **資料格式**: Request 與 Response Body 皆為 JSON 格式。
* **命名慣例**: URL Path 使用 kebab-case (e.g., `/api/v1/trade-logs`)；JSON Key 使用 snake_case (e.g., `entry_price`)。
* **狀態碼**: 嚴格遵守 HTTP Status Codes (200, 201, 400, 401, 403, 404, 422, 500)。

## 2.2 身份驗證 (Authentication)
* **機制**: Bearer Token (JWT)。
* **Token 傳遞**: 放在 HTTP Header `Authorization: Bearer <token>`。
* **Token 過期**: Access Token 效期 30 分鐘，Refresh Token 效期 7 天。

---

# 3. 系統功能需求 (System Features)

## 3.1 投資組合管理 (Portfolio Management)

### 3.1.1 取得帳戶列表
* **REQ-SYS-001**: 系統應提供 `GET /api/v1/accounts` 接口。
* **輸出 (Response)**: 回傳該使用者所有帳戶的陣列。每個物件包含 `id`, `name`, `broker` (e.g., 'FTMO'), `type` ('CHALLENGE'/'LIVE'), `balance`.
* **邏輯**: 僅回傳屬於當前登入 User ID 的帳戶。

### 3.1.2 切換當前帳戶
* **REQ-SYS-002**: 前端切換帳戶時，**不需**呼叫後端 API，但必須將選定的 `account_id` 存入 Frontend State/LocalStorage。
* **REQ-SYS-003**: 後續所有與交易相關的 API 請求 (如新增交易、取得報表)，Header 必須帶有 `X-Account-ID`，後端據此過濾資料。

## 3.2 風險控管 (Risk Management)

### 3.2.1 每日虧損狀態查詢
* **REQ-SYS-004**: 系統應提供 `GET /api/v1/risk/daily-status`。
* **輸入 (Header)**: `X-Account-ID`。
* **處理邏輯**:
    1.  定義「今日」範圍：Server Time 00:00:00 至 23:59:59 (UTC+8 或使用者設定時區)。
    2.  撈取該時段內 `status='CLOSED'` 且 `realized_pnl < 0` 的所有交易。
    3.  計算 `total_daily_loss` (絕對值)。
    4.  計算 `loss_percentage = (total_daily_loss / initial_balance) * 100`。
* **輸出**: `{ "loss_amount": float, "loss_percentage": float, "status": "SAFE" | "WARNING" | "DANGER" }`
* **驗證規則**:
    * `WARNING`: >= 60%
    * `DANGER`: >= 80%

## 3.3 標籤管理 (Tag Management)

### 3.3.1 標籤 CRUD
* **REQ-SYS-005**: 提供標準 REST API `/api/v1/tags`。
* **資料模型**:
    * `name`: String, Unique (Case-insensitive).
    * `type`: Enum (`STRATEGY`, `MISTAKE`).
    * `color`: String (Hex Code, Optional).
* **驗證**: Admin 權限才可執行 Create/Update/Delete；一般 User 僅能 Read。

## 3.4 交易日誌 (Journaling)

### 3.4.1 新增交易紀錄
* **REQ-SYS-006**: 系統應提供 `POST /api/v1/trades`。
* **輸入 (Request Body)**:
    * `symbol`: String (e.g., "XAUUSD").
    * `direction`: Enum (`LONG`, `SHORT`).
    * `entry_price`: Float (> 0).
    * `exit_price`: Float (Optional, if status is OPEN).
    * `strategy_tags`: Array of UUIDs (必須存在於 Tags collection).
    * `mistake_tags`: Array of UUIDs (必須存在於 Tags collection).
* **處理邏輯**:
    1.  若提供 `sl` (Stop Loss) 和 `tp` (Take Profit)，自動計算 `planned_rr` (Risk:Reward Ratio)。
    2.  若 `exit_price` 存在，自動計算 `realized_pnl` 並更新 `status` 為 `CLOSED`。
    3.  觸發非同步任務：重新計算該帳戶的統計數據快取 (Invalidate Redis Cache)。

### 3.4.2 交易列表查詢與篩選
* **REQ-SYS-007**: 提供 `GET /api/v1/trades`。
* **Query Params**: 支援分頁 (`page`, `limit`)、篩選 (`date_from`, `date_to`, `symbol`, `tags`)。

## 3.5 數據分析 (Analytics)

### 3.5.1 盈虧日曆數據
* **REQ-SYS-008**: 提供 `GET /api/v1/analytics/calendar`。
* **輸入**: `year` (int), `month` (int)。
* **輸出**: 回傳該月份每日的 PnL 聚合數據。
    ```json
    [
      { "date": "2026-01-01", "pnl": 120.5, "trade_count": 3 },
      { "date": "2026-01-02", "pnl": -50.0, "trade_count": 1 }
    ]
    ```
* **快取**: 此 API 回應應快取 5 分鐘，除非有新交易寫入。

---

# 4. 資料驗證規則 (Validation Rules)

為確保資料完整性，後端必須實作以下驗證 (前端應配合實作預先驗證)：

| 欄位/物件 | 規則描述 | 錯誤代碼 (Error Code) |
| :--- | :--- | :--- |
| **Account.broker** | 必須是允許清單之一：`['MCF', 'FTMO', 'BingX', 'Topstep']` | `INVALID_BROKER` |
| **Trade.entry_price** | 必須為大於 0 的浮點數 | `INVALID_PRICE` |
| **Trade.tags** | 陣列中的每個 ID 必須真實存在於資料庫 | `TAG_NOT_FOUND` |
| **Trade.date** | 不可為未來時間 | `INVALID_DATE` |
| **User.password** | 建立時長度需 >= 8 碼，包含英數字 | `WEAK_PASSWORD` |

---

# 5. 非功能需求 (Non-Functional Requirements)

## 5.1 效能 (Performance)
* **NFR-001**: 儀表板核心 API (`daily-status`, `stats`) 回應時間 < 200ms (P95)。
* **NFR-002**: 資料庫查詢應建立適當 Index (e.g., `account_id` + `date`)。

## 5.2 安全性 (Security)
* **NFR-003**: 所有 PII (個人可識別資訊) 與密碼雜湊 (Bcrypt) 需加密儲存。
* **NFR-004**: 實作 Rate Limiting (e.g., 每分鐘 100 次請求) 防止濫用。
* **NFR-005**: 跨來源資源共享 (CORS) 僅允許前端網域存取。

## 5.3 可靠性 (Reliability)
* **NFR-006**: 系統需具備 Graceful Shutdown 機制，確保重啟時不中斷進行中的寫入。
* **NFR-007**: 關鍵操作 (如刪除帳戶) 需具備 Audit Log (稽核紀錄)。