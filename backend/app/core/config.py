from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "TradeLedgerX"
    API_V1_STR: str = "/api/v1"
    
    # MongoDB
    MONGODB_URL: str = "mongodb+srv://alanpentw_mongodb_user:3McpCA3znBzbwXCp@productioncluster.ezmhbsd.mongodb.net/"
    MONGODB_DB_NAME: str = "tradeledgerx"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    
    # Security
    SECRET_KEY: str = "F37DD39B-FE56-4E00-B5B8-56DBAF7BDA80"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    # dev: cookie secure=False (allow http); production: cookie secure=True (HTTPS only)
    ENVIRONMENT: str = "dev"
    
    # CORS (when using cookies/credentials, origins cannot be "*"; use explicit list)
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:8081",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8081",
    ]

    # Logging (configurable: INFO in production, DEBUG in dev; no sensitive data at INFO)
    LOG_LEVEL: str = "INFO"
    # Optional log file path; empty = stdout only (Story 1-2 did not require file)
    LOG_FILE: str = ""

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

settings = Settings()
