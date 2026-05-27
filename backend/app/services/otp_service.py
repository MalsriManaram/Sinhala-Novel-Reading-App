"""Mock Dialog Ideamart OTP service.

In production this would call Ideamart's OTP endpoint.  Here we generate a
6-digit code, store it in the DB and "deliver" it via response payload for
demo purposes only.
"""
import random
import string
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.models.otp import OTP

OTP_TTL_MINUTES = 5


def generate_otp(db: Session, phone: str, purpose: str = "login") -> str:
    code = "".join(random.choices(string.digits, k=6))
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=OTP_TTL_MINUTES)
    row = OTP(phone=phone, code=code, purpose=purpose, expires_at=expires_at)
    db.add(row)
    db.commit()
    return code


def verify_otp(db: Session, phone: str, code: str, purpose: str = "login") -> bool:
    now = datetime.now(timezone.utc)
    row = (
        db.query(OTP)
        .filter(
            OTP.phone == phone,
            OTP.code == code,
            OTP.purpose == purpose,
            OTP.consumed.is_(False),
        )
        .order_by(OTP.id.desc())
        .first()
    )
    if not row:
        return False
    # Compare timestamps tz-naively (DB stores naive UTC datetimes).
    expires_at = row.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < now:
        return False
    row.consumed = True
    db.add(row)
    db.commit()
    return True
