import pytest
import json
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.models.trade import Trade, Direction, TradeStatus
from app.core.redis import get_redis_client
from app.services.analytics_service import AnalyticsService
from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
import jwt
from datetime import datetime, timedelta, timezone

@pytest.fixture(autouse=True)
async def init_test_db():
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    await init_beanie(
        database=client["test_tradeledgerx_analytics"],
        document_models=[Trade]
    )
    # Clear Redis
    redis = await get_redis_client()
    if redis:
        await redis.flushdb()
        
    yield
    await Trade.delete_all()

def create_token(user_id: str) -> str:
    return jwt.encode(
        {"sub": user_id, "exp": datetime.utcnow() + timedelta(minutes=5)},
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )

@pytest.mark.asyncio
async def test_analytics_aggregation():
    acc_id = "acc_analytics"
    now_utc = datetime.now(timezone.utc)
    today = now_utc.strftime("%Y-%m-%d")
    
    # 1. Trade Win +500
    t1 = Trade(
        account_id=acc_id, symbol="WIN", direction=Direction.LONG,
        entry_date=now_utc, entry_price=1, quantity=1,
        exit_date=now_utc, realized_pnl=500, status=TradeStatus.CLOSED
    )
    await t1.save()
    
    # 2. Trade Loss -200
    t2 = Trade(
        account_id=acc_id, symbol="LOSS", direction=Direction.LONG,
        entry_date=now_utc, entry_price=1, quantity=1,
        exit_date=now_utc, realized_pnl=-200, status=TradeStatus.CLOSED
    )
    await t2.save()
    
    # Call service
    month_str = now_utc.strftime("%Y-%m")
    data = await AnalyticsService.get_pnl_calendar(acc_id, month_str)
    
    assert len(data) == 1
    day_stats = data[0]
    assert day_stats["date"] == today
    assert day_stats["total_pnl"] == 300.0  # 500 - 200
    assert day_stats["trade_count"] == 2
    assert day_stats["wins"] == 1
    assert day_stats["losses"] == 1

@pytest.mark.asyncio
async def test_analytics_caching():
    acc_id = "acc_cache"
    redis = await get_redis_client()
    if not redis:
        pytest.skip("Redis not available")
        
    now_utc = datetime.now(timezone.utc)
    month_str = now_utc.strftime("%Y-%m")
    
    # Call 1: Miss -> DB (Empty)
    await AnalyticsService.get_pnl_calendar(acc_id, month_str)
    
    # Check Redis
    key = f"analytics:calendar:{acc_id}:{month_str}"
    cached_val = await redis.get(key)
    assert cached_val is not None
    assert json.loads(cached_val) == []
    
    # Manually inject data into Redis to prove cache hit
    fake_data = [{"date": "2099-01-01", "total_pnl": 9999, "trade_count": 1, "wins": 1, "losses": 0}]
    await redis.set(key, json.dumps(fake_data))
    
    # Call 2: Hit -> Redis
    data = await AnalyticsService.get_pnl_calendar(acc_id, month_str)
    assert data[0]["total_pnl"] == 9999

@pytest.mark.asyncio
async def test_analytics_invalidation():
    acc_id = "acc_inv"
    redis = await get_redis_client()
    if not redis:
        pytest.skip("Redis not available")
    
    now_utc = datetime.now(timezone.utc)
    month_str = now_utc.strftime("%Y-%m")
    
    # 1. Load Cache (Empty)
    await AnalyticsService.get_pnl_calendar(acc_id, month_str)
    key = f"analytics:calendar:{acc_id}:{month_str}"
    assert await redis.exists(key)
    
    # 2. Create New Trade via API (should invalidate)
    token = create_token("user1")
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        await ac.post(
            f"{settings.API_V1_STR}/trades",
            json={
                "symbol": "INV", "direction": "LONG",
                "entry_date": now_utc.isoformat(), "entry_price": 100, "quantity": 10,
                "exit_date": now_utc.isoformat(), "exit_price": 110, # Auto PnL? No service calculates it on save but create endpoint?
                # create endpoint allows basic fields. Metrics calculated on save.
                # But creating a trade invalidates cache anyway.
            },
            headers={"Authorization": f"Bearer {token}", "X-Account-ID": acc_id}
        )
        
    # 3. Check Redis -> Should be gone
    assert not await redis.exists(key)
