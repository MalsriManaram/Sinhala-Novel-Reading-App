"""Admin analytics routes."""
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import require_admin
from app.models.user import User
from app.models.novel import Novel
from app.models.chapter import Chapter
from app.models.rating import Rating
from app.models.subscription import Subscription
from app.models.ad_unlock import AdUnlock

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/analytics/overview")
def overview(db: Session = Depends(get_db), _=Depends(require_admin)):
    now = datetime.now(timezone.utc)
    last_24h = now - timedelta(days=1)
    return {
        "users_total": db.query(func.count(User.id)).scalar() or 0,
        "users_premium": db.query(func.count(User.id)).filter(User.premium_status.is_(True)).scalar() or 0,
        "novels_total": db.query(func.count(Novel.id)).scalar() or 0,
        "novels_published": db.query(func.count(Novel.id)).filter(Novel.status == "published").scalar() or 0,
        "novels_upcoming": db.query(func.count(Novel.id)).filter(Novel.status == "upcoming").scalar() or 0,
        "chapters_total": db.query(func.count(Chapter.id)).scalar() or 0,
        "ratings_total": db.query(func.count(Rating.id)).scalar() or 0,
        "avg_rating": float(round(float(db.query(func.coalesce(func.avg(Rating.score), 0.0)).scalar() or 0.0), 2)),
        "subscriptions_active": db.query(func.count(Subscription.id))
        .filter(Subscription.status == "active")
        .scalar()
        or 0,
        "ad_unlocks_24h": db.query(func.count(AdUnlock.id))
        .filter(AdUnlock.unlocked_at >= last_24h)
        .scalar()
        or 0,
    }


@router.get("/users")
def list_users(db: Session = Depends(get_db), _=Depends(require_admin), limit: int = 100, offset: int = 0):
    rows = db.query(User).order_by(User.created_at.desc()).offset(offset).limit(limit).all()
    return [
        {
            "id": u.id,
            "email": u.email,
            "phone": u.phone,
            "name": u.name,
            "role": u.role,
            "premium_status": u.premium_status,
            "provider": u.provider,
            "country_code": u.country_code,
            "created_at": u.created_at.isoformat(),
        }
        for u in rows
    ]


@router.get("/subscriptions")
def list_subs(db: Session = Depends(get_db), _=Depends(require_admin), limit: int = 100, offset: int = 0):
    rows = db.query(Subscription).order_by(Subscription.id.desc()).offset(offset).limit(limit).all()
    return [
        {
            "id": s.id,
            "user_id": s.user_id,
            "provider": s.provider,
            "plan": s.plan,
            "status": s.status,
            "started_at": s.started_at.isoformat() if s.started_at else None,
            "expires_at": s.expires_at.isoformat() if s.expires_at else None,
            "cancelled_at": s.cancelled_at.isoformat() if s.cancelled_at else None,
        }
        for s in rows
    ]


@router.post("/push/compose")
def push_compose(payload: dict, _=Depends(require_admin)):
    """MOCKED OneSignal push composer."""
    title = (payload or {}).get("title", "")
    message = (payload or {}).get("message", "")
    segment = (payload or {}).get("segment", "all")
    if not title or not message:
        return {"sent": False, "error": "title and message are required"}
    return {
        "sent": True,
        "mocked": True,
        "provider": "onesignal",
        "title": title,
        "message": message,
        "segment": segment,
        "delivered_at": datetime.now(timezone.utc).isoformat(),
    }
