import pytest
from httpx import AsyncClient, ASGITransport
from fastapi import Request
from app.main import app
from app.middleware.context import account_id_ctx
from fastapi.responses import JSONResponse

# We need a dummy endpoint to verify context var is set
@app.get("/api/v1/context-test")
async def context_test_endpoint(request: Request):
    ctx_val = account_id_ctx.get()
    state_val = getattr(request.state, "account_id", None)
    return {"ctx": ctx_val, "state": state_val}

@pytest.mark.asyncio
async def test_account_context_extraction():
    # Bypass auth for this test or provide valid token
    # Since checking auth is global on /api/v1, we need a token OR modify middleware to allow this test route.
    # Let's provide a valid token.
    from app.core.config import settings
    import jwt
    from datetime import datetime, timedelta
    
    token = jwt.encode(
        {"sub": "user123", "exp": datetime.utcnow() + timedelta(minutes=5)},
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )
    
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.get(
            "/api/v1/context-test",
            headers={
                "Authorization": f"Bearer {token}",
                "X-Account-ID": "acc_999"
            }
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["ctx"] == "acc_999"
        assert data["state"] == "acc_999"
