"""
Video Analysis Model
"""
from sqlalchemy import Column, String, Integer, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.base import BaseModel


class VideoAnalysis(Base, BaseModel):
    """
    Video Analysis Table
    Store LLM analysis results for videos
    """
    __tablename__ = "video_analyses"

    video_id = Column(Integer, ForeignKey('videos.id'), nullable=False, unique=True, index=True)
    
    # 分析結果
    summary = Column(Text, nullable=True)  # 動画の要約
    hooks = Column(JSON, nullable=True)  # フック（視聴者を引き付ける要素）
    benefits = Column(JSON, nullable=True)  # ベネフィット（視聴者が得られる価値）
    structure = Column(JSON, nullable=True)  # 構成パターン
    target_audience = Column(String(500), nullable=True)  # ターゲット視聴者
    cta_pattern = Column(String(500), nullable=True)  # CTAパターン
    score = Column(Integer, default=0)  # 分析スコア (0-100)
    
    # Relationship
    video = relationship("Video", backref="analysis")

    def __repr__(self):
        return f"<VideoAnalysis(id={self.id}, video_id={self.video_id})>"

