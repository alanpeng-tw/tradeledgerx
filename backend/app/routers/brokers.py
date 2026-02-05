from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, Field
from beanie import PydanticObjectId

from app.models.broker import Broker
from app.services.broker_service import BrokerService
from app.routers.auth import require_admin

router = APIRouter(prefix="/brokers", tags=["brokers"])


def _get_user_id(request: Request) -> str:
    user_id = getattr(request.state, "user_id", None)
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    return user_id


# --- Request models ---
class BrokerCreate(BaseModel):
    code: str = Field(..., min_length=1, description="Unique broker code (e.g. FTMO, MCF)")
    name: str = Field(..., min_length=1, description="Display name")
    sort_order: Optional[int] = Field(0)
    is_active: Optional[bool] = Field(True)


class BrokerUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1)
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None


# --- Endpoints ---
@router.get("", response_model=List[Broker])
async def list_brokers(request: Request, all: bool = False):
    """
    List brokers. Any authenticated user.
    Default: active brokers only (for dropdown). If all=true and user is admin, return all brokers (for 券商管理 UI).
    Returns array: id, code, name, sort_order, is_active.
    """
    _get_user_id(request)
    if all:
        role = getattr(request.state, "role", "user")
        if role == "admin":
            return await BrokerService.list_all()
    return await BrokerService.list_active()


@router.post("", response_model=Broker, status_code=status.HTTP_201_CREATED)
async def create_broker(
    body: BrokerCreate,
    request: Request,
    _: None = Depends(require_admin),
):
    """Create broker. Admin only. code must be unique."""
    data = body.model_dump(exclude_unset=True)
    existing = await BrokerService.get_by_code(data["code"].strip().upper())
    if existing:
        raise HTTPException(status_code=400, detail="Broker with this code already exists")
    return await BrokerService.create(data)


@router.get("/{broker_id}", response_model=Broker)
async def get_broker(
    broker_id: PydanticObjectId,
    request: Request,
):
    """Get one broker by ID. Any authenticated user."""
    _get_user_id(request)
    broker = await BrokerService.get_by_id(broker_id)
    if not broker:
        raise HTTPException(status_code=404, detail="Broker not found")
    return broker


@router.patch("/{broker_id}", response_model=Broker)
async def update_broker(
    broker_id: PydanticObjectId,
    body: BrokerUpdate,
    request: Request,
    _: None = Depends(require_admin),
):
    """Update broker (name, sort_order, is_active). Admin only."""
    data = body.model_dump(exclude_unset=True)
    broker = await BrokerService.update(broker_id, data)
    if not broker:
        raise HTTPException(status_code=404, detail="Broker not found")
    return broker


@router.delete("/{broker_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_broker(
    broker_id: PydanticObjectId,
    request: Request,
    _: None = Depends(require_admin),
):
    """
    Soft-delete broker: set is_active=False. Admin only.
    Existing accounts using this broker keep the broker code; they no longer appear in active dropdown.
    """
    ok, err = await BrokerService.delete(broker_id)
    if not ok:
        raise HTTPException(status_code=404, detail=err or "Broker not found")
