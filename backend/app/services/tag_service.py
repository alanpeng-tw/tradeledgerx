from typing import List, Optional
from app.models.tag import Tag
from beanie import PydanticObjectId

class TagService:
    @staticmethod
    async def get_all_tags() -> List[Tag]:
        return await Tag.find_all().to_list()
    
    @staticmethod
    async def create_tag(data: dict) -> Tag:
        tag = Tag(**data)
        return await tag.create()
    
    @staticmethod
    async def update_tag(id: PydanticObjectId, data: dict) -> Optional[Tag]:
        tag = await Tag.get(id)
        if not tag:
            return None
        
        await tag.update({"$set": data})
        return tag
    
    @staticmethod
    async def delete_tag(id: PydanticObjectId) -> bool:
        tag = await Tag.get(id)
        if not tag:
            return False
        
        await tag.delete()
        return True
