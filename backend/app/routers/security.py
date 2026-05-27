"""Security helpers (admin) — fetch the AES-256 content key on app boot.

The mobile app calls this once at launch to obtain the symmetric key that
decrypts on-device downloaded chapters.  The key is rotated server-side only
and is **never persisted** on the device.

If the user's premium status is false the endpoint returns 403, which is the
mobile app's cue to purge all locally-encrypted content.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import get_settings
from app.core.deps import get_current_user
from app.services.access import is_user_premium

router = APIRouter(prefix="/security", tags=["security"])
settings = get_settings()


@router.get("/content-key")
def content_key(db: Session = Depends(get_db), user=Depends(get_current_user)):
    if not is_user_premium(db, user.id):
        raise HTTPException(status_code=403, detail="Premium subscription required")
    # In production we'd rotate per-user; for the mock we share a 32-byte key.
    return {
        "algo": "AES-256-GCM",
        "key_base64": settings.AES_CONTENT_KEY,  # 32-byte key (utf-8 string)
        "expires_in_seconds": 3600,
    }
