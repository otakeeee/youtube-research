"""
データベース接続の設定
"""
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.config import settings

# データベースエンジンを作成
engine = create_async_engine(
    settings.database_url,
    echo=settings.debug,  # SQLログを出力（デバッグ時のみ）
    future=True
)

# セッションファクトリを作成
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# ベースクラスを作成（すべてのモデルがこれを継承）
Base = declarative_base()


# 依存性注入用：各リクエストでDBセッションを取得
async def get_db():
    """
    FastAPIの依存性注入でDBセッションを取得する

    使用例:
    @app.get("/items")
    async def read_items(db: AsyncSession = Depends(get_db)):
        ...
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
