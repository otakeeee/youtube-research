"""
Video Analysis Schemas
"""
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field


class AnalysisBase(BaseModel):
    """Base Analysis Schema"""
    summary: Optional[str] = Field(None, description="動画の要約")
    hooks: Optional[List[str]] = Field(None, description="フック（視聴者を引き付ける要素）")
    benefits: Optional[List[str]] = Field(None, description="ベネフィット")
    structure: Optional[List[str]] = Field(None, description="構成パターン")
    target_audience: Optional[str] = Field(None, description="ターゲット視聴者")
    cta_pattern: Optional[str] = Field(None, description="CTAパターン")
    score: int = Field(0, ge=0, le=100, description="分析スコア")


class AnalysisCreate(AnalysisBase):
    """Analysis Create Schema"""
    video_id: int = Field(..., description="Video ID")


class AnalysisResponse(AnalysisBase):
    """Analysis Response Schema"""
    id: int
    video_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AnalyzeVideoRequest(BaseModel):
    """動画分析リクエスト"""
    video_id: int = Field(..., description="分析対象の動画ID")
    force_reanalyze: bool = Field(False, description="既存の分析結果を上書きするか")

