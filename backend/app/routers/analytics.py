from fastapi import APIRouter, Request, HTTPException, Query
from typing import List, Dict, Any
from pydantic import BaseModel
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/calendar")
async def get_calendar(request: Request, month: str = Query(..., regex="^\\d{4}-\\d{2}$")):
    account_id = getattr(request.state, "account_id", None)
    if not account_id:
        raise HTTPException(status_code=400, detail="X-Account-ID header required")
        
    return await AnalyticsService.get_pnl_calendar(account_id, month)


class AnalyticsStatsResponse(BaseModel):
    win_rate: float
    total_trades: int
    wins: int
    losses: int
    breakeven: int
    equity_curve: List[Dict[str, Any]]


@router.get("/stats", response_model=AnalyticsStatsResponse)
async def get_stats(request: Request, period: str = Query("all")):
    account_id = getattr(request.state, "account_id", None)
    if not account_id:
        raise HTTPException(status_code=400, detail="X-Account-ID header required")
    return await AnalyticsService.get_stats(account_id, period)
