"""Chapter SQLAlchemy model."""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.core.database import Base


class Chapter(Base):
    __tablename__ = "chapters"
    __table_args__ = (
        Index("ix_chapters_novel_number", "novel_id", "chapter_number", unique=True),
        {"mysql_engine": "InnoDB", "mysql_charset": "utf8mb4"},
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    novel_id = Column(Integer, ForeignKey("novels.id", ondelete="CASCADE"), nullable=False)
    chapter_number = Column(Integer, nullable=False)
    title = Column(String(255), nullable=True)
    content = Column(Text(length=4_000_000), nullable=False)  # LONGTEXT-like
    is_premium = Column(Boolean, nullable=False, default=False)
    published_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))

    novel = relationship("Novel", back_populates="chapters")
    ad_unlocks = relationship("AdUnlock", back_populates="chapter", cascade="all, delete-orphan")
