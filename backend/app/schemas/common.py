"""Pydantic schemas — ratings, subs, ads, reminders, tts."""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class RatingIn(BaseModel):
    novel_id: int
    score: int = Field(ge=1, le=5)


class RatingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int
    novel_id: int
    score: int
    updated_at: datetime


class SubscribeIn(BaseModel):
    provider: str  # revenuecat / ideamart
    plan: str = "monthly"  # daily / weekly / monthly
    external_id: Optional[str] = None
    otp_code: Optional[str] = None  # for ideamart flow
    phone: Optional[str] = None  # for ideamart flow


class SubscriptionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int
    provider: str
    plan: str
    status: str
    started_at: datetime
    expires_at: Optional[datetime] = None
    cancelled_at: Optional[datetime] = None


class AdUnlockIn(BaseModel):
    chapter_id: int
    ad_reward_token: str  # mock — any non-empty token validates


class AdUnlockOut(BaseModel):
    chapter_id: int
    unlocked: bool
    remaining_today: int
    daily_cap: int


class ReminderIn(BaseModel):
    novel_id: int
    enabled: bool = True


class ReminderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int
    novel_id: int
    created_at: datetime


class TTSRequestIn(BaseModel):
    text: str = Field(min_length=1, max_length=4000)
    voice: str = "nova"
    speed: float = Field(default=1.0, ge=0.25, le=4.0)
    model: str = "tts-1"
    response_format: str = "mp3"
