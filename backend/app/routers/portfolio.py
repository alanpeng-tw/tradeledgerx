from fastapi import APIRouter, Request, HTTPException, status
from typing import List, Optional
from pydantic import BaseModel, Field
from beanie import PydanticObjectId

from app.models.account import Account, AccountType, AccountStatus
from app.services.account_service import AccountService

router = APIRouter(prefix="/accounts", tags=["portfolio"])


def _get_user_id(request: Request) -> str:
    user_id = getattr(request.state, "user_id", None)
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    return user_id


# --- Request models ---
class AccountCreate(BaseModel):
    name: str = Field(..., min_length=1)
    broker: str = Field(..., min_length=1)  # broker code from /api/v1/brokers
    type: AccountType
    balance: float = Field(..., ge=0)
    initial_balance: Optional[float] = Field(None, ge=0)
    daily_loss_limit: Optional[float] = Field(None, ge=0, le=100)
    currency: Optional[str] = Field("USD", min_length=1)


class AccountUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1)
    broker: Optional[str] = Field(None, min_length=1)
    type: Optional[AccountType] = None
    balance: Optional[float] = Field(None, ge=0)
    initial_balance: Optional[float] = Field(None, ge=0)
    daily_loss_limit: Optional[float] = Field(None, ge=0, le=100)
    currency: Optional[str] = Field(None, min_length=1)
    status: Optional[AccountStatus] = None
    notes: Optional[str] = None


# --- Endpoints ---
@router.get("", response_model=List[Account])
async def get_accounts(request: Request):
    user_id = _get_user_id(request)
    accounts = await AccountService.get_user_accounts(user_id)
    return accounts


@router.get("/{account_id}", response_model=Account)
async def get_account(account_id: PydanticObjectId, request: Request):
    user_id = _get_user_id(request)
    account = await AccountService.get_account_by_id(account_id, user_id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account


@router.post("", response_model=Account, status_code=status.HTTP_201_CREATED)
async def create_account(body: AccountCreate, request: Request):
    user_id = _get_user_id(request)
    data = body.model_dump(exclude_unset=True)
    account = await AccountService.create_account(user_id, data)
    return account


@router.patch("/{account_id}", response_model=Account)
async def update_account(account_id: PydanticObjectId, body: AccountUpdate, request: Request):
    user_id = _get_user_id(request)
    data = body.model_dump(exclude_unset=True)
    account = await AccountService.update_account(account_id, user_id, data)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account


@router.delete("/{account_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_account(account_id: PydanticObjectId, request: Request):
    user_id = _get_user_id(request)
    ok = await AccountService.delete_account(account_id, user_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Account not found")
