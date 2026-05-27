"""Reminder model (Worth-the-Wait)."""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base


class Reminder(Base):
    __tablename__ = "reminders"
    __table_args__ = (
        UniqueConstraint("user_id", "novel_id", name="uq_reminder_user_novel"),
        {"mysql_engine": "InnoDB", "mysql_charset": "utf8mb4"},
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    novel_id = Column(Integer, ForeignKey("novels.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="reminders")
    novel = relationship("Novel", back_populates="reminders")
