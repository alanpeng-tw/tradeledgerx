import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.models.strategy import TradingStrategy
from app.services.strategy_service import StrategyService
from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
import jwt
from datetime import datetime, timezone, timedelta

STRATEGIES_PATH = f"{settings.API_V1_STR}/strategies"


def _token(sub: str) -> str:
    return jwt.encode(
        {"sub": sub, "role": "user", "exp": datetime.utcnow() + timedelta(minutes=5)},
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )


@pytest.fixture(autouse=True)
async def init_test_db():
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    await init_beanie(
        database=client["test_tradeledgerx"],
        document_models=[TradingStrategy],
    )
    yield
    await TradingStrategy.delete_all()


@pytest.mark.asyncio
async def test_strategy_create_service():
    now = datetime.now(timezone.utc)
    s = TradingStrategy(
        user_id="u1",
        name="Scalping",
        description="Quick scalps",
        parameters={"max_hold_min": 5},
        created_at=now,
        updated_at=now,
    )
    await s.insert()
    found = await TradingStrategy.find_one(TradingStrategy.name == "Scalping")
    assert found
    assert found.user_id == "u1"
    assert found.parameters == {"max_hold_min": 5}


@pytest.mark.asyncio
async def test_list_by_user_service():
    await TradingStrategy(user_id="u1", name="S1").insert()
    await TradingStrategy(user_id="u1", name="S2").insert()
    await TradingStrategy(user_id="u2", name="S3").insert()
    list_u1 = await StrategyService.list_by_user("u1")
    assert len(list_u1) == 2
    assert all(s.user_id == "u1" for s in list_u1)


@pytest.mark.asyncio
async def test_post_strategies_201():
    token = _token("strat_user")
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.post(
            STRATEGIES_PATH,
            json={
                "name": "趨勢跟隨",
                "description": "趨勢說明",
                "parameters": {"atr_period": 14},
            },
            headers={"Authorization": f"Bearer {token}"},
        )
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "趨勢跟隨"
    assert data["description"] == "趨勢說明"
    assert data["parameters"] == {"atr_period": 14}
    assert "id" in data


@pytest.mark.asyncio
async def test_post_strategies_422_name_empty():
    token = _token("strat_user")
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.post(
            STRATEGIES_PATH,
            json={"name": "", "description": "ok"},
            headers={"Authorization": f"Bearer {token}"},
        )
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_get_strategies_list_200():
    await TradingStrategy(user_id="list_user", name="L1").insert()
    token = _token("list_user")
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.get(STRATEGIES_PATH, headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    assert data[0]["name"] == "L1"


@pytest.mark.asyncio
async def test_get_strategy_by_id_200():
    s = await TradingStrategy(user_id="owner1", name="Single").insert()
    token = _token("owner1")
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.get(
            f"{STRATEGIES_PATH}/{s.id}",
            headers={"Authorization": f"Bearer {token}"},
        )
    assert resp.status_code == 200
    data = resp.json()
    assert data["id"] == str(s.id)
    assert data["name"] == "Single"


@pytest.mark.asyncio
async def test_get_strategy_by_id_404_other_user():
    s = await TradingStrategy(user_id="other_user", name="Other").insert()
    token = _token("different_user")
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.get(
            f"{STRATEGIES_PATH}/{s.id}",
            headers={"Authorization": f"Bearer {token}"},
        )
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_patch_strategy_200():
    s = await TradingStrategy(user_id="patch_user", name="ToUpdate", description="Old").insert()
    token = _token("patch_user")
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.patch(
            f"{STRATEGIES_PATH}/{s.id}",
            json={"name": "Updated", "description": "New desc", "parameters": {"k": "v"}},
            headers={"Authorization": f"Bearer {token}"},
        )
    assert resp.status_code == 200
    data = resp.json()
    assert data["name"] == "Updated"
    assert data["description"] == "New desc"
    assert data["parameters"] == {"k": "v"}


@pytest.mark.asyncio
async def test_patch_strategy_404_other_user():
    s = await TradingStrategy(user_id="owner_x", name="Other").insert()
    token = _token("owner_y")
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.patch(
            f"{STRATEGIES_PATH}/{s.id}",
            json={"name": "Hacked"},
            headers={"Authorization": f"Bearer {token}"},
        )
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_delete_strategy_204():
    s = await TradingStrategy(user_id="del_user", name="ToDelete").insert()
    token = _token("del_user")
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.delete(
            f"{STRATEGIES_PATH}/{s.id}",
            headers={"Authorization": f"Bearer {token}"},
        )
    assert resp.status_code == 204
    found = await TradingStrategy.get(s.id)
    assert found is None


@pytest.mark.asyncio
async def test_delete_strategy_404_other_user():
    s = await TradingStrategy(user_id="del_owner", name="OtherDel").insert()
    token = _token("other_del")
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.delete(
            f"{STRATEGIES_PATH}/{s.id}",
            headers={"Authorization": f"Bearer {token}"},
        )
    assert resp.status_code == 404
    found = await TradingStrategy.get(s.id)
    assert found is not None


@pytest.mark.asyncio
async def test_strategies_401_no_token():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.get(STRATEGIES_PATH)
    assert resp.status_code == 401
