import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
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
        database=client["test_tradeledgerx_tags"],
        document_models=[Tag]
    )
    yield
    await Tag.delete_all()

def create_token(user_id: str, role: str) -> str:
    return jwt.encode(
        {"sub": user_id, "role": role, "exp": datetime.utcnow() + timedelta(minutes=5)},
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )

@pytest.mark.asyncio
async def test_create_tag_admin():
    token = create_token("admin_user", "admin")
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.post(
            f"{settings.API_V1_STR}/tags",
            json={"name": "FOMO", "type": "MISTAKE", "color": "#FF0000"},
            headers={"Authorization": f"Bearer {token}"}
        )
        assert resp.status_code == 201
        data = resp.json()
        assert data["name"] == "FOMO"

@pytest.mark.asyncio
async def test_create_tag_user_forbidden():
    token = create_token("regular_user", "user")
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.post(
            f"{settings.API_V1_STR}/tags",
            json={"name": "SMC", "type": "STRATEGY", "color": "#00FF00"},
            headers={"Authorization": f"Bearer {token}"}
        )
        assert resp.status_code == 403

@pytest.mark.asyncio
async def test_get_tags_public():
    # Setup data
    await Tag(name="Breakout", type=TagType.STRATEGY, color="#0000FF").create()
    
    token = create_token("any_user", "user")
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.get(
            f"{settings.API_V1_STR}/tags",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["name"] == "Breakout"

@pytest.mark.asyncio
async def test_duplicate_tag_name():
    await Tag(name="SameName", type=TagType.STRATEGY, color="#111111").create()
    
    token = create_token("admin_user", "admin")
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.post(
            f"{settings.API_V1_STR}/tags",
            json={"name": "SameName", "type": "MISTAKE", "color": "#222222"},
            headers={"Authorization": f"Bearer {token}"}
        )
        assert resp.status_code == 400

@pytest.mark.asyncio
async def test_delete_tag():
    tag = await Tag(name="DeleteMe", type=TagType.MISTAKE, color="#333333").create()
    
    token = create_token("admin_user", "admin")
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.delete(
            f"{settings.API_V1_STR}/tags/{tag.id}",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert resp.status_code == 204
        
    found = await Tag.get(tag.id)
    assert found is None
