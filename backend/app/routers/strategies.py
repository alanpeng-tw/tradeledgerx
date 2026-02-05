from typing import Any, List, Optional

from fastapi import APIRouter, Request, HTTPException, status
from pydantic import BaseModel, Field
from beanie import PydanticObjectId

from app.models.strategy import TradingStrategy
from app.services.strategy_service import StrategyService

router = APIRouter(prefix="/strategies", tags=["strategies"])


def _get_user_id(request: Request) -> str:
    user_id = getattr(request.state, "user_id", None)
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    return user_id


# --- Request models ---
class StrategyCreate(BaseModel):
    name: str = Field(..., min_length=1, description="Strategy name (required)")
    description: Optional[str] = Field(None)
    parameters: Optional[dict[str, Any]] = Field(None, description="Optional JSON/key-value params")


class StrategyUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1)
    description: Optional[str] = None
    parameters: Optional[dict[str, Any]] = None


# --- Endpoints ---
@router.post("", response_model=TradingStrategy, status_code=status.HTTP_201_CREATED)
async def create_strategy(body: StrategyCreate, request: Request):
    """Create a new strategy for the current user. user_id from JWT."""
    user_id = _get_user_id(request)
    data = body.model_dump(exclude_unset=True)
    strategy = await StrategyService.create(user_id, data)
    return strategy


@router.get("", response_model=List[TradingStrategy])
async def list_strategies(request: Request):
    """List all strategies for the current user."""
    user_id = _get_user_id(request)
    return await StrategyService.list_by_user(user_id)


@router.get("/{strategy_id}", response_model=TradingStrategy)
async def get_strategy(strategy_id: PydanticObjectId, request: Request):
    """Get one strategy by ID. 404 if not found or not owned by current user."""
    user_id = _get_user_id(request)
    strategy = await StrategyService.get_by_id(strategy_id, user_id)
    if not strategy:
        raise HTTPException(status_code=404, detail="Strategy not found")
    return strategy


@router.patch("/{strategy_id}", response_model=TradingStrategy)
async def update_strategy(strategy_id: PydanticObjectId, body: StrategyUpdate, request: Request):
    """Update strategy (name, description, parameters). Only owner can update. 404 if not found or not owned."""
    user_id = _get_user_id(request)
    data = body.model_dump(exclude_unset=True)
    strategy = await StrategyService.update(strategy_id, user_id, data)
    if not strategy:
        raise HTTPException(status_code=404, detail="Strategy not found")
    return strategy


@router.delete("/{strategy_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_strategy(strategy_id: PydanticObjectId, request: Request):
    """Delete strategy. Only owner can delete. 204 on success, 404 if not found or not owned.
    When trades reference this strategy (future), behaviour: set strategy_id to null or prevent delete (TBD)."""
    user_id = _get_user_id(request)
    ok = await StrategyService.delete(strategy_id, user_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Strategy not found")
