"""
建立預設管理者帳號 (alanpeng / 123456)。
在 backend 目錄下執行: poetry run python scripts/create_admin.py
"""
import asyncio
import sys
from pathlib import Path

# 讓 app 可被 import
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie

from app.core.config import settings
from app.models.user import User
from app.routers.auth import hash_password


async def main():
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    await init_beanie(database=client[settings.MONGODB_DB_NAME], document_models=[User])

    existing = await User.find_one(User.username == "alanpeng")
    if existing:
        print("管理者 alanpeng 已存在，略過建立。")
        return

    user = User(
        username="alanpeng",
        hashed_password=hash_password("123456"),
        role="admin",
    )
    await user.insert()
    print("已建立管理者帳號: alanpeng / 123456")


if __name__ == "__main__":
    asyncio.run(main())
