"""
Seed initial brokers (FTMO, BINGX, BYBIT, META_TRADER) into the brokers collection.
Run from backend: poetry run python scripts/seed_brokers.py
"""
import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie

from app.core.config import settings
from app.models.broker import Broker

INITIAL_BROKERS = [
    {"code": "FTMO", "name": "FTMO", "sort_order": 0},
    {"code": "BINGX", "name": "BingX", "sort_order": 1},
    {"code": "BYBIT", "name": "Bybit", "sort_order": 2},
    {"code": "META_TRADER", "name": "Meta Trader", "sort_order": 3},
]


async def main():
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    await init_beanie(database=client[settings.MONGODB_DB_NAME], document_models=[Broker])

    for item in INITIAL_BROKERS:
        existing = await Broker.find_one(Broker.code == item["code"])
        if existing:
            print(f"Broker {item['code']} already exists, skip.")
            continue
        broker = Broker(
            code=item["code"],
            name=item["name"],
            sort_order=item["sort_order"],
            is_active=True,
        )
        await broker.insert()
        print(f"Created broker: {item['code']} ({item['name']})")

    print("Seed brokers done.")


if __name__ == "__main__":
    asyncio.run(main())
