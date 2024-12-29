from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    mongodb_url: str = "mongodb+srv://sernan100:m5Ax0YYx4FvocvfA@customersupportrag.ktyg5.mongodb.net/?retryWrites=true&w=majority&appName=customerSupportRag"
    mongodb_database: str = "customerSupportRag"
    debug: bool = False
    pinecone_api_key: str
    pinecone_assistant_name: str
    openai_api_key: str
    xi_api_key: str
    next_public_elevenlabs_agent_id: str

    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()

@lru_cache()
def get_settings() -> Settings:
    return settings
