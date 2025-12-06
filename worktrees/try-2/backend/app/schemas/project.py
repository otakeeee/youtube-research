"""
Project Schemas
"""
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field


class ProjectBase(BaseModel):
    """Base Project Schema"""
    name: str = Field(..., min_length=1, max_length=255, description="Project name")
    description: Optional[str] = Field(None, description="Project description")
    target_language: str = Field("ja", max_length=10, description="Target language")
    main_genre: Optional[str] = Field(None, max_length=100, description="Main genre")
    keywords: Optional[List[str]] = Field(None, description="Keywords list")


class ProjectCreate(ProjectBase):
    """Project Create Schema"""
    pass


class ProjectUpdate(BaseModel):
    """Project Update Schema (all optional)"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    target_language: Optional[str] = Field(None, max_length=10)
    main_genre: Optional[str] = Field(None, max_length=100)
    keywords: Optional[List[str]] = None


class ProjectResponse(ProjectBase):
    """Project Response Schema"""
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
