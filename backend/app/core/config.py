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
    MONGODB_URL: str = "mongodb+srv://sernan100:m5Ax0YYx4FvocvfA@customersupportrag.ktyg5.mongodb.net/?retryWrites=true&w=majority&appName=customerSupportRag"
    MONGODB_DATABASE: str = "customerSupportRag"
    
    # OpenAI Settings
    OPENAI_API_KEY: str = "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"
    
    # Environment Settings
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    
    # Added missing variables
    ASTRA_DB_API_ENDPOINT: str
    ASTRA_DB_APPLICATION_TOKEN: str
    COLLECTION_NAME: str
    FLOW_ID: str
    BASE_API_URL: str
    LANGFLOW_ID: str
    APPLICATION_TOKEN: str
    ENDPOINT: str

    class Config:
        env_file = ".env"
        case_sensitive = True

@lru_cache()
def get_settings() -> Settings:
    return Settings()
