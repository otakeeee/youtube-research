"""
ベースモデル（すべてのモデルで共通する項目）
"""
from datetime import datetime
from sqlalchemy import Column, Integer, DateTime
from sqlalchemy.ext.declarative import declared_attr


class TimestampMixin:
    """作成日時・更新日時を自動管理するMixin"""

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class BaseModel(TimestampMixin):
    """すべてのモデルの基底クラス"""

    @declared_attr
    def __tablename__(cls):
        # クラス名をテーブル名として使用（小文字・スネークケース）
        return cls.__name__.lower()

    id = Column(Integer, primary_key=True, index=True)
