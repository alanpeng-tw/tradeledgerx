from enum import Enum
from typing import List, Optional
from datetime import datetime
from beanie import Document, Indexed, Link
from pydantic import Field
from app.models.tag import Tag

class Direction(str, Enum):
    LONG = "LONG"
    SHORT = "SHORT"

class TradeStatus(str, Enum):
    OPEN = "OPEN"
    CLOSED = "CLOSED"
    PENDING = "PENDING"
    
class Trade(Document):
    account_id: Indexed(str)
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
    
    tags: List[Link[Tag]] = []
    
    # Computed fields
    planned_rr: Optional[float] = None
    realized_pnl: Optional[float] = None
    
    class Settings:
        name = "trades"
        indexes = [
            [("account_id", 1), ("entry_date", -1)]
        ]
        
    
    def calculate_metrics(self):
        # Calculate Planned RR
        if self.sl and self.entry_price and self.tp:
            risk = abs(self.entry_price - self.sl)
            reward = abs(self.tp - self.entry_price)
            if risk > 0:
                self.planned_rr = round(reward / risk, 2)
            else:
                self.planned_rr = None
        
        # Calculate PnL and Status
        if self.exit_price is not None:
            price_diff = self.exit_price - self.entry_price
            if self.direction == Direction.SHORT:
                price_diff = -price_diff
            
            self.realized_pnl = price_diff * self.quantity
            self.status = TradeStatus.CLOSED
