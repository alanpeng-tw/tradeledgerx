import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.models.account import Account, AccountType
from app.models.trade import Trade, Direction, TradeStatus
from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
import jwt
from datetime import datetime, timedelta, timezone

@pytest.fixture(autouse=True)
async def init_test_db():
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    await init_beanie(
        database=client["test_tradeledgerx_risk"],
        document_models=[Account, Trade]
    )
    yield
    await Account.delete_all()
    await Trade.delete_all()

def create_token(user_id: str) -> str:
    return jwt.encode(
        {"sub": user_id, "exp": datetime.utcnow() + timedelta(minutes=5)},
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )

@pytest.mark.asyncio
async def test_risk_daily_status_calculation():
    # Setup Account: 100,000 balance, 5% limit (5000 max loss)
    acc = Account(
        name="RiskTest",
        broker="FTMO",
        type=AccountType.CHALLENGE,
        balance=100000,
        initial_balance=100000,
        daily_loss_limit=5.0,
        user_id="user_risk"
    )
    await acc.create()
    acc_id = str(acc.id)
    
    # 1. Trade Today (Loss) -1000 (Usage 20%)
    now_utc = datetime.now(timezone.utc)
    t1 = Trade(
        account_id=acc_id,
        symbol="EURUSD",
        direction=Direction.LONG,
        entry_date=now_utc,
        entry_price=1.1000,
        quantity=1,
        exit_date=now_utc,
        exit_price=0.1000, # Big loss conceptually, but let's just force PnL
        realized_pnl=-1000,
        status=TradeStatus.CLOSED
    )
    await t1.save()
    
    # 2. Trade Yesterday (Loss) -5000 (Should be ignored)
    yesterday = now_utc - timedelta(days=1)
    t2 = Trade(
        account_id=acc_id,
        symbol="GBPUSD",
        direction=Direction.LONG,
        entry_date=yesterday,
        entry_price=1.2000,
        quantity=1,
        exit_date=yesterday,
        realized_pnl=-5000,
        status=TradeStatus.CLOSED
    )
    await t2.save()
    
    # 3. Trade Today (Profit) +2000 (Should be ignored, minimal conservative mode)
    t3 = Trade(
        account_id=acc_id,
        symbol="USDJPY",
        direction=Direction.LONG,
        entry_date=now_utc,
        entry_price=150.00,
        quantity=1,
        exit_date=now_utc,
        realized_pnl=2000,
        status=TradeStatus.CLOSED
    )
    await t3.save()
    
    # Call API
    token = create_token("user_risk")
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.get(
            f"{settings.API_V1_STR}/risk/daily-status",
            headers={"Authorization": f"Bearer {token}", "X-Account-ID": acc_id}
        )
        assert resp.status_code == 200
        data = resp.json()
        
        # Expect daily loss = 1000 (only t1)
        assert data["daily_loss"] == 1000.0
        assert data["limit_amount"] == 5000.0
        assert data["percent_used"] == 20.0
        assert data["status"] == "SAFE"

@pytest.mark.asyncio
async def test_risk_status_thresholds():
    acc = Account(
        name="ThresholdTest", broker="FTMO", type=AccountType.CHALLENGE,
        balance=100000, initial_balance=100000, daily_loss_limit=5.0, user_id="user_risk"
    )
    await acc.create()
    acc_id = str(acc.id)
    now_utc = datetime.now(timezone.utc)
    
    # Loss -3500 (3.5% / 5% = 70% Usage -> WARNING)
    t1 = Trade(
        account_id=acc_id, symbol="TEST", direction=Direction.LONG,
        entry_date=now_utc, entry_price=1, quantity=1,
        exit_date=now_utc, realized_pnl=-3500, status=TradeStatus.CLOSED
    )
    await t1.save()
    
    token = create_token("user_risk")
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.get(
            f"{settings.API_V1_STR}/risk/daily-status",
            headers={"Authorization": f"Bearer {token}", "X-Account-ID": acc_id}
        )
        data = resp.json()
        assert data["percent_used"] == 70.0
        assert data["status"] == "WARNING"
        
    # Add another loss -1000 -> Total -4500 (4.5% / 5% = 90% Usage -> DANGER)
    t2 = Trade(
        account_id=acc_id, symbol="TEST2", direction=Direction.LONG,
        entry_date=now_utc, entry_price=1, quantity=1,
        exit_date=now_utc, realized_pnl=-1000, status=TradeStatus.CLOSED
    )
    await t2.save()
    
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.get(
            f"{settings.API_V1_STR}/risk/daily-status",
            headers={"Authorization": f"Bearer {token}", "X-Account-ID": acc_id}
        )
        data = resp.json()
        assert data["percent_used"] == 90.0
        assert data["status"] == "DANGER"
