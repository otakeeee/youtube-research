from sqlalchemy import Column, Integer, String, Text, JSON
from app.database import Base
from app.models.base import BaseModel


class Template(Base, BaseModel):
    """
    Template Table
    Store script templates for reuse
    """
    __tablename__ = "templates"

    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    genre = Column(String(100), nullable=True)  # 副業, 投資, ライフスタイル など
    target_length = Column(String(50), nullable=True)  # 5min, 10min, 15min, 20min
    sections = Column(JSON, nullable=False)  # [{"name": "フック", "duration": "30秒", "description": "視聴者の興味を引く"}]
    tone = Column(String(100), nullable=True)  # logical_and_casual, friendly, professional
    tips = Column(Text, nullable=True)  # テンプレート使用時のコツ
    is_default = Column(Integer, default=0)  # デフォルトテンプレートかどうか

    def __repr__(self):
        return f"<Template(id={self.id}, name='{self.name}')>"

