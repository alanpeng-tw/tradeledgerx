# Redis 與 Session 查看方式

## 為什麼會有「app 容器裡的 Redis」和「redis 容器」兩台？

- **redis 容器**：`docker-compose.yml` 裡獨立的 **redis** service，後端用 `REDIS_URL=redis://redis:6379` 連這台，**session 都寫在這裡**。
- **app 容器裡的 Redis**：Dockerfile 用 **supervisord** 在同一個容器裡同時跑 `redis-server` 和 `uvicorn`（見 `supervisord.conf`），所以 app 容器一啟動，裡面就有一個 Redis。但後端設定是連 **redis 容器**，所以**不會**用自己容器裡這台，等於多餘的。
- 總結：兩台是不同時期的設計——先有「一個容器包全部」（supervisord 跑 redis + app），後來又加了獨立的 redis service 並改連那台，所以現在 app 容器裡那台 Redis 沒被用到；查 session 請用 **redis 容器**。

## 登入後 Session 存在哪裡？

- 後端在 **POST /api/v1/login** 成功時，會把 session 寫入 **Redis**（key: `session:{session_id}`，value: JSON `{"sub","role","username"}`），並在 response 設定 **Cookie `session_id`**。
- 之後瀏覽器每次請求會帶上這個 cookie，後端從 Redis 讀出 session 辨識使用者。

## 為什麼 Another Redis Desktop Manager 點進去是空的？

**常見原因：ARDM 連到的是「本機 Mac 的 Redis」，不是 Docker 的 Redis。**

- 若你本機有裝 Redis（例如 `brew install redis` 且 `brew services start redis`），它會佔用 **localhost:6379**。
- Docker 的 redis 容器也會映射 **6379** 到本機；在 Mac 上可能出現：**本機 Redis 佔 127.0.0.1:6379，ARDM 連 localhost 時會連到本機那台**，所以看到的是空的（session 在 Docker 那台）。
- **怎麼確認**：在終端執行 `docker compose exec redis redis-cli KEYS 'session:*'`，若有列出 key，代表 **Docker Redis 有資料**，但 ARDM 若顯示「No Data」就是連錯台。

**解法（擇一）：**

1. **關掉本機 Redis**，讓 localhost:6379 只給 Docker 用，ARDM 再連 localhost:6379 就會看到 Docker 的 key。  
   - 關閉：`brew services stop redis`（或手動關掉本機的 redis-server）。
2. **本機 Redis 改用其他 port**（例如 6380），這樣 6379 就只會是 Docker，ARDM 連 localhost:6379 即可。

## 用指令看 Redis 裡的 session

**本專案 docker-compose 有獨立的 `redis` service：**

- 後端連的是 **`redis://redis:6379`**（即 **`redis` 這個 container** 裡的 Redis），session 都寫在這裡。
- 請**一定要用 `redis` container** 執行 redis-cli，才會看到 session：

```bash
docker compose exec redis redis-cli KEYS 'session:*'
docker compose exec redis redis-cli GET 'session:<上一個指令列出的某個 key>'
```

**不要用 `app` container 查：**

- 若執行 `docker compose exec app redis-cli KEYS 'session:*'` 會得到 **(empty array)**。
- 原因是：app 容器裡可能也跑了一個 Redis（例如 supervisord），`exec app redis-cli` 連的是 **app 容器內部的 Redis**（localhost:6379），和後端實際使用的 **`redis` 容器** 是**兩台不同的 Redis**；session 只寫在 `redis` 容器裡，所以用 `app` 查會是空的。
- 結論：查 session 請用 **`docker compose exec redis redis-cli`**，不要用 `app`。

## 401 與 Cookie

- 若 **POST /login 200** 但 **GET /accounts、GET /me 一直 401**：代表瀏覽器**沒有帶上 session cookie**。
- 已做修正：前端 axios 已設 **withCredentials: true**，後端 CORS 已改為允許的 origin 列表（並支援 credentials）。請重建/重啟前後端後再試。
- 若前後端網址不在後端允許的 origin 裡（例如用別的 port），請在後端設定 `BACKEND_CORS_ORIGINS`（逗號分隔或 JSON 陣列）加入該網址。
