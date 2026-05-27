"""Ad-unlock route — verifies a rewarded ad and unlocks a premium chapter.

The actual AdMob SSV signature is mocked: any non-empty ad_reward_token is
considered valid.  We enforce a daily per-user cap from configuration.
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.config import get_settings
from app.core.rate_limit import check_rate
from app.models.chapter import Chapter
from app.models.ad_unlock import AdUnlock
from app.models.user import User
from app.schemas.common import AdUnlockIn, AdUnlockOut
from app.services.access import ad_unlock_count_today, has_unlocked_chapter, is_user_premium

router = APIRouter(prefix="/ads", tags=["ads"])
settings = get_settings()


@router.post("/unlock", response_model=AdUnlockOut)
def unlock_chapter(payload: AdUnlockIn, request: Request, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    # Rate-limit per user
    if not check_rate(f"ad_unlock:{user.id}", 20, 60):
        raise HTTPException(status_code=429, detail="Too many unlock attempts")

    if not payload.ad_reward_token:
        raise HTTPException(status_code=400, detail="Missing ad_reward_token")

    chapter = db.query(Chapter).filter(Chapter.id == payload.chapter_id).first()
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")
    if not chapter.is_premium:
        return AdUnlockOut(
            chapter_id=chapter.id,
            unlocked=True,
            remaining_today=settings.FREE_TIER_DAILY_AD_UNLOCK_CAP - ad_unlock_count_today(db, user.id),
            daily_cap=settings.FREE_TIER_DAILY_AD_UNLOCK_CAP,
        )

    # Premium subscribers don't need ads
    if is_user_premium(db, user.id):
        return AdUnlockOut(
            chapter_id=chapter.id,
            unlocked=True,
            remaining_today=settings.FREE_TIER_DAILY_AD_UNLOCK_CAP,
            daily_cap=settings.FREE_TIER_DAILY_AD_UNLOCK_CAP,
        )

    # Already unlocked within 24h?
    if has_unlocked_chapter(db, user.id, chapter.id):
        return AdUnlockOut(
            chapter_id=chapter.id,
            unlocked=True,
            remaining_today=settings.FREE_TIER_DAILY_AD_UNLOCK_CAP - ad_unlock_count_today(db, user.id),
            daily_cap=settings.FREE_TIER_DAILY_AD_UNLOCK_CAP,
        )

    used = ad_unlock_count_today(db, user.id)
    if used >= settings.FREE_TIER_DAILY_AD_UNLOCK_CAP:
        raise HTTPException(status_code=429, detail="Daily ad-unlock cap reached")

    unlock = AdUnlock(user_id=user.id, chapter_id=chapter.id)
    db.add(unlock)
    db.commit()
    return AdUnlockOut(
        chapter_id=chapter.id,
        unlocked=True,
        remaining_today=settings.FREE_TIER_DAILY_AD_UNLOCK_CAP - (used + 1),
        daily_cap=settings.FREE_TIER_DAILY_AD_UNLOCK_CAP,
    )


@router.get("/status")
def status(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    used = ad_unlock_count_today(db, user.id)
    return {
        "used_today": used,
        "remaining_today": max(settings.FREE_TIER_DAILY_AD_UNLOCK_CAP - used, 0),
        "daily_cap": settings.FREE_TIER_DAILY_AD_UNLOCK_CAP,
    }
