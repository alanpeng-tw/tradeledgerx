from typing import List, Optional
from app.models.trade import Trade
from app.models.tag import Tag
from beanie import PydanticObjectId
from bson.errors import InvalidId
from app.services.analytics_service import AnalyticsService

class TradeService:
    @staticmethod
    async def create_trade(data: dict, account_id: str) -> Trade:
        # Validate Tag IDs if present
        tag_ids = data.get("tags", [])
        valid_tags = []
        if tag_ids:
            try:
                # tag_ids are expected to be str or ObjectId
                # We need to fetch them to ensure they exist and to Create Links
                # Beanie Link can be initialized with the object
                tag_oids = [PydanticObjectId(tid) for tid in tag_ids]
            except InvalidId:
                raise ValueError("One or more Tag IDs are invalid")

            found_tags = await Tag.find({"_id": {"$in": tag_oids}}).to_list()
            if len(found_tags) != len(tag_ids):
                raise ValueError("One or more Tag IDs are invalid")
            valid_tags = found_tags
            
        # Create Trade
        # Replace tag IDs (list of str) with list of Tag objects (for Link)
        # Note: Beanie handles Link field assignment by accepting the Document object or DBRef.
        # Assigning a list of Documents to a List[Link[Tag]] field works.
        
        trade_data = data.copy()
        trade_data["tags"] = valid_tags
        trade_data["account_id"] = account_id
        
        trade = Trade(**trade_data)
        trade.calculate_metrics()
        await trade.save()
        
        # Invalidate Cache
        await AnalyticsService.invalidate_cache(account_id)
        
        return trade

    @staticmethod
    async def get_trades(account_id: str, limit: int = 50, skip: int = 0) -> List[Trade]:
        # Basic pagination and filtering by account
        return await Trade.find(Trade.account_id == account_id).sort(-Trade.entry_date).skip(skip).limit(limit).to_list()
