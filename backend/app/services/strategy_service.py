from datetime import datetime, timezone
from typing import Any, List

from beanie import PydanticObjectId

from app.models.strategy import TradingStrategy


class StrategyService:
    @staticmethod
    async def list_by_user(user_id: str) -> List[TradingStrategy]:
        return await TradingStrategy.find(TradingStrategy.user_id == user_id).to_list()

    @staticmethod
    async def get_by_id(strategy_id: PydanticObjectId, user_id: str) -> TradingStrategy | None:
        return await TradingStrategy.find_one(
            TradingStrategy.id == strategy_id,
            TradingStrategy.user_id == user_id,
        )

    @staticmethod
    async def create(user_id: str, data: dict[str, Any]) -> TradingStrategy:
        now = datetime.now(timezone.utc)
        strategy = TradingStrategy(
            user_id=user_id,
            name=data["name"],
            description=data.get("description"),
            parameters=data.get("parameters"),
            created_at=now,
            updated_at=now,
        )
        await strategy.insert()
        return strategy

    @staticmethod
    async def update(
        strategy_id: PydanticObjectId,
        user_id: str,
        data: dict[str, Any],
    ) -> TradingStrategy | None:
        strategy = await TradingStrategy.find_one(
            TradingStrategy.id == strategy_id,
            TradingStrategy.user_id == user_id,
        )
        if not strategy:
            return None
        allowed = {"name", "description", "parameters"}
        updates = {k: v for k, v in data.items() if k in allowed}
        for k, v in updates.items():
            setattr(strategy, k, v)
        strategy.updated_at = datetime.now(timezone.utc)
        await strategy.save()
        return strategy

    @staticmethod
    async def delete(strategy_id: PydanticObjectId, user_id: str) -> bool:
        """
        Delete strategy. Only owner can delete.
        When Trade.strategy_id is added later, either set strategy_id to null
        for affected trades or prevent delete if in use (to be defined).
        """
        strategy = await TradingStrategy.find_one(
            TradingStrategy.id == strategy_id,
            TradingStrategy.user_id == user_id,
        )
        if not strategy:
            return False
        await strategy.delete()
        return True
