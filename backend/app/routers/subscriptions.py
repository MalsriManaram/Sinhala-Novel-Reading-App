"""Subscription routes — RevenueCat + Dialog Ideamart (mocked)."""
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.subscription import Subscription
from app.models.user import User
from app.schemas.common import SubscribeIn, SubscriptionOut
from app.services import otp_service
from app.services.geo import is_sri_lanka, get_country_code

router = APIRouter(prefix="/subscriptions", tags=["subscriptions"])

PLAN_DAYS = {"daily": 1, "weekly": 7, "monthly": 30}


@router.get("/paywall-config")
def paywall_config(request: Request, user: User | None = Depends(lambda: None)):
    """Return paywall variant depending on user location.

    Mobile clients use this to decide between RevenueCat IAP (international)
    and Dialog Ideamart OTP (Sri Lanka).
    """
    cc = get_country_code(request)
    if cc == "LK":
        return {
            "country": "LK",
            "provider": "ideamart",
            "plans": [
                {"id": "daily", "label": "Daily", "price_lkr": 30},
                {"id": "weekly", "label": "Weekly", "price_lkr": 150},
                {"id": "monthly", "label": "Monthly", "price_lkr": 500},
            ],
            "mocked": True,
        }
    return {
        "country": cc,
        "provider": "revenuecat",
        "plans": [
            {"id": "monthly", "label": "Monthly", "price_usd": 4.99},
            {"id": "yearly", "label": "Yearly", "price_usd": 39.99},
        ],
        "mocked": True,
    }


@router.post("/subscribe", response_model=SubscriptionOut)
def subscribe(payload: SubscribeIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if payload.provider == "ideamart":
        if not payload.phone or not payload.otp_code:
            raise HTTPException(status_code=400, detail="Ideamart subscription requires phone and otp_code")
        if not otp_service.verify_otp(db, payload.phone, payload.otp_code, purpose="subscribe"):
            raise HTTPException(status_code=401, detail="Invalid or expired OTP")
        if not user.phone:
            user.phone = payload.phone
            db.add(user)
    elif payload.provider == "revenuecat":
        # MOCKED — we'd verify entitlement via webhook in production
        if not payload.external_id:
            payload.external_id = f"rc_mock_{datetime.now(timezone.utc).timestamp():.0f}"
    else:
        raise HTTPException(status_code=400, detail="Unsupported provider")

    days = PLAN_DAYS.get(payload.plan, 30)
    sub = Subscription(
        user_id=user.id,
        provider=payload.provider,
        plan=payload.plan,
        status="active",
        started_at=datetime.now(timezone.utc),
        expires_at=datetime.now(timezone.utc) + timedelta(days=days),
        external_id=payload.external_id,
    )
    db.add(sub)
    user.premium_status = True
    db.add(user)
    db.commit()
    db.refresh(sub)
    return sub


@router.post("/cancel", response_model=SubscriptionOut)
def cancel(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    sub = (
        db.query(Subscription)
        .filter(Subscription.user_id == user.id, Subscription.status == "active")
        .order_by(Subscription.id.desc())
        .first()
    )
    if not sub:
        raise HTTPException(status_code=404, detail="No active subscription")
    sub.status = "cancelled"
    sub.cancelled_at = datetime.now(timezone.utc)
    user.premium_status = False
    db.add(sub)
    db.add(user)
    db.commit()
    db.refresh(sub)
    return sub


@router.get("/mine", response_model=list[SubscriptionOut])
def my_subscriptions(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return (
        db.query(Subscription)
        .filter(Subscription.user_id == user.id)
        .order_by(Subscription.id.desc())
        .all()
    )


@router.post("/otp/request")
def subscribe_otp_request(phone: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    code = otp_service.generate_otp(db, phone, purpose="subscribe")
    return {"sent": True, "mocked_code": code, "expires_in_seconds": 300}


@router.post("/webhook/revenuecat")
async def revenuecat_webhook(request: Request, db: Session = Depends(get_db)):
    """MOCKED RevenueCat webhook listener.

    Accepts JSON of shape:
      {"event": {"type": "INITIAL_PURCHASE"|"CANCELLATION"|"EXPIRATION",
                 "app_user_id": "<user_id>", "product_id": "...",
                 "expiration_at_ms": 17500000000000}}
    """
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON")
    event = (body or {}).get("event") or {}
    etype = event.get("type")
    app_user_id = event.get("app_user_id")
    if not app_user_id:
        raise HTTPException(status_code=400, detail="Missing app_user_id")
    try:
        user_id = int(app_user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="app_user_id must be the internal user id")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if etype == "INITIAL_PURCHASE" or etype == "RENEWAL":
        expires_ms = event.get("expiration_at_ms")
        expires_at = (
            datetime.fromtimestamp(int(expires_ms) / 1000, tz=timezone.utc)
            if expires_ms
            else datetime.now(timezone.utc) + timedelta(days=30)
        )
        sub = Subscription(
            user_id=user.id,
            provider="revenuecat",
            plan="monthly",
            status="active",
            started_at=datetime.now(timezone.utc),
            expires_at=expires_at,
            external_id=event.get("transaction_id") or event.get("product_id"),
        )
        db.add(sub)
        user.premium_status = True
        db.add(user)
    elif etype in ("CANCELLATION", "EXPIRATION"):
        active = (
            db.query(Subscription)
            .filter(Subscription.user_id == user.id, Subscription.status == "active")
            .all()
        )
        for s in active:
            s.status = "cancelled" if etype == "CANCELLATION" else "expired"
            s.cancelled_at = datetime.now(timezone.utc)
            db.add(s)
        user.premium_status = False
        db.add(user)
    else:
        return {"ignored": True, "event": etype}
    db.commit()
    return {"ok": True, "event": etype}
