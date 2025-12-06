"""
Settings API Endpoints
"""
from typing import Dict, Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from pathlib import Path
import os

router = APIRouter()


class ApiKeyStatus(BaseModel):
    openai: bool
    anthropic: bool
    gemini: bool
    youtube: bool
    current_provider: str


class SetApiKeyRequest(BaseModel):
    provider: str  # openai, anthropic, gemini, youtube
    api_key: str


class SetProviderRequest(BaseModel):
    provider: str  # openai, anthropic, anthropic-sonnet45, gemini, gemini-flash


def get_env_path() -> Path:
    return Path(__file__).parent.parent.parent / ".env"


def read_env_file() -> Dict[str, str]:
    """Read .env file and return as dict"""
    env_path = get_env_path()
    env_vars = {}
    
    if env_path.exists():
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    env_vars[key.strip()] = value.strip()
    
    return env_vars


def write_env_file(env_vars: Dict[str, str]):
    """Write dict to .env file"""
    env_path = get_env_path()
    
    # Read existing file to preserve comments and order
    lines = []
    existing_keys = set()
    
    if env_path.exists():
        with open(env_path, 'r') as f:
            for line in f:
                stripped = line.strip()
                if stripped and not stripped.startswith('#') and '=' in stripped:
                    key = stripped.split('=', 1)[0].strip()
                    if key in env_vars:
                        lines.append(f"{key}={env_vars[key]}\n")
                        existing_keys.add(key)
                    else:
                        lines.append(line)
                else:
                    lines.append(line)
    
    # Add new keys
    for key, value in env_vars.items():
        if key not in existing_keys:
            lines.append(f"{key}={value}\n")
    
    with open(env_path, 'w') as f:
        f.writelines(lines)


@router.get("/api-keys/status", response_model=ApiKeyStatus)
async def get_api_key_status():
    """Get API key configuration status"""
    env_vars = read_env_file()
    
    # Also check environment variables (in case they're set externally)
    openai_key = env_vars.get('OPENAI_API_KEY') or os.environ.get('OPENAI_API_KEY', '')
    anthropic_key = env_vars.get('ANTHROPIC_API_KEY') or os.environ.get('ANTHROPIC_API_KEY', '')
    gemini_key = env_vars.get('GEMINI_API_KEY') or os.environ.get('GEMINI_API_KEY', '')
    youtube_key = env_vars.get('YOUTUBE_API_KEY') or os.environ.get('YOUTUBE_API_KEY', '')
    current_provider = env_vars.get('LLM_PROVIDER') or os.environ.get('LLM_PROVIDER', 'openai')
    
    return ApiKeyStatus(
        openai=bool(openai_key and len(openai_key) > 10 and not openai_key.startswith('YOUR_')),
        anthropic=bool(anthropic_key and len(anthropic_key) > 10 and not anthropic_key.startswith('YOUR_')),
        gemini=bool(gemini_key and len(gemini_key) > 10 and not gemini_key.startswith('YOUR_')),
        youtube=bool(youtube_key and len(youtube_key) > 10 and not youtube_key.startswith('YOUR_')),
        current_provider=current_provider
    )


@router.post("/api-keys/set")
async def set_api_key(request: SetApiKeyRequest):
    """Set an API key"""
    provider_to_env = {
        'openai': 'OPENAI_API_KEY',
        'anthropic': 'ANTHROPIC_API_KEY',
        'gemini': 'GEMINI_API_KEY',
        'youtube': 'YOUTUBE_API_KEY'
    }
    
    if request.provider not in provider_to_env:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown provider: {request.provider}"
        )
    
    env_key = provider_to_env[request.provider]
    env_vars = read_env_file()
    env_vars[env_key] = request.api_key
    write_env_file(env_vars)
    
    # Also update environment variable for immediate use
    os.environ[env_key] = request.api_key
    
    return {"status": "success", "message": f"{request.provider} API key updated"}


@router.post("/provider/set")
async def set_provider(request: SetProviderRequest):
    """Set the LLM provider"""
    valid_providers = ['openai', 'anthropic', 'anthropic-sonnet45', 'gemini', 'gemini-flash']
    
    if request.provider not in valid_providers:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown provider: {request.provider}. Valid: {valid_providers}"
        )
    
    env_vars = read_env_file()
    env_vars['LLM_PROVIDER'] = request.provider
    write_env_file(env_vars)
    
    # Also update environment variable for immediate use
    os.environ['LLM_PROVIDER'] = request.provider
    
    return {"status": "success", "message": f"Provider set to {request.provider}"}

