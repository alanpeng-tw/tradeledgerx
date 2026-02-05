import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.config import settings
import jwt
from datetime import datetime, timedelta


def _token(role: str = "user") -> str:
    return jwt.encode(
        {"sub": "user123", "role": role, "exp": datetime.utcnow() + timedelta(minutes=5)},
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )

@pytest.mark.asyncio
async def test_auth_missing_token():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # /health does not require auth
        resp = await ac.get("/health")
        assert resp.status_code == 200
        
        # /api/v1/... (simulated protected route, we don't have one yet so we might need a dummy router or just rely on 404 vs 401)
        # Since we don't have any api routes, let's try a dummy /api/v1/test
        # But dispatch will run. If 404 happens before middleware check? No, middleware runs before routing usually.
        # But wait, 404 is a response. Middleware calls call_next.
        # If call_next returns 404, we are good.
        # But AuthMiddleware checks path startswith API_V1_STR.
        
        resp = await ac.get(f"{settings.API_V1_STR}/dummy")
        assert resp.status_code == 401
        assert resp.json() == {"detail": "Missing authentication"}

@pytest.mark.asyncio
async def test_auth_valid_token():
    token = jwt.encode(
        {"sub": "user123", "exp": datetime.utcnow() + timedelta(minutes=5)},
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )
    
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Since we don't have a real endpoint, we expect 404 but NOT 401.
        resp = await ac.get(
            f"{settings.API_V1_STR}/dummy",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert resp.status_code == 404 # Not 401


# Story 1-4: Password Hash Utility API
HASH_PASSWORD_PATH = f"{settings.API_V1_STR}/hash-password"


@pytest.mark.asyncio
async def test_hash_password_401_without_token():
    """Hash-password endpoint requires JWT; returns 401 when missing."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.post(HASH_PASSWORD_PATH, json={"password": "secret"})
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_hash_password_403_non_admin():
    """Hash-password endpoint requires admin role; returns 403 for role=user."""
    token = _token(role="user")
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.post(
            HASH_PASSWORD_PATH,
            json={"password": "secret"},
            headers={"Authorization": f"Bearer {token}"},
        )
    assert resp.status_code == 403
    assert "admin" in resp.json().get("detail", "").lower()


@pytest.mark.asyncio
async def test_hash_password_200_admin_returns_bcrypt_hash():
    """Admin can call hash-password; response has hash (bcrypt format)."""
    token = _token(role="admin")
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.post(
            HASH_PASSWORD_PATH,
            json={"password": "mypass"},
            headers={"Authorization": f"Bearer {token}"},
        )
    assert resp.status_code == 200
    data = resp.json()
    assert "hash" in data
    assert data["hash"].startswith("$2b$")
    assert len(data["hash"]) > 50


@pytest.mark.asyncio
async def test_hash_password_422_empty_password():
    """Hash-password requires non-empty password; returns 422 when empty."""
    token = _token(role="admin")
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.post(
            HASH_PASSWORD_PATH,
            json={"password": ""},
            headers={"Authorization": f"Bearer {token}"},
        )
    assert resp.status_code == 422
