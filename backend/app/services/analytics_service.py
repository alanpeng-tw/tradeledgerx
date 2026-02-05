import json
from datetime import datetime, date, time, timezone
from typing import List, Dict, Any, Optional
from app.models.trade import Trade, TradeStatus
from app.core.redis import get_redis_client
from app.core.config import settings
import logging

class AnalyticsService:
    @staticmethod
    async def get_pnl_calendar(account_id: str, year_month: str) -> List[Dict[str, Any]]:
        """
        year_month format: "YYYY-MM"
        Returns list of daily stats: {date: "YYYY-MM-DD", total_pnl: float, trade_count: int, wins: int, losses: int}
        """
        redis = await get_redis_client()
        cache_key = f"analytics:calendar:{account_id}:{year_month}"
        
        # 1. Try Cache
        if redis:
            cached = await redis.get(cache_key)
            if cached:
                return json.loads(cached)
        
        # 2. Parse Date Range
        try:
            target_date = datetime.strptime(year_month, "%Y-%m").date()
        except ValueError:
            return []
            
        # First day of month
        start_date = datetime.combine(target_date, time.min).replace(tzinfo=timezone.utc)
        
        # Last day of month
        # Logic: First day of next month - 1 microsecond, or just filter by month/year generally
        # Simpler: find where exit_date >= start_of_month AND exit_date < start_of_next_month
        import calendar
        last_day = calendar.monthrange(target_date.year, target_date.month)[1]
        end_date = datetime.combine(date(target_date.year, target_date.month, last_day), time.max).replace(tzinfo=timezone.utc)
        
        # 3. Fetch Data (Using Find + Python Aggregation for reliability)
        trades = await Trade.find(
            Trade.account_id == account_id,
            Trade.status == TradeStatus.CLOSED,
            Trade.exit_date >= start_of_day_utc(start_date), # Helper needed? No, start_date is already datetime
            Trade.exit_date <= end_date
        ).to_list()
        
        # 4. Aggregate
        daily_stats = {}
        for trade in trades:
            if not trade.exit_date:
                continue
            
            day_str = trade.exit_date.strftime("%Y-%m-%d")
            if day_str not in daily_stats:
                daily_stats[day_str] = {"date": day_str, "total_pnl": 0.0, "trade_count": 0, "wins": 0, "losses": 0}
            
            stats = daily_stats[day_str]
            pnl = trade.realized_pnl or 0.0
            
            stats["total_pnl"] += pnl
            stats["trade_count"] += 1
            if pnl > 0:
                stats["wins"] += 1
            elif pnl < 0:
                stats["losses"] += 1
        
        result = list(daily_stats.values())
        result.sort(key=lambda x: x["date"])
        
        # 5. Save Cache (TTL 5 min = 300s)
        if redis:
            await redis.set(cache_key, json.dumps(result), ex=300)
            
        return result

    @staticmethod
    async def invalidate_cache(account_id: str):
        redis = await get_redis_client()
        if redis:
            # We need to delete keys matching `analytics:calendar:{account_id}:*`
            # Redis 'keys' command is expensive. Scan is better.
            # But simple approach: If we know the months, we delete specific.
            # If we don't, pattern delete.
            # For simplicity in this demo:
            keys = await redis.keys(f"analytics:calendar:{account_id}:*")
            if keys:
                await redis.delete(*keys)

    @staticmethod
    async def get_stats(account_id: str, period: str = "all") -> Dict[str, Any]:
        """
        Return basic stats for account. period is reserved for future use.
        """
        # For now, use all trades for the account
        trades = await Trade.find(Trade.account_id == account_id).sort(Trade.exit_date).to_list()

        wins = 0
        losses = 0
        breakeven = 0
        equity_curve: List[Dict[str, Any]] = []
        equity = 0.0

        for trade in trades:
            # Only compute PnL for trades that have realized_pnl
            pnl = trade.realized_pnl
            if pnl is None:
                continue
            if pnl > 0:
                wins += 1
            elif pnl < 0:
                losses += 1
            else:
                breakeven += 1

            equity += pnl
            date_val = (trade.exit_date or trade.entry_date).strftime("%Y-%m-%d")
            equity_curve.append({"date": date_val, "equity": round(equity, 2)})

        total_trades = wins + losses + breakeven
        win_rate = (wins / total_trades) if total_trades > 0 else 0.0

        return {
            "win_rate": win_rate,
            "total_trades": total_trades,
            "wins": wins,
            "losses": losses,
            "breakeven": breakeven,
            "equity_curve": equity_curve,
        }

def start_of_day_utc(dt: datetime) -> datetime:
    return dt.replace(hour=0, minute=0, second=0, microsecond=0)
