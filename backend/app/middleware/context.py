from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from contextvars import ContextVar

account_id_ctx: ContextVar[str | None] = ContextVar("account_id", default=None)

class AccountContextMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        account_id = request.headers.get("X-Account-ID")
        token = account_id_ctx.set(account_id)
        try:
            request.state.account_id = account_id
            response = await call_next(request)
            return response
        finally:
            account_id_ctx.reset(token)
