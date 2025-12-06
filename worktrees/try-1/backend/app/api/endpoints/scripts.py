"""
Script Generation API Endpoints
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.project import Project
from app.models.video import Video
from app.models.analysis import VideoAnalysis
from app.models.script import Script
from app.schemas.script import (
    ScriptResponse, ScriptCreate, ScriptUpdate,
    GenerateScriptRequest
)
from app.services.llm_service import LLMService

router = APIRouter()


@router.post("/generate", response_model=ScriptResponse)
async def generate_script(
    request: GenerateScriptRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    台本を自動生成
    
    ベース動画の分析結果（1-3本）またはカスタムトピックを元に、
    LLMを使用して非属人型YouTube動画の台本を生成します。
    """
    # プロジェクトの存在確認
    result = await db.execute(
        select(Project).where(Project.id == request.project_id)
    )
    project = result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project {request.project_id} not found"
        )
    
    # 複数動画の分析結果を取得
    analyses_data = None
    analysis_data = None
    primary_video_id = None
    
    # 複数動画の場合（base_video_ids）
    if request.base_video_ids and len(request.base_video_ids) > 0:
        if len(request.base_video_ids) > 3:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Maximum 3 videos can be used as reference"
            )
        
        analyses_data = []
        for video_id in request.base_video_ids:
            result = await db.execute(
                select(VideoAnalysis).where(VideoAnalysis.video_id == video_id)
            )
            analysis = result.scalar_one_or_none()
            
            if analysis:
                analyses_data.append({
                    "summary": analysis.summary,
                    "hooks": analysis.hooks or [],
                    "benefits": analysis.benefits or [],
                    "structure": analysis.structure or [],
                    "target_audience": analysis.target_audience,
                    "cta_pattern": analysis.cta_pattern,
                    "score": analysis.score
                })
        
        if len(analyses_data) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No analysis found for the selected videos. Please analyze videos first."
            )
        
        primary_video_id = request.base_video_ids[0]
    
    # 単一動画の場合（base_video_id）
    elif request.base_video_id:
        result = await db.execute(
            select(VideoAnalysis).where(VideoAnalysis.video_id == request.base_video_id)
        )
        analysis = result.scalar_one_or_none()
        
        if analysis:
            analysis_data = {
                "summary": analysis.summary,
                "hooks": analysis.hooks or [],
                "benefits": analysis.benefits or [],
                "structure": analysis.structure or [],
                "target_audience": analysis.target_audience,
                "cta_pattern": analysis.cta_pattern
            }
        primary_video_id = request.base_video_id
    
    # オファー情報を辞書に変換
    offer_data = None
    if request.offer:
        offer_data = request.offer.model_dump()
    
    # LLMで台本生成
    try:
        llm_service = LLMService()
        script_result = llm_service.generate_script(
            analysis=analysis_data,
            analyses=analyses_data,
            topic=request.custom_topic,
            tone=request.tone,
            length_type=request.length_type,
            offer=offer_data
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"LLM service error: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Script generation failed: {str(e)}"
        )
    
    # 台本を保存
    script = Script(
        project_id=request.project_id,
        base_video_id=primary_video_id,
        title=script_result.get("title", "無題の台本"),
        tone=request.tone,
        length_type=request.length_type,
        sections=script_result.get("sections", []),
        cta_text=script_result.get("cta_text"),
        offer_info=offer_data,
        status="draft"
    )
    
    db.add(script)
    await db.commit()
    await db.refresh(script)
    
    return script


@router.get("/", response_model=List[ScriptResponse])
async def get_scripts(
    project_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    """
    台本一覧を取得
    """
    query = select(Script)
    
    if project_id:
        query = query.where(Script.project_id == project_id)
    
    query = query.offset(skip).limit(limit).order_by(Script.created_at.desc())
    
    result = await db.execute(query)
    scripts = result.scalars().all()
    
    return scripts


@router.get("/{script_id}", response_model=ScriptResponse)
async def get_script(
    script_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    台本を取得
    """
    result = await db.execute(
        select(Script).where(Script.id == script_id)
    )
    script = result.scalar_one_or_none()
    
    if not script:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Script {script_id} not found"
        )
    
    return script


@router.put("/{script_id}", response_model=ScriptResponse)
async def update_script(
    script_id: int,
    script_data: ScriptUpdate,
    db: AsyncSession = Depends(get_db)
):
    """
    台本を更新
    """
    result = await db.execute(
        select(Script).where(Script.id == script_id)
    )
    script = result.scalar_one_or_none()
    
    if not script:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Script {script_id} not found"
        )
    
    update_data = script_data.model_dump(exclude_unset=True)
    
    # sectionsとoffer_infoは特別な処理
    if "sections" in update_data and update_data["sections"]:
        update_data["sections"] = [s.model_dump() if hasattr(s, 'model_dump') else s for s in update_data["sections"]]
    if "offer_info" in update_data and update_data["offer_info"]:
        update_data["offer_info"] = update_data["offer_info"].model_dump() if hasattr(update_data["offer_info"], 'model_dump') else update_data["offer_info"]
    
    for key, value in update_data.items():
        setattr(script, key, value)
    
    await db.commit()
    await db.refresh(script)
    
    return script


@router.delete("/{script_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_script(
    script_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    台本を削除
    """
    result = await db.execute(
        select(Script).where(Script.id == script_id)
    )
    script = result.scalar_one_or_none()
    
    if not script:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Script {script_id} not found"
        )
    
    await db.delete(script)
    await db.commit()
    
    return None
