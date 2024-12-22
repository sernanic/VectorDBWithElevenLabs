from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    mongodb_url: str = "mongodb+srv://sernan100:m5Ax0YYx4FvocvfA@customersupportrag.ktyg5.mongodb.net/?retryWrites=true&w=majority&appName=customerSupportRag"
    database_name: str = "docsHub"
    mongodb_database: str = "customerSupportRag"
    astra_db_api_endpoint: str
    astra_db_application_token: str
    collection_name: str
    flow_id: str
    base_api_url: str
    langflow_id: str
    application_token: str
    endpoint: str

    class Config:
        env_file = ".env"
        case_sensitive = True

@lru_cache()
def get_settings() -> Settings:
    return Settings()
