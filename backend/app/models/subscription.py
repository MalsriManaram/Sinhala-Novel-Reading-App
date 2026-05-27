"""Subscription SQLAlchemy model."""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class Subscription(Base):
    __tablename__ = "subscriptions"
    __table_args__ = ({"mysql_engine": "InnoDB", "mysql_charset": "utf8mb4"},)

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    provider = Column(String(32), nullable=False)  # revenuecat / ideamart
    plan = Column(String(32), nullable=False, default="monthly")  # daily/weekly/monthly
    status = Column(String(16), nullable=False, default="active")  # active/cancelled/expired
    started_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    expires_at = Column(DateTime, nullable=True)
    cancelled_at = Column(DateTime, nullable=True)
    external_id = Column(String(128), nullable=True)  # provider transaction id

    user = relationship("User", back_populates="subscriptions")
