from datetime import datetime
from typing import Any, Optional

from beanie import Document, Indexed


class TradingStrategy(Document):
    """Trading strategy metadata for the user (e.g. 策略名稱、說明、參數)."""

    user_id: Indexed(str)
    name: str
    description: Optional[str] = None
    parameters: Optional[dict[str, Any]] = None  # JSON/dict for flexible strategy params
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Settings:
        name = "strategies"
