from datetime import datetime, timezone
from typing import Any, List

from beanie import PydanticObjectId

from app.models.broker import Broker


class BrokerService:
    @staticmethod
    async def list_active() -> List[Broker]:
        """List all active brokers (for dropdown). Sorted by sort_order then code."""
        return (
            await Broker.find(Broker.is_active == True)
            .sort([("sort_order", 1), ("code", 1)])
            .to_list()
        )

    @staticmethod
    async def list_all() -> List[Broker]:
        """List all brokers (admin)."""
        return await Broker.find_all().sort([("sort_order", 1), ("code", 1)]).to_list()

    @staticmethod
    async def get_by_id(broker_id: PydanticObjectId) -> Broker | None:
        return await Broker.get(broker_id)

    @staticmethod
    async def get_by_code(code: str) -> Broker | None:
        return await Broker.find_one(Broker.code == code)

    @staticmethod
    async def create(data: dict[str, Any]) -> Broker:
        now = datetime.now(timezone.utc)
        broker = Broker(
            code=data["code"].strip().upper(),
            name=data["name"],
            sort_order=data.get("sort_order", 0),
            is_active=data.get("is_active", True),
            created_at=now,
            updated_at=now,
        )
        await broker.insert()
        return broker

    @staticmethod
    async def update(broker_id: PydanticObjectId, data: dict[str, Any]) -> Broker | None:
        broker = await Broker.get(broker_id)
        if not broker:
            return None
        allowed = {"name", "sort_order", "is_active"}
        updates = {k: v for k, v in data.items() if k in allowed}
        for k, v in updates.items():
            setattr(broker, k, v)
        broker.updated_at = datetime.now(timezone.utc)
        await broker.save()
        return broker

    @staticmethod
    async def delete(broker_id: PydanticObjectId) -> tuple[bool, str | None]:
        """
        Soft-delete: set is_active=False so existing accounts keep the broker code.
        Returns (True, None) on success, (False, error_message) if e.g. should not delete.
        """
        broker = await Broker.get(broker_id)
        if not broker:
            return False, "Broker not found"
        broker.is_active = False
        broker.updated_at = datetime.now(timezone.utc)
        await broker.save()
        return True, None
