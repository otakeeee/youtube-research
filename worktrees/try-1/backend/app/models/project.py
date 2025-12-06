"""
Project Model
"""
from sqlalchemy import Column, String, Text, JSON
from app.database import Base
from app.models.base import BaseModel


class Project(Base, BaseModel):
    """
    Project Table
    Manage YouTube channel/genre projects
    """
    __tablename__ = "projects"

    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    target_language = Column(String(10), default="ja", nullable=False)
    main_genre = Column(String(100), nullable=True)
    keywords = Column(JSON, nullable=True)

    def __repr__(self):
        return f"<Project(id={self.id}, name='{self.name}')>"
