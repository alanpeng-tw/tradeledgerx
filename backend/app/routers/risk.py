from fastapi import APIRouter, Request, HTTPException
from app.services.risk_service import RiskService

router = APIRouter(prefix="/risk", tags=["risk"])

@router.get("/daily-status")
async def get_daily_status(request: Request):
    account_id = getattr(request.state, "account_id", None)
    if not account_id:
        raise HTTPException(status_code=400, detail="X-Account-ID header required")
        
    status = await RiskService.get_daily_status(account_id)
    if not status:
        # Could be account not found or other issue
        raise HTTPException(status_code=404, detail="Account not found or invalid ID")
        
    return status
