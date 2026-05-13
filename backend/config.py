"""
RIMN Backend Configuration
Loads settings from environment variables / .env file
"""
from pydantic_settings import BaseSettings
from pydantic import Field
from functools import lru_cache
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    # App
    APP_NAME: str = "RIMN — Multimodal Educational AI"
    APP_VERSION: str = "1.0.0-mvp"
    DEBUG: bool = False
    ENVIRONMENT: str = "development"

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    WORKERS: int = 1

    # Security
    SECRET_KEY: str = Field(default="rimn-super-secret-key-change-in-production-2024")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Database
    DATABASE_URL: str = Field(default=f"sqlite+aiosqlite:///{BASE_DIR}/rimn.db")

    # ML Model Settings
    DEVICE: str = "cuda"  # "cuda" or "cpu"
    CLIP_MODEL: str = "ViT-L-14"
    CLIP_PRETRAINED: str = "openai"
    DEBERTA_MODEL: str = "microsoft/deberta-v3-base"
    WHISPER_MODEL: str = "base"
    LATENT_DIM: int = 512
    MAX_TEXT_LENGTH: int = 512
    IMAGE_SIZE: int = 224
    GEMINI_API_KEY: str = Field(default="")

    # Paths
    UPLOAD_DIR: str = str(BASE_DIR / "uploads")
    CHECKPOINT_DIR: str = str(BASE_DIR / "ml" / "checkpoints")
    RESULTS_DIR: str = str(BASE_DIR / "ml" / "results")

    # CORS
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "https://*.vercel.app",
    ]
    FRONTEND_URL: str = Field(default="http://localhost:3000")

    class Config:
        env_file = str(BASE_DIR / ".env")
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
