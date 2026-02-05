from redis import asyncio as aioredis
from app.core.config import settings

async def get_redis_client():
    redis = await aioredis.from_url(
        settings.REDIS_URL,
        encoding="utf-8",
        decode_responses=True
    )
    return redis
