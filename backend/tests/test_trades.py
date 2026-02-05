import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.models.trade import Trade, Direction, TradeStatus
from app.models.tag import Tag, TagType
from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
import jwt
from datetime import datetime, timedelta

@pytest.fixture(autouse=True)
async def init_test_db():
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    await init_beanie(
        database=client["test_tradeledgerx_trades"],
        document_models=[Trade, Tag]
    )
    yield
    await Trade.delete_all()
    await Tag.delete_all()

def create_token(user_id: str, role: str = "user") -> str:
    return jwt.encode(
        {"sub": user_id, "role": role, "exp": datetime.utcnow() + timedelta(minutes=5)},
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )

@pytest.mark.asyncio
async def test_trade_calculation():
    # Test Auto Calc logic directly on model
    trade = Trade(
        account_id="acc1",
        symbol="EURUSD",
        direction=Direction.LONG,
        entry_date=datetime.utcnow(),
        entry_price=1.1000,
        quantity=100000,
        sl=1.0900, # Risk 100 pips
        tp=1.1200  # Reward 200 pips
    )
    trade.calculate_metrics()
    await trade.save()
    assert trade.planned_rr == 2.0
    assert trade.status == TradeStatus.OPEN
    
    # Update with exit
    trade.exit_price = 1.1100
    trade.calculate_metrics()
    await trade.save()
    
    assert trade.status == TradeStatus.CLOSED
    # PnL = (1.1100 - 1.1000) * 100000 = 0.0100 * 100000 = 1000
    assert trade.realized_pnl == pytest.approx(1000.0)

@pytest.mark.asyncio
async def test_trade_tag_validation():
    token = create_token("user1")
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.post(
            f"{settings.API_V1_STR}/trades",
            json={
                "symbol": "BTCUSD",
                "direction": "long", # Case insensitive? Pydantic Enum validation handles it if config allows?
                # Actually Pydantic Enum requires exact match unless configured. Let's send UPPER.
                "direction": "LONG",
                "entry_date": datetime.utcnow().isoformat(),
                "entry_price": 50000,
                "quantity": 1,
                "tags": ["fakeid1234"] # Invalid ID format or non-existent
            },
            headers={"Authorization": f"Bearer {token}", "X-Account-ID": "acc1"}
        )
        # Assuming Pydantic ObjectId validation fails first or our service check
        assert resp.status_code == 400

@pytest.mark.asyncio
async def test_api_account_isolation():
    token = create_token("user1")
    
    # Create trade in acc1
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        await ac.post(
            f"{settings.API_V1_STR}/trades",
            json={
                "symbol": "AAPL",
                "direction": "LONG",
                "entry_date": datetime.utcnow().isoformat(),
                "entry_price": 150,
                "quantity": 10
            },
            headers={"Authorization": f"Bearer {token}", "X-Account-ID": "acc1"}
        )
        
        # Get trades for acc1 using filter
        resp1 = await ac.get(
            f"{settings.API_V1_STR}/trades",
            headers={"Authorization": f"Bearer {token}", "X-Account-ID": "acc1"}
        )
        assert len(resp1.json()) == 1
        
        # Get trades for acc2
        resp2 = await ac.get(
            f"{settings.API_V1_STR}/trades",
            headers={"Authorization": f"Bearer {token}", "X-Account-ID": "acc2"}
        )
        assert len(resp2.json()) == 0
