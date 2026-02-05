# POST /api/v1/login 完整程式流程追蹤

當你呼叫 `POST /api/v1/login` 並傳入 `username: "alanpeng"`, `password: "hero111"` 時，程式依下列順序執行。

---

## 1. 請求進入應用 (main.py)

- **URL**：`POST /api/v1/login`
- **Router 掛載**：`app.include_router(auth.router, prefix=settings.API_V1_STR)`  
  → 所以 `/api/v1/login` 對應到 **auth.router** 的 **`/login`**（即 `auth.py` 裡的 `@router.post("/login")`）。

請求會先經過 **Middleware**（後加的先執行，所以順序是：先 **RequestLoggingMiddleware**，再 **AuthMiddleware**，再進入 route）。

---

## 2. RequestLoggingMiddleware (middleware/logging_middleware.py)

- 記錄 `request_entry method=POST path=/api/v1/login`。
- 對 `/api/v1/*` 且非 `/health`、`/login` 等路徑會記錄 DB 狀態；**/login 在 SKIP_DB_LOG_PATHS**，所以這裡不記錄 DB。
- 接著 `call_next(request)` 把請求往下一層送。

---

## 3. AuthMiddleware (middleware/auth.py)

- **路徑檢查**：`_path_allowed("/api/v1/login")`  
  - `path == f"{settings.API_V1_STR}/login"` → `/api/v1/login` 在允許清單。
- **結果**：不要求 JWT，直接 `return await call_next(request)`，請求進入 **auth router**。

---

## 4. Auth Router：請求體解析 (routers/auth.py)

- FastAPI 依 **LoginRequest** 解析 JSON body：
  ```python
  class LoginRequest(BaseModel):
      username: str   # "alanpeng"
      password: str   # "hero111"
  ```
- 對應到 `body: LoginRequest`，所以 `body.username == "alanpeng"`, `body.password == "hero111"`。

---

## 5. 依 username 查使用者（MongoDB）

```python
user = await User.find_one(User.username == body.username)
```

- **User** 來自 `app.models.user.User`（Beanie Document）。
- **User.Settings.name = "users"** → 查的是 MongoDB 的 **`users`** collection。
- **等價查詢**：`db.users.findOne({ "username": "alanpeng" })`。
- **結果**：
  - 若沒有這筆 → `user` 為 `None`，後面會打 log `reason=user_not_found` 並回 401。
  - 若有 → `user` 為一筆 User 文件，例如：
    ```python
    user.id              # ObjectId 或對應 _id
    user.username        # "alanpeng"
    user.hashed_password # "$2b$12$NkOR9QY0kFNRMiedlRIvuu..."
    user.role            # "admin"
    ```

---

## 6. 密碼比對（passlib bcrypt）

```python
if not pwd_context.verify(body.password, user.hashed_password):
```

- **pwd_context**：`CryptContext(schemes=["bcrypt"], deprecated="auto")`（passlib + bcrypt）。
- **比對方式**：
  - 第一個參數：**你傳入的明文密碼** → `body.password`，即 **"hero111"**。
  - 第二個參數：**DB 裡該使用者的雜湊** → `user.hashed_password`，即 `"$2b$12$NkOR9QY0kFNRMiedlRIvuu..."`。
- **verify 做的事**：
  - 用 bcrypt 從雜湊中取出 salt 與 cost。
  - 用**同一個演算法**對明文 `"hero111"` 做一次 hash。
  - 比較「剛算出的 hash」與「DB 裡的 hash」是否相同。
- **結果**：
  - **相同** → `verify` 回傳 `True`，不會進 `if`，繼續往下發 JWT。
  - **不同** → `verify` 回傳 `False`，進 `if`，打 log `reason=password_mismatch` 並回 401。

所以你 DB 裡那筆的 `hashed_password` 若是用 **hero111** 產生的，這裡傳 **hero111** 就會通過；若是用 123456 產生的，就要傳 123456。

---

## 7. 登入成功後（通過密碼比對時）

```python
expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
payload = {"sub": str(user.id), "role": user.role, "exp": expire}
token = jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
return LoginResponse(access_token=token, token_type="bearer")
```

- 用 **user.id**、**user.role**、過期時間組 JWT payload。
- 用 **SECRET_KEY**、**ALGORITHM**（HS256）簽成 token。
- 回傳 **200** 與 `{"access_token": "...", "token_type": "bearer"}`。

---

## 8. 回到 RequestLoggingMiddleware

- 收到 response 後記錄 `response_outcome method=POST path=/api/v1/login status=200 outcome=success`（或失敗時 status=401, outcome=error）。

---

## 流程總覽（username: alanpeng, password: hero111）

| 步驟 | 位置 | 行為 |
|------|------|------|
| 1 | main.py | 請求進入 app，router 對應到 auth.router 的 /login |
| 2 | logging_middleware | 記錄 request_entry POST /api/v1/login，call_next |
| 3 | auth middleware | /api/v1/login 在允許清單，不驗 JWT，call_next |
| 4 | auth.py | 解析 body → username="alanpeng", password="hero111" |
| 5 | auth.py | User.find_one(User.username == "alanpeng") → 查 MongoDB users 集合 |
| 6 | auth.py | 若無 user → log user_not_found，401；若有 → 下一步 |
| 7 | auth.py | pwd_context.verify("hero111", user.hashed_password) → bcrypt 比對 |
| 8 | auth.py | 若不符 → log password_mismatch，401；若符合 → 組 JWT，回 200 + access_token |
| 9 | logging_middleware | 記錄 response_outcome status=200 或 401 |

**結論**：帳號是否正確由 **MongoDB `users` 集合裡是否有 `username: "alanpeng"`** 決定；密碼是否正確由 **passlib 的 `pwd_context.verify(明文密碼, user.hashed_password)`** 決定，雜湊必須是當初用**同一個明文密碼**（例如 hero111）經 bcrypt 產生的。
