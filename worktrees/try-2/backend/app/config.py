"""
アプリケーション設定管理
"""
import os
from pathlib import Path
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv

# .envファイルのパスを明示的に指定して読み込み
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=env_path, override=True)


class Settings(BaseSettings):
    """アプリケーション設定"""
    
    model_config = SettingsConfigDict(
        env_file=str(env_path),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    # アプリケーション基本設定
    app_name: str = "YouTubeResearch"
    debug: bool = True

    # API Keys
    youtube_api_key: Optional[str] = None
    anthropic_api_key: Optional[str] = None
    openai_api_key: Optional[str] = None
    gemini_api_key: Optional[str] = None
    
    # LLM Provider (anthropic, openai, or gemini)
    llm_provider: str = "openai"

    # Database (デフォルトはSQLite for 開発環境)
    database_url: str = "sqlite+aiosqlite:///./youtube_research.db"


# グローバル設定インスタンス
settings = Settings()

# デバッグ出力
if settings.debug:
    print(f"[Config] LLM Provider: {settings.llm_provider}")
    print(f"[Config] OpenAI Key loaded: {'Yes' if settings.openai_api_key and len(settings.openai_api_key) > 10 else 'No'}")
    print(f"[Config] Gemini Key loaded: {'Yes' if settings.gemini_api_key and len(settings.gemini_api_key) > 10 else 'No'}")
