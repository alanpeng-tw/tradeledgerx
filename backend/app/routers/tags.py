from fastapi import APIRouter, Request, HTTPException, status
from typing import List
from app.models.tag import Tag
from app.services.tag_service import TagService
from beanie import PydanticObjectId
from pydantic import BaseModel

router = APIRouter(prefix="/tags", tags=["tags"])

# DTOs
class TagCreate(BaseModel):
    name: str
    type: str # Use str to accept Enum values easily or define Enum in pydantic
    color: str
    is_system_default: bool = False

class TagUpdate(BaseModel):
    name: str | None = None
    type: str | None = None
    color: str | None = None
    is_system_default: bool | None = None

def check_admin(request: Request):
    user_role = getattr(request.state, "role", "user")
    if user_role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )

@router.get("", response_model=List[Tag])
async def get_tags():
    # Public for authenticated users (middleware handles auth)
    return await TagService.get_all_tags()

@router.post("", response_model=Tag, status_code=status.HTTP_201_CREATED)
async def create_tag(tag_in: TagCreate, request: Request):
    check_admin(request)
    # Check duplicate name
    existing = await Tag.find_one(Tag.name == tag_in.name)
    if existing:
        raise HTTPException(status_code=400, detail="Tag with this name already exists")
    
    return await TagService.create_tag(tag_in.model_dump())

@router.put("/{tag_id}", response_model=Tag)
async def update_tag(tag_id: PydanticObjectId, tag_in: TagUpdate, request: Request):
    check_admin(request)
    updated_tag = await TagService.update_tag(tag_id, tag_in.model_dump(exclude_unset=True))
    if not updated_tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    return updated_tag

@router.delete("/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tag(tag_id: PydanticObjectId, request: Request):
    check_admin(request)
    success = await TagService.delete_tag(tag_id)
    if not success:
        raise HTTPException(status_code=404, detail="Tag not found")
