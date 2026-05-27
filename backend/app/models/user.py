"""User SQLAlchemy model."""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Index
from sqlalchemy.orm import relationship
from app.core.database import Base


class User(Base):
    __tablename__ = "users"
    __table_args__ = (
        Index("ix_users_phone", "phone"),
        {"mysql_engine": "InnoDB", "mysql_charset": "utf8mb4"},
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(255), unique=True, nullable=True)
    phone = Column(String(32), unique=True, nullable=True)
    name = Column(String(120), nullable=True)
    password_hash = Column(String(255), nullable=True)
    role = Column(String(16), nullable=False, default="user")  # admin/user
    premium_status = Column(Boolean, nullable=False, default=False)
    country_code = Column(String(8), nullable=True)  # e.g. "LK", "US"
    provider = Column(String(32), nullable=False, default="local")  # local/google/apple/phone
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    ratings = relationship("Rating", back_populates="user", cascade="all, delete-orphan")
    subscriptions = relationship("Subscription", back_populates="user", cascade="all, delete-orphan")
    ad_unlocks = relationship("AdUnlock", back_populates="user", cascade="all, delete-orphan")
    reminders = relationship("Reminder", back_populates="user", cascade="all, delete-orphan")
