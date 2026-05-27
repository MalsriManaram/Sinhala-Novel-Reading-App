"""Worth-the-Wait reminder routes."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.reminder import Reminder
from app.models.novel import Novel
from app.models.user import User
from app.schemas.common import ReminderIn, ReminderOut

router = APIRouter(prefix="/reminders", tags=["reminders"])


@router.post("", response_model=ReminderOut | dict)
def toggle_reminder(payload: ReminderIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    novel = db.query(Novel).filter(Novel.id == payload.novel_id).first()
    if not novel:
        raise HTTPException(status_code=404, detail="Novel not found")
    existing = (
        db.query(Reminder)
        .filter(Reminder.user_id == user.id, Reminder.novel_id == payload.novel_id)
        .first()
    )
    if payload.enabled:
        if existing:
            return ReminderOut.model_validate(existing)
        r = Reminder(user_id=user.id, novel_id=payload.novel_id)
        db.add(r)
        db.commit()
        db.refresh(r)
        return ReminderOut.model_validate(r)
    else:
        if existing:
            db.delete(existing)
            db.commit()
        return {"removed": True}


@router.get("/mine", response_model=list[ReminderOut])
def list_mine(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(Reminder).filter(Reminder.user_id == user.id).all()
