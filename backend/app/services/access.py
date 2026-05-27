"""Helpers for chapter access control (premium / ad-unlock)."""
from datetime import datetime, timedelta, timezone
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.models.ad_unlock import AdUnlock
from app.models.subscription import Subscription
from app.models.user import User


def is_user_premium(db: Session, user_id: int) -> bool:
    now = datetime.now(timezone.utc)
    # 1) Honor the explicit User.premium_status flag (admins, comped users, ...)
    user = db.query(User).filter(User.id == user_id).first()
    if user and (user.premium_status or user.role == "admin"):
        return True
    # 2) Otherwise, fall back to the latest active subscription
    sub = (
        db.query(Subscription)
        .filter(Subscription.user_id == user_id, Subscription.status == "active")
        .order_by(Subscription.id.desc())
        .first()
    )
    if not sub:
        return False
    if sub.expires_at is None:
        return True
    expires_at = sub.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    return expires_at >= now


def ad_unlock_count_today(db: Session, user_id: int) -> int:
    start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    return (
        db.query(func.count(AdUnlock.id))
        .filter(AdUnlock.user_id == user_id, AdUnlock.unlocked_at >= start)
        .scalar()
        or 0
    )


def has_unlocked_chapter(db: Session, user_id: int, chapter_id: int) -> bool:
    # An ad-unlock is valid for 24 hours
    cutoff = datetime.now(timezone.utc) - timedelta(hours=24)
    row = (
        db.query(AdUnlock)
        .filter(
            AdUnlock.user_id == user_id,
            AdUnlock.chapter_id == chapter_id,
            AdUnlock.unlocked_at >= cutoff,
        )
        .first()
    )
    return row is not None
