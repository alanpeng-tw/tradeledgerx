"""
Request/response logging middleware: logs entry (method, path, optional user/account context)
and outcome (status code, success/error). For API routes that may touch DB, logs DB connection
status at request start. No sensitive data (passwords, tokens) in logs.
"""
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from app.core.config import settings
from app.core.logging_config import get_logger
from app.core.db import check_db_connected

logger = get_logger("app.middleware.logging")

# Paths that do not touch DB or are health/docs - skip DB status log to avoid noise
SKIP_DB_LOG_PATHS = {"/health", "/docs", "/redoc", f"{settings.API_V1_STR}/openapi.json"}
if settings.API_V1_STR:
    SKIP_DB_LOG_PATHS.add(f"{settings.API_V1_STR}/login")


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Log every controller entry (method + path, optional user/account) and response outcome."""

    async def dispatch(self, request: Request, call_next) -> Response:
        method = request.method
        path = request.url.path

        # Optional user context (set by AuthMiddleware) - do not log tokens/passwords
        user_id = getattr(request.state, "user_id", None)
        account_id = getattr(request.state, "account_id", None) or request.headers.get("X-Account-ID")
        ctx = []
        if user_id:
            ctx.append("user_id=***")
        if account_id:
            ctx.append("account_id=***")
        ctx_str = " ".join(ctx) if ctx else ""

        logger.info("request_entry method=%s path=%s %s", method, path, ctx_str.strip())

        # For API routes that may touch DB, log DB connection status at request start
        if path.startswith(settings.API_V1_STR) and path not in SKIP_DB_LOG_PATHS:
            connected, err = await check_db_connected()
            if connected:
                logger.info("db_status path=%s connected=true", path)
            else:
                logger.warning("db_status path=%s connected=false error=%s", path, err or "unknown")

        try:
            response = await call_next(request)
            status = response.status_code
            outcome = "success" if status < 400 else "error"
            logger.info(
                "response_outcome method=%s path=%s status=%s outcome=%s",
                method,
                path,
                status,
                outcome,
            )
            return response
        except Exception as e:
            logger.exception(
                "response_outcome method=%s path=%s exception=%s",
                method,
                path,
                str(e),
            )
            raise
