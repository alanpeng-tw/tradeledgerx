from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.core.config import settings
from app.models.account import Account
from app.models.broker import Broker
from app.models.strategy import TradingStrategy
from app.models.tag import Tag
from app.models.trade import Trade
from app.models.trading_plan import TradingPlan
from app.models.user import User

# Module-level client for connectivity checks (set in init_db)
_client: AsyncIOMotorClient | None = None


async def init_db() -> None:
    global _client
    _client = AsyncIOMotorClient(settings.MONGODB_URL)
    await init_beanie(
        database=_client[settings.MONGODB_DB_NAME],
        document_models=[
            User,
            Account,
            Broker,
            Tag,
            Trade,
            TradingStrategy,
            TradingPlan,
        ],
    )


async def check_db_connected() -> tuple[bool, str | None]:
    """
    Ping database; return (True, None) if connected, (False, error_message) otherwise.
    For use in logging/middleware and health check.
    """
    if _client is None:
        return False, "db not initialized"
    try:
        await _client.admin.command("ping")
        return True, None
    except Exception as e:
        return False, str(e)
