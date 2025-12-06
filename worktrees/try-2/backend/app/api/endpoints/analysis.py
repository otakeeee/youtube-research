"""
Video Analysis API Endpoints
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.video import Video
from app.models.analysis import VideoAnalysis
from app.schemas.analysis import AnalysisResponse, AnalyzeVideoRequest
from app.services.llm_service import LLMService

router = APIRouter()


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_video(
    request: AnalyzeVideoRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    動画を分析して「伸びる要素」を抽出
    
    LLMを使用して動画のタイトル・説明文・タグを分析し、
    フック、ベネフィット、構成パターンなどを抽出します。
    """
    # 動画を取得
    result = await db.execute(
        select(Video).where(Video.id == request.video_id)
    )
    video = result.scalar_one_or_none()
    
    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Video with id {request.video_id} not found"
        )
    
    # 既存の分析結果を確認
    result = await db.execute(
        select(VideoAnalysis).where(VideoAnalysis.video_id == request.video_id)
    )
    existing_analysis = result.scalar_one_or_none()
    
    if existing_analysis and not request.force_reanalyze:
        return existing_analysis
    
    # LLMで分析
    try:
        llm_service = LLMService()
        analysis_result = llm_service.analyze_video(
            title=video.title,
            description=video.description or "",
            channel_title=video.channel_title or "",
            view_count=video.view_count or 0,
            tags=video.tags
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"LLM service error: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis failed: {str(e)}"
        )
    
    # 分析結果を保存
    if existing_analysis:
        # 既存の分析を更新
        existing_analysis.summary = analysis_result.get("summary")
        existing_analysis.hooks = analysis_result.get("hooks")
        existing_analysis.benefits = analysis_result.get("benefits")
        existing_analysis.structure = analysis_result.get("structure")
        existing_analysis.target_audience = analysis_result.get("target_audience")
        existing_analysis.cta_pattern = analysis_result.get("cta_pattern")
        existing_analysis.score = analysis_result.get("score", 0)
        analysis = existing_analysis
    else:
        # 新規作成
        analysis = VideoAnalysis(
            video_id=request.video_id,
            summary=analysis_result.get("summary"),
            hooks=analysis_result.get("hooks"),
            benefits=analysis_result.get("benefits"),
            structure=analysis_result.get("structure"),
            target_audience=analysis_result.get("target_audience"),
            cta_pattern=analysis_result.get("cta_pattern"),
            score=analysis_result.get("score", 0)
        )
        db.add(analysis)
    
    await db.commit()
    await db.refresh(analysis)
    
    return analysis


@router.get("/videos/{video_id}", response_model=Optional[AnalysisResponse])
async def get_video_analysis(
    video_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    動画の分析結果を取得
    """
    result = await db.execute(
        select(VideoAnalysis).where(VideoAnalysis.video_id == video_id)
    )
    analysis = result.scalar_one_or_none()
    
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis for video {video_id} not found"
        )
    
    return analysis

