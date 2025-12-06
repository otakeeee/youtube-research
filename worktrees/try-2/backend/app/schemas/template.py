from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime


class TemplateSectionBase(BaseModel):
    name: str = Field(..., description="セクション名")
    duration: Optional[str] = Field(None, description="目安の長さ")
    description: Optional[str] = Field(None, description="セクションの説明")
    example: Optional[str] = Field(None, description="例文")


class TemplateBase(BaseModel):
    name: str = Field(..., description="テンプレート名")
    description: Optional[str] = Field(None, description="テンプレートの説明")
    genre: Optional[str] = Field(None, description="ジャンル")
    target_length: Optional[str] = Field(None, description="目標動画長さ")
    sections: List[TemplateSectionBase] = Field(..., description="セクション構成")
    tone: Optional[str] = Field(None, description="トーン")
    tips: Optional[str] = Field(None, description="使用時のコツ")
    is_default: Optional[int] = Field(0, description="デフォルトテンプレート")


class TemplateCreate(TemplateBase):
    pass


class TemplateUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    genre: Optional[str] = None
    target_length: Optional[str] = None
    sections: Optional[List[TemplateSectionBase]] = None
    tone: Optional[str] = None
    tips: Optional[str] = None
    is_default: Optional[int] = None


class TemplateResponse(TemplateBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

