from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.db import init_db, check_db_connected
from app.core.redis import get_redis_client
from app.core.logging_config import setup_logging
from app.middleware.auth import AuthMiddleware
from app.middleware.context import AccountContextMiddleware
from app.middleware.logging_middleware import RequestLoggingMiddleware
from app.routers import auth, health, portfolio, strategies, brokers, tags, trades, risk, analytics

@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    await init_db()
    yield
    # Shutdown logic if needed

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)

# Set all CORS enabled origins
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.add_middleware(AuthMiddleware)
app.add_middleware(AccountContextMiddleware)
app.add_middleware(RequestLoggingMiddleware)

app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(health.router, prefix=settings.API_V1_STR)
app.include_router(portfolio.router, prefix=settings.API_V1_STR)
app.include_router(strategies.router, prefix=settings.API_V1_STR)
app.include_router(brokers.router, prefix=settings.API_V1_STR)
app.include_router(tags.router, prefix=settings.API_V1_STR)
app.include_router(trades.router, prefix=settings.API_V1_STR)
app.include_router(risk.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)

@app.get("/health")
async def health_check():
    # Contract: status, redis, db (unchanged by logging story)
    redis_status = "ok"
    try:
        redis = await get_redis_client()
        await redis.ping()
    except Exception as e:
        redis_status = f"error: {str(e)}"

    db_connected, db_error = await check_db_connected()
    db_status = "connected" if db_connected else f"error: {db_error or 'unknown'}"

    return {
        "status": "ok",
        "redis": redis_status,
        "db": db_status,
    }
