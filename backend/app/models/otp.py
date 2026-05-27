"""OTP record for Dialog Ideamart mock auth."""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, Boolean
from app.core.database import Base


class OTP(Base):
    __tablename__ = "otps"
    __table_args__ = ({"mysql_engine": "InnoDB", "mysql_charset": "utf8mb4"},)

    id = Column(Integer, primary_key=True, autoincrement=True)
    phone = Column(String(32), nullable=False, index=True)
    code = Column(String(8), nullable=False)
    purpose = Column(String(32), nullable=False, default="login")  # login / subscribe
    consumed = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    expires_at = Column(DateTime, nullable=False)
