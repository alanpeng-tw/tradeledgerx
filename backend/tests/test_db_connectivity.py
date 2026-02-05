"""Tests for Story 1-3: GET /api/v1/health/db (database connectivity endpoint)."""
import pytest
from unittest.mock import AsyncMock, patch
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.config import settings

DB_PATH = f"{settings.API_V1_STR}/health/db"


@pytest.mark.asyncio
async def test_db_connectivity_200_when_connected():
    """When MongoDB is reachable, returns 200 with status=ok, mongodb=connected, redis in body."""
    with patch("app.routers.health.check_db_connected", new_callable=AsyncMock) as m:
        m.return_value = (True, None)
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            response = await ac.get(DB_PATH)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["mongodb"] == "connected"
    assert "redis" in data


@pytest.mark.asyncio
async def test_db_connectivity_503_when_disconnected():
    """When MongoDB is unreachable, returns 503 with status=error, mongodb=disconnected, detail."""
    with patch("app.routers.health.check_db_connected", new_callable=AsyncMock) as m:
        m.return_value = (False, "connection refused")
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            response = await ac.get(DB_PATH)
    assert response.status_code == 503
    data = response.json()
    assert data["status"] == "error"
    assert data["mongodb"] == "disconnected"
    assert "detail" in data
    assert "connection refused" in data["detail"]


@pytest.mark.asyncio
async def test_db_connectivity_no_auth_required():
    """Endpoint is unauthenticated; no Authorization header required."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get(DB_PATH)
    # Should not be 401 (when DB is up we get 200; when down we get 503)
    assert response.status_code in (200, 503)


@pytest.mark.asyncio
async def test_db_connectivity_get_only_idempotent():
    """Endpoint is GET only; no side effects (idempotent)."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        r1 = await ac.get(DB_PATH)
        r2 = await ac.get(DB_PATH)
    assert r1.status_code == r2.status_code
    assert r1.json() == r2.json()
