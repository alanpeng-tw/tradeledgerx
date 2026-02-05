from datetime import datetime
from typing import Optional

from beanie import Document, Indexed


class Broker(Document):
    """
    Supported broker (券商) for account creation and settings.
    Option B: Account.broker stores this document's code (str).
    """

    code: Indexed(str, unique=True)  # e.g. FTMO, BINGX, MCF
    name: str  # display name for UI
    sort_order: int = 0
    is_active: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Settings:
        name = "brokers"
