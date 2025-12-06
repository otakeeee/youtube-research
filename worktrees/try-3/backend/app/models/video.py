"""
Video Model
"""
from sqlalchemy import Column, String, Integer, Text, JSON, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.base import BaseModel


class Video(Base, BaseModel):
    """
    Video Table
    Store YouTube video metadata
    """
    __tablename__ = "videos"

    project_id = Column(Integer, ForeignKey('projects.id'), nullable=False, index=True)
    video_id = Column(String(20), nullable=False, unique=True, index=True)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    channel_title = Column(String(255), nullable=True)
    published_at = Column(DateTime, nullable=True)
    thumbnail_url = Column(String(500), nullable=True)
    view_count = Column(Integer, default=0)
    like_count = Column(Integer, default=0)
    comment_count = Column(Integer, default=0)
    duration = Column(String(50), nullable=True)
    tags = Column(JSON, nullable=True)

    # Relationship
    project = relationship("Project", backref="videos")

    def __repr__(self):
        return f"<Video(id={self.id}, video_id='{self.video_id}', title='{self.title[:30]}...')>"
