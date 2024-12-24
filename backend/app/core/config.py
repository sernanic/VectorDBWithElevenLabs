from pydantic_settings import BaseSettings
from functools import lru_cache
import os
from typing import List

class Settings(BaseSettings):
    # API Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Documentation Hub API"
    
    # CORS Settings
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8080",
        "http://127.0.0.1:8080"
    ]
    
    # MongoDB Settings
    MONGODB_URL: str
    MONGODB_DATABASE: str
    
    # OpenAI Settings
    OPENAI_API_KEY: str
    
    # Pinecone Settings
    PINECONE_API_KEY: str
    PINECONE_ASSISTANT_NAME: str
    
    # Environment Settings
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"

    class Config:
        env_file = ".env"
        case_sensitive = True

@lru_cache()
def get_settings() -> Settings:
    return Settings()
