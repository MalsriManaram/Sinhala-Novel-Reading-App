"""Application configuration loaded from environment."""
import os
from functools import lru_cache
from dotenv import load_dotenv

load_dotenv()


class Settings:
    DATABASE_URL: str = os.environ.get("DATABASE_URL", "")
    JWT_SECRET: str = os.environ.get("JWT_SECRET", "")
    JWT_ALGORITHM: str = os.environ.get("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_MINUTES: int = int(os.environ.get("ACCESS_TOKEN_MINUTES", "15"))
    REFRESH_TOKEN_DAYS: int = int(os.environ.get("REFRESH_TOKEN_DAYS", "30"))
    AES_CONTENT_KEY: str = os.environ.get("AES_CONTENT_KEY", "")
    EMERGENT_LLM_KEY: str = os.environ.get("EMERGENT_LLM_KEY", "")
    FREE_TIER_DAILY_AD_UNLOCK_CAP: int = int(os.environ.get("FREE_TIER_DAILY_AD_UNLOCK_CAP", "5"))
    OTP_RATE_LIMIT_PER_HOUR: int = int(os.environ.get("OTP_RATE_LIMIT_PER_HOUR", "5"))
    AUTH_RATE_LIMIT_PER_MIN: int = int(os.environ.get("AUTH_RATE_LIMIT_PER_MIN", "10"))
    DEFAULT_ADMIN_EMAIL: str = os.environ.get("DEFAULT_ADMIN_EMAIL", "")
    DEFAULT_ADMIN_PASSWORD: str = os.environ.get("DEFAULT_ADMIN_PASSWORD", "")
    DEFAULT_ADMIN_NAME: str = os.environ.get("DEFAULT_ADMIN_NAME", "Admin")
    CORS_ORIGINS: str = os.environ.get("CORS_ORIGINS", "*")


@lru_cache
def get_settings() -> Settings:
    return Settings()
