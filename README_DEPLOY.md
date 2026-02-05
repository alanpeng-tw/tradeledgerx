# TradeLedgerX 部署指南 (Deployment Guide)

本指南說明如何在本地端啟動應用程式 (Local Deployment)，以及如何將其部署至 GCP Cloud Run。

## 架構說明 (Architecture)

我們採用 **單一 app 容器** 架構：前端與後端在同一容器，**Redis 為外部服務**（本地用 docker-compose 的 redis；上線用 GCP Memorystore）。

-   **Frontend**: React (Vite) 應用，構建為靜態檔案。
-   **Backend**: Python FastAPI，負責 API 請求並提供前端靜態檔案 (Serve Static Files)。
-   **Redis**: **外部**，用於 Session 與快取。本地：docker-compose 的 `redis` service；**GCP Cloud Run：請使用 Memorystore for Redis**，並設定 `REDIS_URL`。
-   **Database**: 連接外部 MongoDB Atlas。

---

## 1. 本地啟動 (Local Deployment)

在本地端，我們使用 Docker Compose 來模擬生產環境的容器運行。

### 前置作業
確保您已安裝 [Docker Desktop](https://www.docker.com/products/docker-desktop/)。

### 步驟
1.  **設定環境變數**:
    打開 `backend/app/core/config.py`，確認 `MONGODB_URL` 已設定正確 (指向 MongoDB Atlas)。

2.  **啟動服務**:
    在專案根目錄 (`TradeLedgerX/`) 執行以下指令：

    ```sh
    docker-compose up --build
    ```

3.  **訪問應用程式**:
    -   打開瀏覽器訪問: [http://localhost:8080](http://localhost:8080)
    -   API 文件: [http://localhost:8080/docs](http://localhost:8080/docs)

    此時，您看到的是已經打包好的生產環境版本。

---

## 2. 部署至 GCP Cloud Run (GCP Deployment)

### 前置作業
-   擁有 GCP 帳號與專案。
-   安裝並設定 [gcloud CLI](https://cloud.google.com/sdk/docs/install)。
-   啟用必要的 API:
    ```sh
    gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com
    ```

### 步驟 A: 建立 Artifact Registry
如果在 GCP 上還沒有 Docker 倉庫，請先建立一個：

```sh
# 設定變數 (請替換為您的專案 ID 和區域)
export PROJECT_ID="your-project-id"
export REGION="asia-east1" # 建議選擇台灣 (asia-east1)

gcloud artifacts repositories create tradeledgerx-repo \
    --repository-format=docker \
    --location=$REGION \
    --description="Docker repository for TradeLedgerX"
```

### 步驟 B: 構建並推送映像檔 (Build & Push)

使用 Cloud Build 直接在雲端構建 (推薦)，或者本地構建後推送。

**方法 1: 使用 Cloud Build (推薦)**
```sh
gcloud builds submit --tag $REGION-docker.pkg.dev/$PROJECT_ID/tradeledgerx-repo/tradeledgerx:latest .
```
*(注意指令最後有一個點 `.`，代表當前目錄)*

### 步驟 C: Redis（Session）— 使用 Memorystore

Cloud Run 為無狀態、可多實例，**Session 必須存在共用 Redis**，建議使用 **Google Cloud Memorystore for Redis**。

1. 在 GCP Console 建立 Memorystore (Redis) 實例（與 Cloud Run 同 VPC 或設定 VPC 連線）。
2. 取得連線字串（例如 `redis://10.x.x.x:6379`）。
3. 部署時將 `REDIS_URL` 設為該連線字串（見步驟 D）。

若暫不建 Memorystore，可先不設 `REDIS_URL` 或設為空，則登入 Session 會失敗；其餘 API 仍可依需求運作。

### 步驟 D: 部署至 Cloud Run

將剛剛構建的映像檔部署為 Cloud Run 服務，並設定環境變數（含 `REDIS_URL` 指向 Memorystore）。

```sh
gcloud run deploy tradeledgerx-service \
    --image $REGION-docker.pkg.dev/$PROJECT_ID/tradeledgerx-repo/tradeledgerx:latest \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --port 8080 \
    --memory 1Gi \
    --cpu 1 \
    --set-env-vars "REDIS_URL=redis://YOUR_MEMORYSTORE_IP:6379" \
    --set-env-vars "MONGODB_URL=your-mongodb-atlas-connection-string"
```

-   `--allow-unauthenticated`: 允許公開訪問 (Public access)。
-   `--port 8080`: 容器監聽的端口 (Dockerfile 中 EXPOSE 8080)。
-   `--memory 1Gi`: 根據需求調整記憶體。
-   `REDIS_URL`: 必須指向 **Memorystore for Redis** 的連線位址，多實例才會共用 Session。

### 部署完成
指令執行成功後，會顯示 `Service URL` (例如 `https://tradeledgerx-service-TxYz.a.run.app`)。點擊該網址即可使用您的應用程式！

---

## 常見問題 (FAQ)

**Q: 為什麼不用 app 容器裡的 Redis 或單獨的 redis 容器部署到 Cloud Run？**
A: **不建議**。(1) **app 容器內 Redis**：Cloud Run 會依流量開多個實例，每個實例有各自的 Redis，Session 不共用，使用者可能一下 200 一下 401。(2) **單獨 redis 容器**：Cloud Run 一個服務對一個容器，且適合無狀態應用；Redis 是有狀態的，不適合當一般 Cloud Run 服務跑。**建議**：app 部署到 Cloud Run，Redis 使用 **GCP Memorystore for Redis**，所有實例共用同一台 Redis，Session 才正確。

**Q: Cloud Run 上的 Session 會不見嗎？**
A: Session 存在 **Memorystore (Redis)**，不會因為 Cloud Run 實例重啟或縮減為 0 而消失；只要 Memorystore 連線正常，Session 會依 TTL 過期。

**Q: 前端如何知道 API 的網址？**
A: 在 Dockerfile 中，我們設定了 `ENV VITE_API_URL=/api/v1`。這表示前端會向「當前網域」的 `/api/v1` 發送請求。由於前端和後端在同一個網域 (同一個容器) 下，這完全沒問題，且避免了 CORS 問題。
