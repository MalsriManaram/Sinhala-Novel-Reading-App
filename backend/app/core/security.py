"""Password hashing and JWT helpers."""
from datetime import datetime, timedelta, timezone
from typing import Optional
import jwt
from passlib.context import CryptContext
from app.core.config import get_settings

settings = get_settings()

# Use bcrypt with safe rounds
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain: str) -> str:
    return pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return pwd_context.verify(plain, hashed)
    except Exception:
        return False


def create_access_token(subject: str, role: str, extra: Optional[dict] = None) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(subject),
        "role": role,
        "type": "access",
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=settings.ACCESS_TOKEN_MINUTES)).timestamp()),
    }
    if extra:
        payload.update(extra)
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(subject: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(subject),
        "type": "refresh",
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(days=settings.REFRESH_TOKEN_DAYS)).timestamp()),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str) -> dict:
    return jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
