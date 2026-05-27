"""Novel routes — public list/detail + admin CRUD."""
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import require_admin
from app.models.novel import Novel
from app.models.rating import Rating
from app.models.chapter import Chapter
from app.schemas.novel import NovelCreate, NovelUpdate, NovelOut

router = APIRouter(prefix="/novels", tags=["novels"])


def _serialize_novel(db: Session, n: Novel) -> NovelOut:
    avg, count = (
        db.query(func.coalesce(func.avg(Rating.score), 0.0), func.count(Rating.id))
        .filter(Rating.novel_id == n.id)
        .one()
    )
    chap_count = db.query(func.count(Chapter.id)).filter(Chapter.novel_id == n.id).scalar() or 0
    return NovelOut(
        id=n.id,
        title=n.title,
        author=n.author,
        synopsis=n.synopsis,
        cover_url=n.cover_url,
        category=n.category,
        status=n.status,
        release_at=n.release_at,
        created_at=n.created_at,
        avg_rating=float(round(float(avg or 0.0), 2)),
        rating_count=int(count or 0),
        chapter_count=int(chap_count),
    )


@router.get("", response_model=List[NovelOut])
def list_novels(
    db: Session = Depends(get_db),
    status: Optional[str] = Query(default=None, description="draft/upcoming/published"),
    category: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
):
    q = db.query(Novel)
    if status:
        q = q.filter(Novel.status == status)
    if category:
        q = q.filter(Novel.category == category)
    if search:
        like = f"%{search}%"
        q = q.filter((Novel.title.ilike(like)) | (Novel.author.ilike(like)))
    novels = q.order_by(Novel.created_at.desc()).offset(offset).limit(limit).all()
    return [_serialize_novel(db, n) for n in novels]


@router.get("/upcoming", response_model=List[NovelOut])
def upcoming(db: Session = Depends(get_db)):
    rows = (
        db.query(Novel)
        .filter(Novel.status == "upcoming")
        .order_by(Novel.release_at.is_(None), Novel.release_at.asc())
        .all()
    )
    return [_serialize_novel(db, n) for n in rows]


@router.get("/{novel_id}", response_model=NovelOut)
def get_novel(novel_id: int, db: Session = Depends(get_db)):
    n = db.query(Novel).filter(Novel.id == novel_id).first()
    if not n:
        raise HTTPException(status_code=404, detail="Novel not found")
    return _serialize_novel(db, n)


@router.post("", response_model=NovelOut, status_code=201)
def create_novel(payload: NovelCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    n = Novel(**payload.model_dump())
    db.add(n)
    db.commit()
    db.refresh(n)
    return _serialize_novel(db, n)


@router.patch("/{novel_id}", response_model=NovelOut)
def update_novel(novel_id: int, payload: NovelUpdate, db: Session = Depends(get_db), _=Depends(require_admin)):
    n = db.query(Novel).filter(Novel.id == novel_id).first()
    if not n:
        raise HTTPException(status_code=404, detail="Novel not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(n, k, v)
    db.add(n)
    db.commit()
    db.refresh(n)
    return _serialize_novel(db, n)


@router.delete("/{novel_id}", status_code=204)
def delete_novel(novel_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    n = db.query(Novel).filter(Novel.id == novel_id).first()
    if not n:
        raise HTTPException(status_code=404, detail="Novel not found")
    db.delete(n)
    db.commit()
    return
