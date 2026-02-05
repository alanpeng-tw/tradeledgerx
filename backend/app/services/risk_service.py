from datetime import datetime, time, timezone
from typing import Dict, Any
from app.models.account import Account
from app.models.trade import Trade, TradeStatus

class RiskService:
    @staticmethod
    async def get_daily_status(account_id: str) -> Dict[str, Any]:
        # Account model uses default _id (ObjectId). 
        # But in context middleware we pass X-Account-ID which is the string ID.
        if not account_id:
             return None
             
        from beanie import PydanticObjectId
        try:
            acc_oid = PydanticObjectId(account_id)
            account = await Account.get(acc_oid)
        except:
             return None

        if not account:
            return None

        # Determine Today's Range in UTC
        now_utc = datetime.now(timezone.utc)
        start_of_day = datetime.combine(now_utc.date(), time.min).replace(tzinfo=timezone.utc)
        end_of_day = datetime.combine(now_utc.date(), time.max).replace(tzinfo=timezone.utc)

        # Method 2: Use matching via find() then sum in python (Reliable & Simple)
        trades = await Trade.find(
            Trade.account_id == account_id,
            Trade.status == TradeStatus.CLOSED,
            Trade.exit_date >= start_of_day,
            Trade.exit_date <= end_of_day,
            Trade.realized_pnl < 0
        ).to_list()
        
        daily_loss_sum = sum(abs(t.realized_pnl) for t in trades)
        
        # Calculate Metrics
        # Limit Amount = Initial Balance * Limit %
        limit_amount = account.initial_balance * (account.daily_loss_limit / 100.0)
        
        percent_used = 0.0
        if limit_amount > 0:
            percent_used = (daily_loss_sum / limit_amount) * 100.0
            
        status = "SAFE"
        if percent_used >= 80:
            status = "DANGER"
        elif percent_used >= 60:
            status = "WARNING"
            
        return {
            "daily_loss": daily_loss_sum,
            "limit_amount": limit_amount,
            "loss_limit_percent": account.daily_loss_limit,
            "percent_used": round(percent_used, 2),
            "status": status,
            "account_balance": account.balance,
            "initial_balance": account.initial_balance
        }
