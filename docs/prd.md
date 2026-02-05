# 交易員全方位績效管理與復盤系統 (Trader Performance & Journaling System) - 產品需求文件 (PRD)

# 1. 文件控制 (Document Control)

| 版本 (Version) | 日期 (Date) | 作者 (Author) | 變更描述 (Description of Change) |
| :--- | :--- | :--- | :--- |
| 1.0.0 | 2026/01/29 | CMMI-PM | [cite_start]初始草案建立，整合策略管理與風控模組 [cite: 3] |

# 2. 簡介 (Introduction)

## 2.1 目的 (Purpose)
[cite_start]本文件旨在定義「交易員全方位績效管理與復盤系統 (Trader Performance & Journaling System)」之功能與非功能需求，以提供開發團隊、測試團隊與利害關係人統一的驗收標準 [cite: 2, 6]。

## 2.2 範圍 (Scope)
本系統為一套私有化、高定制性的交易日誌平台。核心範圍包含：
1.  [cite_start]**投資組合管理**：區分考試倉與真倉 [cite: 15]。
2.  [cite_start]**風險控管**：即時監控每日虧損，防止違規 [cite: 22]。
3.  [cite_start]**策略與行為管理**：標準化策略標籤與錯誤歸因 [cite: 27-29]。
4.  [cite_start]**交易日誌**：提供完整的 CRUD 介面記錄交易細節 [cite: 32]。
5.  [cite_start]**數據分析**：提供盈虧日曆與視覺化統計 [cite: 40-41]。

## 2.3 定義與縮寫 (Definitions & Acronyms)
* [cite_start]**Prop Firm**: 自營交易公司 (如 FTMO, MCF) [cite: 7]。
* [cite_start]**PnL**: 損益 (Profit and Loss) [cite: 38]。
* [cite_start]**R:R**: 盈虧比 (Risk to Reward Ratio) [cite: 38]。
* [cite_start]**FOMO**: 錯失恐懼症 (Fear Of Missing Out)，一種情緒化交易行為 [cite: 29]。

# 3. 整體描述 (Overall Description)

## 3.1 產品觀點 (Product Perspective)
[cite_start]本系統旨在協助交易員通過 Prop Firm 考核、優化策略並修正交易行為 [cite: 7-9][cite_start]。系統需具備容器化部署能力，並支援開發與正式環境隔離 [cite: 53-54]。

## 3.2 使用者類別與特徵 (User Classes and Characteristics)
| 角色 | 權限描述 | 預設帳號 |
| :--- | :--- | :--- |
| **超級管理員 (Admin)** | [cite_start]全權管理。新增/刪除帳號、設定策略庫、定義錯誤標籤、管理資金與紀錄 [cite: 12]。 | alanpeng / 123456 |
| **一般檢視者 (User)** | [cite_start]僅限瀏覽。查看儀表板、日曆與新增交易明細 [cite: 12]。 | 由 Admin 建立 |

# 4. 使用者故事 (User Stories - Agile Context)

**[US-001] 多帳戶切換與管理**
* **As a** 交易員 (User/Admin)
* **I want to** 在系統中明確切換「考試倉」與「真倉」
* [cite_start]**So that** 我能針對不同性質的帳戶進行獨立的績效追蹤，避免混淆 [cite: 15]。
* **Acceptance Criteria:**
    * [cite_start][AC-001-01]: 使用者介面需顯示當前帳戶狀態，且支援 MCF, FTMO (考試倉) 與 BingX (真倉) [cite: 17-18]。
    * [cite_start][AC-001-02]: 切換帳戶後，儀表板數據需即時刷新為該帳戶資訊 [cite: 19]。
* **Traceability:** Maps to [REQ-FUNC-001]
* **Priority:** P0

**[US-002] 每日虧損監控與警示**
* **As a** 交易員
* **I want to** 在首頁看到今日已實現虧損佔總餘額的百分比與視覺化進度條
* [cite_start]**So that** 我能防止帳戶爆倉或違反 Prop Firm 規則 [cite: 21-22]。
* **Acceptance Criteria:**
    * [cite_start][AC-002-01]: 顯示「今日已實現虧損」百分比 [cite: 22]。
    * [cite_start][AC-002-02]: 進度條達到 60% 顯示黃色警告；達到 80% 顯示紅色閃爍 [cite: 25]。
* **Traceability:** Maps to [REQ-FUNC-002]
* **Priority:** P0

**[US-003] 交易策略與錯誤標籤管理**
* **As a** Admin
* **I want to** 統一維護「策略管理」與「錯誤歸因」的標籤庫
* [cite_start]**So that** 所有交易紀錄的數據標準化，便於日後統計高勝率策略或計算情緒化交易的代價 [cite: 27, 30]。
* **Acceptance Criteria:**
    * [cite_start][AC-003-01]: Admin 可新增、編輯、刪除進場策略標籤 (如 SMC Order Block) [cite: 28]。
    * [cite_start][AC-003-02]: Admin 可新增、編輯、刪除錯誤歸因標籤 (如 FOMO) [cite: 29]。
* **Traceability:** Maps to [REQ-FUNC-003]
* **Priority:** P1

**[US-004] 交易紀錄日誌 (Journaling)**
* **As a** 交易員
* **I want to** 新增一筆交易紀錄，包含價格、多選策略標籤與多選錯誤標籤
* [cite_start]**So that** 我能詳細復盤每一筆交易的執行細節與結果 [cite: 31-32]。
* **Acceptance Criteria:**
    * [cite_start][AC-004-01]: 支援輸入日期、商品、方向、進場價、SL、TP 等基礎資訊 [cite: 33-34]。
    * [cite_start][AC-004-02]: 「進場策略」與「犯錯標籤」欄位必須支援多選 (Multi-select) [cite: 36-37]。
    * [cite_start][AC-004-03]: 支援上傳 TradingView 連結與圖片 [cite: 39]。
* **Traceability:** Maps to [REQ-FUNC-004]
* **Priority:** P0

# 5. 功能需求 (Functional Requirements - CMMI Format)

**[REQ-FUNC-001] 帳戶體系與切換**
* [cite_start]**Description:** 系統應 (The system shall) 提供多帳戶管理功能，嚴格區分「考試倉」與「真倉」，並允許使用者在全局範圍內切換當前操作帳戶 [cite: 15, 19]。
* **Input:** 帳戶類型選擇 (Challenge/Live)、廠商名稱 (MCF, FTMO, BingX 等)。
* **Process:**
    1.  驗證帳戶類型合法性。
    2.  切換 session context 至選定帳戶。
    3.  過濾並重新載入與該帳戶關聯的交易數據。
* **Output:** 更新後的儀表板與交易列表。
* **Verification Method:** Demonstration (演示)
* **Derived from:** [US-001]
* **Priority:** P0

**[REQ-FUNC-002] 風險控管儀表板計算**
* [cite_start]**Description:** 系統應 (The system shall) 計算今日已實現虧損佔帳戶總餘額之百分比，並依據閾值改變 UI 顯示狀態 [cite: 22, 25]。
* **Input:** 今日所有已平倉交易之 PnL 總和、帳戶初始餘額。
* **Process:**
    1.  計算 `Current_Loss_Percentage = (Sum(Daily_Realized_Loss) / Account_Balance) * 100%`.
    2.  若 `Current_Loss_Percentage` >= 60%，設定狀態為 Warning (Yellow)。
    3.  [cite_start]若 `Current_Loss_Percentage` >= 80%，設定狀態為 Danger (Red/Blinking) [cite: 25]。
* **Output:** 帶有顏色狀態的進度條與百分比數值。
* **Verification Method:** Test (測試) - 邊界值測試
* **Derived from:** [US-002]
* **Priority:** P0

**[REQ-FUNC-003] 標籤庫管理 (CRUD)**
* [cite_start]**Description:** 系統應 (The system shall) 允許 Admin 角色建立與維護標準化的策略標籤與錯誤標籤庫，並強制 User 在輸入時從庫中選取 [cite: 27]。
* **Input:** 標籤名稱、標籤類型 (Strategy/Mistake)。
* **Process:** 儲存標籤至資料庫集合，確保唯一性。
* **Output:** 更新後的標籤選單。
* **Verification Method:** Test (測試)
* **Derived from:** [US-003]
* **Priority:** P1

**[REQ-FUNC-004] 交易紀錄新增與多選標籤**
* [cite_start]**Description:** 系統應 (The system shall) 提供交易輸入介面，支援文字欄位、數值欄位及多選標籤 (Multi-select) UI [cite: 32, 48]。
* [cite_start]**Input:** 交易明細 (Symbol, Direction, Prices)、策略標籤 ID 列表、錯誤標籤 ID 列表、圖片/連結 [cite: 33-39]。
* **Process:**
    1.  驗證必要欄位 (如日期、商品、盈虧金額)。
    2.  將多個標籤 ID 關聯至該筆交易紀錄。
    3.  計算盈虧比 (R:R) 與獲利因子 (若適用)。
* **Output:** 交易儲存成功確認，並更新統計數據。
* **Verification Method:** Inspection (檢查)
* **Derived from:** [US-004]
* **Priority:** P0

**[REQ-FUNC-005] 盈虧日曆視覺化**
* [cite_start]**Description:** 系統應 (The system shall) 以月曆形式呈現每日損益，獲利日顯示綠色，虧損日顯示紅色 [cite: 41]。
* **Input:** 指定月份之每日 PnL 加總。
* **Process:** 依據 PnL 正負值渲染對應日期的背景顏色 (Green/Red)。
* **Output:** 視覺化日曆元件。
* **Verification Method:** Demonstration (演示)
* **Derived from:** US-Implicit
* **Priority:** P1

# 6. 非功能需求 (Non-Functional Requirements)

**[REQ-NFR-001] 前端操作流暢性**
* [cite_start]**Description:** 系統應使用 React 框架開發，特別優化多選標籤 (Multi-select) 的操作體驗 [cite: 48]。
* **Metric:** 標籤選單開啟與篩選延遲 < 100ms。
* **Verification Method:** Test (效能測試)

**[REQ-NFR-002] 統計數據讀取效能**
* [cite_start]**Description:** 系統應使用 Redis 快取統計數據，以加速儀表板載入速度 [cite: 50]。
* **Metric:** 儀表板主要統計數據 (Win Rate, Profit Factor) 載入時間 < 1秒。
* **Verification Method:** Test (效能測試)

**[REQ-NFR-003] 環境隔離**
* [cite_start]**Description:** 系統部署應支援 Docker 容器化，並透過設定檔 (.local / .prod) 嚴格區分開發與正式環境資料庫 [cite: 53-56]。
* [cite_start]**Metric:** 執行 `deploy.sh` 腳本可自動化完成 Build 到 Deploy 流程且無人工介入錯誤 [cite: 57]。
* **Verification Method:** Analysis (分析) - 架構審查

# 7. 需求追溯矩陣 (RTM - Snapshot)

| User Story ID | Story Title | Functional Req ID | Non-Functional Req ID | Acceptance Criteria |
| :--- | :--- | :--- | :--- | :--- |
| US-001 | 多帳戶切換與管理 | REQ-FUNC-001 | REQ-NFR-003 | AC-001-01, AC-001-02 |
| US-002 | 每日虧損監控與警示 | REQ-FUNC-002 | REQ-NFR-002 | AC-002-01, AC-002-02 |
| US-003 | 交易策略與錯誤標籤管理 | REQ-FUNC-003 | - | AC-003-01, AC-003-02 |
| US-004 | 交易紀錄日誌 | REQ-FUNC-004 | REQ-NFR-001 | AC-004-01, AC-004-02, AC-004-03 |

# 8. 驗證與確認 (Verification & Validation)

## 8.1 INVEST 原則檢核
* **Independent**: 各模組 (如風控儀表板、日誌) 可獨立開發。
* [cite_start]**Negotiable**: 支援廠商 (FTMO, BingX) 預留了擴充性，細節可協商 [cite: 17-18]。
* [cite_start]**Valuable**: 核心功能直接對應「通過考核」與「修正行為」之商業目標 [cite: 7, 9]。
* [cite_start]**Testable**: 風控閾值 (60%, 80%) 與顏色警示具備明確的驗收標準 [cite: 25]。