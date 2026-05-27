"""Rating routes — submit and update the user's rating for a novel."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.rating import Rating
from app.models.novel import Novel
from app.schemas.common import RatingIn, RatingOut

router = APIRouter(prefix="/ratings", tags=["ratings"])


@router.post("", response_model=RatingOut)
def upsert_rating(payload: RatingIn, db: Session = Depends(get_db), user=Depends(get_current_user)):
    novel = db.query(Novel).filter(Novel.id == payload.novel_id).first()
    if not novel:
        raise HTTPException(status_code=404, detail="Novel not found")
    rating = (
        db.query(Rating)
        .filter(Rating.user_id == user.id, Rating.novel_id == payload.novel_id)
        .first()
    )
    if rating:
        rating.score = payload.score
    else:
        rating = Rating(user_id=user.id, novel_id=payload.novel_id, score=payload.score)
        db.add(rating)
    db.commit()
    db.refresh(rating)
    return rating


@router.get("/mine", response_model=List[RatingOut])
def my_ratings(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return db.query(Rating).filter(Rating.user_id == user.id).all()


@router.get("/novel/{novel_id}", response_model=RatingOut | None)
def my_rating_for_novel(novel_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return (
        db.query(Rating)
        .filter(Rating.user_id == user.id, Rating.novel_id == novel_id)
        .first()
    )
