"""
API Endpoints
"""
from fastapi import APIRouter
from app.api.endpoints import projects, research, analysis, scripts, templates, settings

# Create main router
api_router = APIRouter()

# Register endpoints
api_router.include_router(
    projects.router,
    prefix="/projects",
    tags=["projects"]
)

api_router.include_router(
    research.router,
    prefix="/research",
    tags=["research"]
)

api_router.include_router(
    analysis.router,
    prefix="/analysis",
    tags=["analysis"]
)

api_router.include_router(
    scripts.router,
    prefix="/scripts",
    tags=["scripts"]
)

api_router.include_router(
    templates.router,
    prefix="/templates",
    tags=["templates"]
)

api_router.include_router(
    settings.router,
    prefix="/settings",
    tags=["settings"]
)
