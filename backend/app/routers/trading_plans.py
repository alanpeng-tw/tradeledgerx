from datetime import date
from typing import Optional

from fastapi import APIRouter, Request, HTTPException, status
from pydantic import BaseModel, Field
from beanie import PydanticObjectId

from app.models.trading_plan import TradingPlan
from app.services.trading_plan_service import TradingPlanService

router = APIRouter(prefix="/trading-plans", tags=["trading-plans"])


def _get_account_id(request: Request) -> str:
    account_id = getattr(request.state, "account_id", None) or None
    if not account_id or str(account_id).strip() == "" or str(account_id) == "undefined":
        raise HTTPException(status_code=400, detail="X-Account-ID header required")
    return str(account_id)


# --- DTOs ---
class TradingPlanCreate(BaseModel):
    plan_date: date
    symbol: str = Field(..., min_length=1)
    tradingview_chart_url: Optional[str] = None
    description: Optional[str] = None


class TradingPlanUpdate(BaseModel):
    plan_date: Optional[date] = None
    symbol: Optional[str] = Field(None, min_length=1)
    tradingview_chart_url: Optional[str] = None
    description: Optional[str] = None


class ListResponse(BaseModel):
    items: list[TradingPlan]
    total: int
    skip: int
    limit: int


# --- Endpoints ---
@router.get("", response_model=ListResponse)
async def list_plans(request: Request, skip: int = 0, limit: int = 20):
    """List trading plans with pagination. Requires X-Account-ID."""
    account_id = _get_account_id(request)
    limit = min(max(1, limit), 100)
    skip = max(0, skip)
    items, total = await TradingPlanService.list_with_pagination(account_id, skip=skip, limit=limit)
    return ListResponse(items=items, total=total, skip=skip, limit=limit)


@router.get("/{plan_id}", response_model=TradingPlan)
async def get_plan(plan_id: PydanticObjectId, request: Request):
    account_id = _get_account_id(request)
    plan = await TradingPlanService.get_by_id(plan_id, account_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Trading plan not found")
    return plan


@router.post("", response_model=TradingPlan, status_code=status.HTTP_201_CREATED)
async def create_plan(body: TradingPlanCreate, request: Request):
    account_id = _get_account_id(request)
    return await TradingPlanService.create(account_id, body.model_dump())


@router.patch("/{plan_id}", response_model=TradingPlan)
async def update_plan(plan_id: PydanticObjectId, body: TradingPlanUpdate, request: Request):
    account_id = _get_account_id(request)
    data = body.model_dump(exclude_unset=True)
    plan = await TradingPlanService.update(plan_id, account_id, data)
    if not plan:
        raise HTTPException(status_code=404, detail="Trading plan not found")
    return plan


@router.delete("/{plan_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_plan(plan_id: PydanticObjectId, request: Request):
    account_id = _get_account_id(request)
    ok = await TradingPlanService.delete(plan_id, account_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Trading plan not found")
