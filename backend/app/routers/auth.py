import uuid
import json
from fastapi import APIRouter, Depends, HTTPException, Request, status, Response
from pydantic import BaseModel, Field
from passlib.context import CryptContext
from beanie import PydanticObjectId

from app.core.config import settings
from app.core.logging_config import get_logger
from app.core.redis import get_redis_client
from app.models.user import User

router = APIRouter(tags=["auth"])


class MeResponse(BaseModel):
    sub: str
    username: str
    role: str


@router.get("/me", response_model=MeResponse)
async def get_me(request: Request):
    """Return current user info from the active session."""
    user_id = getattr(request.state, "user_id", None)
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        user = await User.get(PydanticObjectId(user_id))
    except Exception:
        raise HTTPException(status_code=401, detail="User not found")
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return MeResponse(sub=str(user.id), username=user.username, role=user.role)


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
logger = get_logger("app.routers.auth")


def require_admin(request: Request) -> None:
    """Dependency: require an active session with role=admin. Raises 403 if not admin."""
    role = getattr(request.state, "role", "user")
    if role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required",
        )


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    username: str
    role: str


class HashPasswordRequest(BaseModel):
    password: str = Field(..., min_length=1, description="Plain-text password to hash")


class HashPasswordResponse(BaseModel):
    hash: str = Field(..., description="Bcrypt hash of the password")


@router.post("/login", response_model=LoginResponse)
async def login(body: LoginRequest, response: Response):
    user = await User.find_one(User.username == body.username)
    if not user:
        logger.warning("login_failed username=%s reason=user_not_found", body.username)
        raise HTTPException(status_code=401, detail="Invalid username or password")
    if not pwd_context.verify(body.password, user.hashed_password):
        logger.warning("login_failed username=%s reason=password_mismatch", body.username)
        raise HTTPException(status_code=401, detail="Invalid username or password")

    # Create session in Redis (required for cookie-based auth)
    session_id = str(uuid.uuid4())
    user_data = {"sub": str(user.id), "role": user.role, "username": user.username}

    try:
        redis = await get_redis_client()
        await redis.set(
            f"session:{session_id}",
            json.dumps(user_data),
            ex=60 * settings.ACCESS_TOKEN_EXPIRE_MINUTES,
        )
    except Exception as e:
        logger.exception("login_redis_failed session_id=%s error=%s", session_id, e)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Session storage (Redis) is unavailable. Please try again or contact support.",
        ) from e

    # Set cookie
    response.set_cookie(
        key="session_id",
        value=session_id,
        httponly=True,
        samesite="lax",
        # In production, cookie should be sent only over HTTPS
        # In debug/dev, allow http
        secure=True if settings.ENVIRONMENT != "dev" else False,
        expires=60 * settings.ACCESS_TOKEN_EXPIRE_MINUTES,
    )

    return LoginResponse(username=user.username, role=user.role)


@router.post("/logout")
async def logout(request: Request, response: Response):
    """Logs out the user by deleting the session from Redis and clearing the cookie."""
    session_id = request.cookies.get("session_id")

    if session_id:
        # Delete session from Redis
        redis = await get_redis_client()
        await redis.delete(f"session:{session_id}")

    # Clear cookie from browser
    response.delete_cookie(key="session_id")
    
    return {"status": "ok", "message": "Logged out successfully"}


@router.post("/hash-password", response_model=HashPasswordResponse)
async def hash_password_endpoint(
    body: HashPasswordRequest,
    _: None = Depends(require_admin),
):
    """
    Return bcrypt hash of the given password. Admin only.
    Same algorithm as login (passlib bcrypt). Do not log or store plain password.
    """
    hashed = hash_password(body.password)
    return HashPasswordResponse(hash=hashed)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)
