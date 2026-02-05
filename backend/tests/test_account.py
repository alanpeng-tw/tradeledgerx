import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.models.account import Account, AccountType
from app.services.account_service import AccountService
from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
import jwt
from datetime import datetime, timedelta

ACCOUNTS_PATH = f"{settings.API_V1_STR}/accounts"


def _token(sub: str) -> str:
    return jwt.encode(
        {"sub": sub, "role": "user", "exp": datetime.utcnow() + timedelta(minutes=5)},
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )

# Fixture to initialize DB for testing (if not using global override)
# pytest-asyncio and beanie require some setup.
# For simplicity in this environment, we might rely on the app lifespan if using TestClient correctly with ASGITransport,
# but usually for DB tests we want explicit control.
# Beanie recommends initializing in a fixture.

@pytest.fixture(autouse=True)
async def init_test_db():
    # Setup
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    # Use a test database to avoid messing with real data
    await init_beanie(
        database=client["test_tradeledgerx"],
        document_models=[Account]
    )
    yield
    # Teardown: drop collection
    await Account.delete_all()

@pytest.mark.asyncio
async def test_account_creation():
    acc = Account(
        name="Test Account",
        broker="FTMO",
        type=AccountType.CHALLENGE,
        balance=10000.0,
        user_id="user123"
    )
    await acc.create()
    
    saved_acc = await Account.find_one(Account.name == "Test Account")
    assert saved_acc
    assert saved_acc.broker == "FTMO"
    assert saved_acc.balance == 10000.0

@pytest.mark.asyncio
async def test_get_user_accounts_service():
    # Create two accounts for user123
    await Account(
        name="Acc 1", broker="FTMO", type=AccountType.CHALLENGE, balance=5000, user_id="user123"
    ).create()
    await Account(
        name="Acc 2", broker="BINGX", type=AccountType.LIVE, balance=500, user_id="user123"
    ).create()
    
    # Create one for another user
    await Account(
        name="Acc 3", broker="BYBIT", type=AccountType.LIVE, balance=1000, user_id="other"
    ).create()
    
    accounts = await AccountService.get_user_accounts("user123")
    assert len(accounts) == 2
    assert all(a.user_id == "user123" for a in accounts)

@pytest.mark.asyncio
async def test_api_get_accounts():
    # Setup data
    await Account(
        name="API Acc", broker="META_TRADER", type=AccountType.LIVE, balance=200, user_id="api_user"
    ).create()
    
    token = jwt.encode(
        {"sub": "api_user", "exp": datetime.utcnow() + timedelta(minutes=5)},
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )
    
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.get(
            ACCOUNTS_PATH,
            headers={"Authorization": f"Bearer {token}"}
        )
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["name"] == "API Acc"
        assert data[0]["broker"] == "META_TRADER"


# --- Story 2-2: Account CRUD and Status/Notes ---

@pytest.mark.asyncio
async def test_post_accounts_201():
    token = _token("crud_user")
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.post(
            ACCOUNTS_PATH,
            json={
                "name": "FTMO Exam",
                "broker": "FTMO",
                "type": "CHALLENGE",
                "balance": 100000,
                "initial_balance": 100000,
                "daily_loss_limit": 5,
                "currency": "USD",
            },
            headers={"Authorization": f"Bearer {token}"},
        )
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "FTMO Exam"
    assert data["broker"] == "FTMO"
    assert data["type"] == "CHALLENGE"
    assert data["balance"] == 100000
    assert data["status"] == "ACTIVE"
    assert "id" in data


@pytest.mark.asyncio
async def test_get_account_by_id_200():
    acc = await Account(
        name="Single", broker="FTMO", type=AccountType.CHALLENGE, balance=5000, user_id="owner1"
    ).create()
    token = _token("owner1")
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.get(
            f"{ACCOUNTS_PATH}/{acc.id}",
            headers={"Authorization": f"Bearer {token}"},
        )
    assert resp.status_code == 200
    data = resp.json()
    assert data["id"] == str(acc.id)
    assert data["name"] == "Single"


@pytest.mark.asyncio
async def test_get_account_by_id_404_other_user():
    acc = await Account(
        name="Other", broker="BINGX", type=AccountType.LIVE, balance=100, user_id="other_user"
    ).create()
    token = _token("different_user")
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.get(
            f"{ACCOUNTS_PATH}/{acc.id}",
            headers={"Authorization": f"Bearer {token}"},
        )
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_patch_account_200_status_notes():
    acc = await Account(
        name="ToUpdate", broker="FTMO", type=AccountType.CHALLENGE, balance=10000, user_id="patch_user"
    ).create()
    token = _token("patch_user")
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.patch(
            f"{ACCOUNTS_PATH}/{acc.id}",
            json={"status": "FAILED", "notes": "爆倉"},
            headers={"Authorization": f"Bearer {token}"},
        )
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "FAILED"
    assert data["notes"] == "爆倉"


@pytest.mark.asyncio
async def test_patch_account_404_other_user():
    acc = await Account(
        name="OtherAcc", broker="BYBIT", type=AccountType.LIVE, balance=200, user_id="owner_x"
    ).create()
    token = _token("owner_y")
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.patch(
            f"{ACCOUNTS_PATH}/{acc.id}",
            json={"name": "Hacked"},
            headers={"Authorization": f"Bearer {token}"},
        )
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_delete_account_204():
    acc = await Account(
        name="ToDelete", broker="FTMO", type=AccountType.CHALLENGE, balance=5000, user_id="del_user"
    ).create()
    token = _token("del_user")
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.delete(
            f"{ACCOUNTS_PATH}/{acc.id}",
            headers={"Authorization": f"Bearer {token}"},
        )
    assert resp.status_code == 204
    found = await Account.get(acc.id)
    assert found is None


@pytest.mark.asyncio
async def test_delete_account_404_other_user():
    acc = await Account(
        name="OtherDel", broker="BINGX", type=AccountType.LIVE, balance=100, user_id="del_owner"
    ).create()
    token = _token("other_del")
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.delete(
            f"{ACCOUNTS_PATH}/{acc.id}",
            headers={"Authorization": f"Bearer {token}"},
        )
    assert resp.status_code == 404
    found = await Account.get(acc.id)
    assert found is not None
