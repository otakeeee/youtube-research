"""
FastAPI Application Entry Point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.database import engine, Base
from app.api import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """アプリケーション起動時・終了時の処理"""
    # 起動時：テーブルを作成
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield

    # 終了時：クリーンアップ（必要に応じて）
    await engine.dispose()


# FastAPIアプリケーション作成
app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description="YouTube動画リサーチ & 台本自動生成システム",
    lifespan=lifespan  # ライフサイクル管理を追加
)

# CORS configuration (development)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API router
app.include_router(api_router, prefix="/api")


@app.get("/")
async def root():
    """ルートエンドポイント"""
    return {
        "message": "YouTube Research API",
        "version": "0.1.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """ヘルスチェックエンドポイント"""
    return {
        "status": "healthy",
        "app_name": settings.app_name,
        "debug": settings.debug,
        "database": "connected"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug
    )
