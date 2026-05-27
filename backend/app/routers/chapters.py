"""Chapter routes — read content with paywall + admin CRUD."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user, require_admin, get_optional_user
from app.models.chapter import Chapter
from app.models.novel import Novel
from app.schemas.novel import ChapterCreate, ChapterUpdate, ChapterMeta, ChapterOut
from app.services.access import is_user_premium, has_unlocked_chapter

router = APIRouter(tags=["chapters"])


@router.get("/novels/{novel_id}/chapters", response_model=List[ChapterMeta])
def list_chapters(novel_id: int, db: Session = Depends(get_db)):
    novel = db.query(Novel).filter(Novel.id == novel_id).first()
    if not novel:
        raise HTTPException(status_code=404, detail="Novel not found")
    chapters = (
        db.query(Chapter)
        .filter(Chapter.novel_id == novel_id)
        .order_by(Chapter.chapter_number.asc())
        .all()
    )
    return chapters


@router.get("/chapters/{chapter_id}", response_model=ChapterOut)
def get_chapter(chapter_id: int, db: Session = Depends(get_db), user=Depends(get_optional_user)):
    ch = db.query(Chapter).filter(Chapter.id == chapter_id).first()
    if not ch:
        raise HTTPException(status_code=404, detail="Chapter not found")
    locked = False
    if ch.is_premium:
        if not user:
            locked = True
        else:
            premium = is_user_premium(db, user.id)
            unlocked = has_unlocked_chapter(db, user.id, ch.id)
            if not premium and not unlocked:
                locked = True
    if locked:
        return ChapterOut(
            id=ch.id,
            novel_id=ch.novel_id,
            chapter_number=ch.chapter_number,
            title=ch.title,
            is_premium=ch.is_premium,
            published_at=ch.published_at,
            content="",
            locked=True,
        )
    return ChapterOut(
        id=ch.id,
        novel_id=ch.novel_id,
        chapter_number=ch.chapter_number,
        title=ch.title,
        is_premium=ch.is_premium,
        published_at=ch.published_at,
        content=ch.content,
        locked=False,
    )


@router.post("/novels/{novel_id}/chapters", response_model=ChapterMeta, status_code=201)
def create_chapter(novel_id: int, payload: ChapterCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    novel = db.query(Novel).filter(Novel.id == novel_id).first()
    if not novel:
        raise HTTPException(status_code=404, detail="Novel not found")
    exists = (
        db.query(Chapter)
        .filter(Chapter.novel_id == novel_id, Chapter.chapter_number == payload.chapter_number)
        .first()
    )
    if exists:
        raise HTTPException(status_code=400, detail="Chapter number already exists for this novel")
    ch = Chapter(novel_id=novel_id, **payload.model_dump())
    db.add(ch)
    db.commit()
    db.refresh(ch)
    return ch


@router.patch("/chapters/{chapter_id}", response_model=ChapterMeta)
def update_chapter(chapter_id: int, payload: ChapterUpdate, db: Session = Depends(get_db), _=Depends(require_admin)):
    ch = db.query(Chapter).filter(Chapter.id == chapter_id).first()
    if not ch:
        raise HTTPException(status_code=404, detail="Chapter not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(ch, k, v)
    db.add(ch)
    db.commit()
    db.refresh(ch)
    return ch


@router.delete("/chapters/{chapter_id}", status_code=204)
def delete_chapter(chapter_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    ch = db.query(Chapter).filter(Chapter.id == chapter_id).first()
    if not ch:
        raise HTTPException(status_code=404, detail="Chapter not found")
    db.delete(ch)
    db.commit()
    return
