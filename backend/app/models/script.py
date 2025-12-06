"""
Script Model
"""
from sqlalchemy import Column, String, Integer, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.base import BaseModel


class Script(Base, BaseModel):
    """
    Script Table
    Store generated video scripts
    """
    __tablename__ = "scripts"

    project_id = Column(Integer, ForeignKey('projects.id'), nullable=False, index=True)
    base_video_id = Column(Integer, ForeignKey('videos.id'), nullable=True, index=True)
    template_id = Column(Integer, ForeignKey('templates.id'), nullable=True, index=True)
    
    # 台本情報
    title = Column(String(500), nullable=False)
    tone = Column(String(100), nullable=True)  # トーン（logical_and_casual等）
    length_type = Column(String(50), nullable=True)  # 動画の長さ（5min, 10min等）
    
    # 台本内容
    sections = Column(JSON, nullable=False)  # セクション配列 [{name, content}]
    cta_text = Column(Text, nullable=True)  # CTA文
    
    # オファー情報
    offer_info = Column(JSON, nullable=True)  # {lp_url, offer_type, offer_title, target_audience}
    
    # ステータス
    status = Column(String(50), default="draft")  # draft, published, archived
    
    # Relationships
    project = relationship("Project", backref="scripts")
    base_video = relationship("Video", backref="scripts")

