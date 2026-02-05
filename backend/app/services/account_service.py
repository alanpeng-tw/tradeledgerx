from typing import Any, List

from beanie import PydanticObjectId

from app.models.account import Account


class AccountService:
    @staticmethod
    async def get_user_accounts(user_id: str) -> List[Account]:
        return await Account.find(Account.user_id == user_id).to_list()

    @staticmethod
    async def get_account_by_id(account_id: PydanticObjectId, user_id: str) -> Account | None:
        return await Account.find_one(
            Account.id == account_id,
            Account.user_id == user_id,
        )

    @staticmethod
    async def create_account(user_id: str, data: dict[str, Any]) -> Account:
        account = Account(
            user_id=user_id,
            name=data["name"],
            broker=data["broker"],
            type=data["type"],
            balance=data["balance"],
            initial_balance=data.get("initial_balance", 0.0),
            daily_loss_limit=data.get("daily_loss_limit", 5.0),
            currency=data.get("currency", "USD"),
        )
        await account.insert()
        return account

    @staticmethod
    async def update_account(
        account_id: PydanticObjectId,
        user_id: str,
        data: dict[str, Any],
    ) -> Account | None:
        account = await Account.find_one(
            Account.id == account_id,
            Account.user_id == user_id,
        )
        if not account:
            return None
        allowed = {
            "name", "broker", "type", "balance", "initial_balance",
            "daily_loss_limit", "currency", "status", "notes",
        }
        updates = {k: v for k, v in data.items() if k in allowed}
        for k, v in updates.items():
            setattr(account, k, v)
        await account.save()
        return account

    @staticmethod
    async def delete_account(account_id: PydanticObjectId, user_id: str) -> bool:
        account = await Account.find_one(
            Account.id == account_id,
            Account.user_id == user_id,
        )
        if not account:
            return False
        await account.delete()
        return True
