"""
Video Schemas
"""
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field


class VideoBase(BaseModel):
    """Base Video Schema"""
    video_id: str = Field(..., description="YouTube video ID")
    title: str = Field(..., description="Video title")
    description: Optional[str] = Field(None, description="Video description")
    channel_title: Optional[str] = Field(None, description="Channel name")
    published_at: Optional[datetime] = Field(None, description="Published date")
    thumbnail_url: Optional[str] = Field(None, description="Thumbnail URL")
    view_count: int = Field(0, description="View count")
    like_count: int = Field(0, description="Like count")
    comment_count: int = Field(0, description="Comment count")
    duration: Optional[str] = Field(None, description="Video duration (ISO 8601)")
    tags: Optional[List[str]] = Field(None, description="Video tags")


class VideoCreate(VideoBase):
    """Video Create Schema"""
    project_id: int = Field(..., description="Project ID")


class VideoResponse(VideoBase):
    """Video Response Schema"""
    id: int
    project_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class VideoSearchRequest(BaseModel):
    """YouTube Search Request Schema"""
    query: str = Field(..., min_length=1, description="Search query")
    max_results: int = Field(10, ge=1, le=50, description="Max results (1-50)")
    order: str = Field("viewCount", description="Sort order")
    published_after: Optional[str] = Field(None, description="Published after (RFC 3339)")
    published_before: Optional[str] = Field(None, description="Published before (RFC 3339)")
    video_duration: Optional[str] = Field(None, description="Video duration filter")
