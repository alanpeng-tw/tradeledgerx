from enum import Enum
from typing import Optional
from beanie import Document, Indexed

class AccountType(str, Enum):
    CHALLENGE = "CHALLENGE"
    LIVE = "LIVE"

class AccountStatus(str, Enum):
    ACTIVE = "ACTIVE"
    FAILED = "FAILED"
    CLOSED = "CLOSED"

class Account(Document):
    name: str
    broker: str  # broker code from brokers collection (e.g. FTMO, BINGX)
    type: AccountType
    balance: float
    initial_balance: float = 0.0 # Snapshot of balance at start of day/period or account creation
    daily_loss_limit: float = 5.0 # Percent, e.g. 5.0%
    currency: str = "USD"
    user_id: Indexed(str)
    status: AccountStatus = AccountStatus.ACTIVE
    notes: Optional[str] = None
    
    class Settings:
        name = "accounts"
