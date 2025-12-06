"""
Research API Endpoints (YouTube search)
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime

from app.database import get_db
from app.models.video import Video
from app.models.project import Project
from app.schemas.video import VideoSearchRequest, VideoResponse, VideoCreate
from app.services.youtube_service import YouTubeService

router = APIRouter()


@router.post("/search", response_model=List[dict])
async def search_youtube_videos(
    search_request: VideoSearchRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Search YouTube videos

    This endpoint searches YouTube and returns video metadata
    (does not save to database)
    """
    try:
        youtube_service = YouTubeService()
        videos = youtube_service.search_videos(
            query=search_request.query,
            max_results=search_request.max_results,
            order=search_request.order,
            published_after=search_request.published_after,
            published_before=search_request.published_before,
            video_duration=search_request.video_duration
        )

        return videos

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"YouTube search failed: {str(e)}"
        )


@router.post("/projects/{project_id}/videos/import", response_model=List[VideoResponse])
async def import_videos_to_project(
    project_id: int,
    search_request: VideoSearchRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Search YouTube and import videos to a project

    This endpoint:
    1. Searches YouTube
    2. Saves video metadata to database
    3. Links videos to the specified project
    """
    # Check if project exists
    result = await db.execute(
        select(Project).where(Project.id == project_id)
    )
    project = result.scalar_one_or_none()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project {project_id} not found"
        )

    # Search YouTube
    try:
        youtube_service = YouTubeService()
        videos_data = youtube_service.search_videos(
            query=search_request.query,
            max_results=search_request.max_results,
            order=search_request.order,
            published_after=search_request.published_after,
            published_before=search_request.published_before,
            video_duration=search_request.video_duration
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"YouTube search failed: {str(e)}"
        )

    # Save videos to database
    saved_videos = []
    for video_data in videos_data:
        # Check if video already exists
        result = await db.execute(
            select(Video).where(Video.video_id == video_data['video_id'])
        )
        existing_video = result.scalar_one_or_none()

        if existing_video:
            # Update existing video
            for key, value in video_data.items():
                if key == 'published_at' and isinstance(value, str):
                    value = datetime.fromisoformat(value.replace('Z', '+00:00'))
                setattr(existing_video, key, value)
            saved_videos.append(existing_video)
        else:
            # Create new video
            if isinstance(video_data.get('published_at'), str):
                video_data['published_at'] = datetime.fromisoformat(
                    video_data['published_at'].replace('Z', '+00:00')
                )

            video = Video(project_id=project_id, **video_data)
            db.add(video)
            saved_videos.append(video)

    await db.commit()

    # Refresh all videos
    for video in saved_videos:
        await db.refresh(video)

    return saved_videos
