from datetime import date
from typing import Optional
from beanie import Document, Indexed


class TradingPlan(Document):
    """交易規劃：日期、品種、TradingView 圖檔連結、規劃說明。依帳戶隔離。"""
    account_id: Indexed(str)
    plan_date: date
    symbol: str
    tradingview_chart_url: Optional[str] = None
    description: Optional[str] = None

    class Settings:
        name = "trading_plans"
