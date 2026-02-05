import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.models.broker import Broker
from app.services.broker_service import BrokerService
from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
import jwt
from datetime import datetime, timedelta

BROKERS_PATH = f"{settings.API_V1_STR}/brokers"


def _token(sub: str, role: str = "user") -> str:
    return jwt.encode(
        {"sub": sub, "role": role, "exp": datetime.utcnow() + timedelta(minutes=5)},
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )


@pytest.fixture(autouse=True)
async def init_test_db():
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    await init_beanie(
        database=client["test_tradeledgerx"],
        document_models=[Broker],
    )
    yield
    await Broker.delete_all()


@pytest.mark.asyncio
async def test_list_active_service():
    await Broker(code="FTMO", name="FTMO", sort_order=0, is_active=True).insert()
    await Broker(code="X", name="Inactive", sort_order=1, is_active=False).insert()
    active = await BrokerService.list_active()
    assert len(active) == 1
    assert active[0].code == "FTMO"


@pytest.mark.asyncio
async def test_get_brokers_200_any_user():
    await Broker(code="FTMO", name="FTMO", sort_order=0, is_active=True).insert()
    token = _token("any_user")
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.get(BROKERS_PATH, headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    assert data[0]["code"] == "FTMO"
    assert data[0]["name"] == "FTMO"
    assert "id" in data[0]


@pytest.mark.asyncio
async def test_get_brokers_401_no_token():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.get(BROKERS_PATH)
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_post_brokers_201_admin():
    token = _token("admin_user", role="admin")
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.post(
            BROKERS_PATH,
            json={"code": "MCF", "name": "MCF Pro", "sort_order": 10, "is_active": True},
            headers={"Authorization": f"Bearer {token}"},
        )
    assert resp.status_code == 201
    data = resp.json()
    assert data["code"] == "MCF"
    assert data["name"] == "MCF Pro"
    assert data["is_active"] is True
    assert "id" in data


@pytest.mark.asyncio
async def test_post_brokers_403_non_admin():
    token = _token("normal_user", role="user")
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.post(
            BROKERS_PATH,
            json={"code": "NEW", "name": "New Broker"},
            headers={"Authorization": f"Bearer {token}"},
        )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_post_brokers_400_duplicate_code():
    await Broker(code="FTMO", name="FTMO", is_active=True).insert()
    token = _token("admin_user", role="admin")
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.post(
            BROKERS_PATH,
            json={"code": "FTMO", "name": "Duplicate"},
            headers={"Authorization": f"Bearer {token}"},
        )
    assert resp.status_code == 400


@pytest.mark.asyncio
async def test_get_broker_by_id_200():
    b = await Broker(code="BINGX", name="BingX", is_active=True).insert()
    token = _token("user1")
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.get(
            f"{BROKERS_PATH}/{b.id}",
            headers={"Authorization": f"Bearer {token}"},
        )
    assert resp.status_code == 200
    data = resp.json()
    assert data["id"] == str(b.id)
    assert data["code"] == "BINGX"


@pytest.mark.asyncio
async def test_patch_broker_200_admin():
    b = await Broker(code="BYBIT", name="Bybit", is_active=True).insert()
    token = _token("admin_user", role="admin")
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.patch(
            f"{BROKERS_PATH}/{b.id}",
            json={"name": "Bybit Updated", "sort_order": 5},
            headers={"Authorization": f"Bearer {token}"},
        )
    assert resp.status_code == 200
    data = resp.json()
    assert data["name"] == "Bybit Updated"
    assert data["sort_order"] == 5


@pytest.mark.asyncio
async def test_delete_broker_204_soft():
    b = await Broker(code="DEL", name="ToDelete", is_active=True).insert()
    token = _token("admin_user", role="admin")
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.delete(
            f"{BROKERS_PATH}/{b.id}",
            headers={"Authorization": f"Bearer {token}"},
        )
    assert resp.status_code == 204
    found = await Broker.get(b.id)
    assert found is not None
    assert found.is_active is False
