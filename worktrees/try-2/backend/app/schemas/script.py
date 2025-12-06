"""
Script Schemas
"""
from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


class ScriptSection(BaseModel):
    """台本セクション"""
    name: str = Field(..., description="セクション名")
    content: str = Field(..., description="セクション内容")


class OfferInfo(BaseModel):
    """オファー情報"""
    lp_url: Optional[str] = Field(None, description="LP URL")
    offer_type: Optional[str] = Field(None, description="オファータイプ（無料PDF等）")
    offer_title: Optional[str] = Field(None, description="オファータイトル")
    target_audience: Optional[str] = Field(None, description="ターゲット")


class ScriptBase(BaseModel):
    """Base Script Schema"""
    title: str = Field(..., description="台本タイトル")
    tone: Optional[str] = Field("logical_and_casual", description="トーン")
    length_type: Optional[str] = Field("10min", description="動画の長さ")
    sections: List[ScriptSection] = Field(..., description="セクション")
    cta_text: Optional[str] = Field(None, description="CTA文")
    offer_info: Optional[OfferInfo] = Field(None, description="オファー情報")
    status: str = Field("draft", description="ステータス")


class ScriptCreate(BaseModel):
    """Script Create Schema"""
    project_id: int = Field(..., description="プロジェクトID")
    base_video_id: Optional[int] = Field(None, description="ベース動画ID")
    title: str = Field(..., description="台本タイトル")
    tone: Optional[str] = Field("logical_and_casual", description="トーン")
    length_type: Optional[str] = Field("10min", description="動画の長さ")
    sections: List[ScriptSection] = Field(..., description="セクション")
    cta_text: Optional[str] = Field(None, description="CTA文")
    offer_info: Optional[OfferInfo] = Field(None, description="オファー情報")


class ScriptUpdate(BaseModel):
    """Script Update Schema"""
    title: Optional[str] = None
    tone: Optional[str] = None
    length_type: Optional[str] = None
    sections: Optional[List[ScriptSection]] = None
    cta_text: Optional[str] = None
    offer_info: Optional[OfferInfo] = None
    status: Optional[str] = None


class ScriptResponse(BaseModel):
    """Script Response Schema"""
    id: int
    project_id: int
    base_video_id: Optional[int]
    title: str
    tone: Optional[str]
    length_type: Optional[str]
    sections: List[Dict[str, Any]]
    cta_text: Optional[str]
    offer_info: Optional[Dict[str, Any]]
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class GenerateScriptRequest(BaseModel):
    """台本生成リクエスト"""
    project_id: int = Field(..., description="プロジェクトID")
    base_video_id: Optional[int] = Field(None, description="ベース動画ID（単一動画の場合）")
    base_video_ids: Optional[List[int]] = Field(None, description="ベース動画IDリスト（複数動画の場合、1-3本）")
    tone: str = Field("logical_and_casual", description="トーン")
    length_type: str = Field("10min", description="動画の長さ")
    offer: Optional[OfferInfo] = Field(None, description="オファー情報")
    custom_topic: Optional[str] = Field(None, description="カスタムトピック（ベース動画がない場合）")
    template_id: Optional[int] = Field(None, description="テンプレートID")
