"""Novel SQLAlchemy model."""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, Index
from sqlalchemy.orm import relationship
from app.core.database import Base


class Novel(Base):
    __tablename__ = "novels"
    __table_args__ = (
        Index("ix_novels_category_status", "category", "status"),
        {"mysql_engine": "InnoDB", "mysql_charset": "utf8mb4"},
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    author = Column(String(160), nullable=False)
    synopsis = Column(Text, nullable=True)
    cover_url = Column(String(512), nullable=True)
    category = Column(String(80), nullable=False, default="General")
    status = Column(String(16), nullable=False, default="published")  # draft/upcoming/published
    release_at = Column(DateTime, nullable=True)  # for upcoming
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    chapters = relationship("Chapter", back_populates="novel", cascade="all, delete-orphan")
    ratings = relationship("Rating", back_populates="novel", cascade="all, delete-orphan")
    reminders = relationship("Reminder", back_populates="novel", cascade="all, delete-orphan")
