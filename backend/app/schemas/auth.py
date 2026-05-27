"""Pydantic schemas — auth, users."""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    email: Optional[str] = None
    phone: Optional[str] = None
    name: Optional[str] = None
    role: str
    premium_status: bool
    country_code: Optional[str] = None
    provider: str
    created_at: datetime


class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    name: Optional[str] = Field(default=None, max_length=120)
    country_code: Optional[str] = Field(default=None, max_length=8)


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class TokenOut(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserOut


class RefreshIn(BaseModel):
    refresh_token: str


class PhoneOTPRequestIn(BaseModel):
    phone: str = Field(min_length=7, max_length=20)
    purpose: str = "login"


class PhoneOTPVerifyIn(BaseModel):
    phone: str
    code: str = Field(min_length=4, max_length=8)


class SocialLoginIn(BaseModel):
    provider: str  # google / apple
    provider_token: str  # mock — we only verify it is non-empty
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    country_code: Optional[str] = None
