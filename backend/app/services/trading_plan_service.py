from typing import Optional

from app.models.trading_plan import TradingPlan


class TradingPlanService:
    @staticmethod
    async def list_with_pagination(
        account_id: str,
        skip: int = 0,
        limit: int = 20,
    ) -> tuple[list[TradingPlan], int]:
        """List plans for account with pagination. Returns (items, total_count)."""
        q = TradingPlan.find(TradingPlan.account_id == account_id)
        total = await q.count()
        items = await q.sort(-TradingPlan.plan_date).skip(skip).limit(limit).to_list()
        return items, total

    @staticmethod
    async def get_by_id(plan_id, account_id: str) -> Optional[TradingPlan]:
        plan = await TradingPlan.get(plan_id)
        if not plan or plan.account_id != account_id:
            return None
        return plan

    @staticmethod
    async def create(account_id: str, data: dict) -> TradingPlan:
        data["account_id"] = account_id
        plan = TradingPlan(**data)
        await plan.insert()
        return plan

    @staticmethod
    async def update(plan_id, account_id: str, data: dict) -> Optional[TradingPlan]:
        plan = await TradingPlanService.get_by_id(plan_id, account_id)
        if not plan:
            return None
        for k, v in data.items():
            if k != "account_id" and hasattr(plan, k):
                setattr(plan, k, v)
        await plan.save()
        return plan

    @staticmethod
    async def delete(plan_id, account_id: str) -> bool:
        plan = await TradingPlanService.get_by_id(plan_id, account_id)
        if not plan:
            return False
        await plan.delete()
        return True
