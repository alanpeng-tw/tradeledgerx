"""
Dedicated DB (and optional Redis) connectivity endpoint for monitoring/scripts.
GET only, no auth required, no side effects. Aligns with Story 1-3.
"""
from fastapi import APIRouter
from fastapi.responses import JSONResponse

from app.core.db import check_db_connected
from app.core.redis import get_redis_client

router = APIRouter(prefix="/health", tags=["health"])


@router.get("/db")
async def db_connectivity():
    """
    Test database (and Redis) connectivity. Returns 200 when MongoDB is reachable,
    503 when MongoDB is unreachable. No auth required; GET only; idempotent.
    """
    db_ok, db_error = await check_db_connected()
    if not db_ok:
        return JSONResponse(
            status_code=503,
            content={
                "status": "error",
                "mongodb": "disconnected",
                "detail": db_error or "database unreachable",
            },
        )

    # Optional Redis check (same endpoint returns both for consistency)
    redis_status = "disconnected"
    try:
        redis = await get_redis_client()
        await redis.ping()
        redis_status = "connected"
    except Exception:
        pass

    return {
        "status": "ok",
        "mongodb": "connected",
        "redis": redis_status,
    }
