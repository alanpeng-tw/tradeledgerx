import json
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

from app.core.config import settings
from app.core.redis import get_redis_client

# Paths that do not require authentication
ALLOWED_PATHS = {
    "/health",
    "/docs",
    "/redoc",
    f"{settings.API_V1_STR}/openapi.json",
    f"{settings.API_V1_STR}/health/db",
    f"{settings.API_V1_STR}/login",
    # The logout path needs to be accessed to clear the cookie, even if the session is already invalid.
    f"{settings.API_V1_STR}/logout",
}

def _path_is_protected(path: str) -> bool:
    """
    Checks if a path is a protected API route.
    - Returns False for allowed paths (docs, health, auth).
    - Returns False for non-API routes (e.g., frontend static files).
    - Returns True for all other /api/v1/ routes.
    """
    if path in ALLOWED_PATHS:
        return False
    # Allow /docs/, /redoc/ and their subpaths (e.g. Swagger UI assets)
    if path.startswith("/docs/") or path.startswith("/redoc/"):
        return False
    # All other /api/v1/ routes are protected
    if path.startswith(settings.API_V1_STR):
        # But auth endpoints themselves are not protected
        if path.startswith(f"{settings.API_V1_STR}/auth"):
             return False
        return True
    
    # Non-api routes (e.g. frontend files) are not protected by this middleware
    return False

class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Allow OPTIONS for CORS preflight
        if request.method == "OPTIONS":
            return await call_next(request)
        
        if not _path_is_protected(request.url.path):
            return await call_next(request)

        session_id = request.cookies.get("session_id")
        if not session_id:
            return JSONResponse(
                status_code=401, content={"detail": "Not authenticated"}
            )

        try:
            redis = await get_redis_client()
            user_data_json = await redis.get(f"session:{session_id}")

            if not user_data_json:
                # Session expired or invalid, clear the bad cookie
                response = JSONResponse(
                    status_code=401, content={"detail": "Session expired or invalid"}
                )
                response.delete_cookie("session_id")
                return response

            user_data = json.loads(user_data_json)
            request.state.user_id = user_data.get("sub")
            request.state.role = user_data.get("role", "user")

        except Exception:
            # Broad exception for issues with Redis connection or JSON parsing
            return JSONResponse(
                status_code=500, content={"detail": "Error processing session"}
            )
            
        return await call_next(request)
