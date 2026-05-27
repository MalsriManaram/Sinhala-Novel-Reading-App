"""Pydantic schemas — novels & chapters."""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class NovelBase(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    author: str = Field(min_length=1, max_length=160)
    synopsis: Optional[str] = None
    cover_url: Optional[str] = None
    category: str = "General"
    status: str = "published"  # draft/upcoming/published
    release_at: Optional[datetime] = None


class NovelCreate(NovelBase):
    pass


class NovelUpdate(BaseModel):
    title: Optional[str] = None
    author: Optional[str] = None
    synopsis: Optional[str] = None
    cover_url: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = None
    release_at: Optional[datetime] = None


class NovelOut(NovelBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime
    avg_rating: float = 0.0
    rating_count: int = 0
    chapter_count: int = 0


class ChapterBase(BaseModel):
    chapter_number: int = Field(ge=1)
    title: Optional[str] = None
    content: str
    is_premium: bool = False
    published_at: Optional[datetime] = None


class ChapterCreate(ChapterBase):
    pass


class ChapterUpdate(BaseModel):
    chapter_number: Optional[int] = None
    title: Optional[str] = None
    content: Optional[str] = None
    is_premium: Optional[bool] = None
    published_at: Optional[datetime] = None


class ChapterMeta(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    novel_id: int
    chapter_number: int
    title: Optional[str] = None
    is_premium: bool
    published_at: datetime


class ChapterOut(ChapterMeta):
    content: str
    locked: bool = False  # for free users on premium chapters
