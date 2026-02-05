from fastapi import APIRouter, Request, HTTPException, status
from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime
from app.models.trade import Trade, Direction, TradeStatus
from app.services.trade_service import TradeService
from app.middleware.context import account_id_ctx
from beanie import PydanticObjectId, Link
from app.models.tag import Tag

router = APIRouter(prefix="/trades", tags=["trades"])

# DTOs
class TradeCreate(BaseModel):
    symbol: str
    direction: Direction
    entry_date: datetime
    entry_price: float
    quantity: float
    sl: Optional[float] = None
    tp: Optional[float] = None
    exit_date: Optional[datetime] = None
    exit_price: Optional[float] = None
    status: TradeStatus = TradeStatus.OPEN
    notes: Optional[str] = None
    image_urls: List[str] = []
    tags: List[str] = [] # List of Tag IDs

@router.get("", response_model=List[Trade])
async def get_trades(request: Request, limit: int = 50, skip: int = 0):
    account_id = getattr(request.state, "account_id", None) or None
    if not account_id or str(account_id).strip() == "" or str(account_id) == "undefined":
        raise HTTPException(status_code=400, detail="X-Account-ID header required")
    return await TradeService.get_trades(account_id, limit, skip)

@router.post("", response_model=Trade, status_code=status.HTTP_201_CREATED)
async def create_trade(trade_in: TradeCreate, request: Request):
    account_id = getattr(request.state, "account_id", None) or None
    if not account_id or str(account_id).strip() == "" or str(account_id) == "undefined":
        raise HTTPException(status_code=400, detail="X-Account-ID header required")
    try:
        return await TradeService.create_trade(trade_in.model_dump(), account_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
