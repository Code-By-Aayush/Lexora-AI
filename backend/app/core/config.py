from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # App Info
    APP_NAME: str
    APP_VERSION: str
    DEBUG: bool = False
    
    # Database
    DATABASE_URL: str
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # AI Configuration
    GEMINI_API_KEY: str
    SARVAM_API_KEY: str = ""
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = []
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Global settings instance
settings = Settings()