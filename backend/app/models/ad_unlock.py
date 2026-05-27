"""Ad-unlock SQLAlchemy model (daily rate-limiting + audit)."""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class AdUnlock(Base):
    __tablename__ = "ad_unlocks"
    __table_args__ = ({"mysql_engine": "InnoDB", "mysql_charset": "utf8mb4"},)

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    chapter_id = Column(Integer, ForeignKey("chapters.id", ondelete="CASCADE"), nullable=False)
    unlocked_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="ad_unlocks")
    chapter = relationship("Chapter", back_populates="ad_unlocks")
