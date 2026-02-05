"""
檢測登入問題：檢查 MongoDB 裡的使用者與密碼驗證是否正確。
在 backend 目錄執行: poetry run python scripts/check_login.py
或 (虛擬環境): python scripts/check_login.py
"""
import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


async def main():
    username = "alanpeng"
    password = "123456"  # 與 create_admin.py 預設一致

    print(f"1. 連線 MongoDB: {settings.MONGODB_DB_NAME}")
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.MONGODB_DB_NAME]
    users = db["users"]

    print(f"2. 查詢使用者 username = '{username}' ...")
    user = await users.find_one({"username": username})
    if not user:
        print("   ❌ 找不到此使用者。請確認：")
        print("      - 資料庫名稱是否為 tradeledgerx")
        print("      - 集合名稱是否為 users")
        print("      - 是否已新增一筆 username 為 alanpeng 的文件")
        all_users = await users.find({}).to_list(length=10)
        if all_users:
            print(f"   目前 users 集合內共有 {len(all_users)} 筆，第一筆的欄位: {list(all_users[0].keys())}")
        return

    print("   ✓ 找到使用者")
    print(f"   欄位: {list(user.keys())}")

    hashed = user.get("hashed_password") or user.get("hashedPassword")
    if not hashed:
        print("   ❌ 文件中沒有 hashed_password 欄位（注意是底線 hashed_password）")
        return

    print(f"3. 驗證密碼 '{password}' 與雜湊是否相符 ...")
    try:
        ok = pwd_context.verify(password, hashed)
        if ok:
            print("   ✓ 密碼正確，後端驗證會通過")
        else:
            print("   ❌ 密碼不符。可能原因：")
            print("      - 雜湊不是用 123456 產生的")
            print("      - 雜湊複製時被截斷或多了空格")
    except Exception as e:
        print(f"   ❌ 驗證時發生錯誤: {e}")
        print("      (可能是 passlib/bcrypt 版本與產生雜湊時不同)")


if __name__ == "__main__":
    asyncio.run(main())
