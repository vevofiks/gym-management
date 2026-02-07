import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):

    # Project Info
    PROJECT_NAME: str = "GYM MANAGEMENT SAAS"
    PROJECT_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Database Configuration
    DATABASE_URL: str
    DATABASE_NAME: str
    DATABASE_USER: str
    DATABASE_PASSWORD: str

    # JWT Configuration
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int

    # WhatsApp Configuration (WPPConnect Server)
    WPPCONNECT_BASE_URL: str = "http://localhost:21465"
    WPPCONNECT_SECRET_KEY: str = ""  # Optional, for API authentication
    WHATSAPP_ENABLED: bool = True

    # CORS Configuration
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost",
        "http://localhost:5173",
        "http://localhost:3000",
    ]

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", case_sensitive=True, extra="ignore"
    )


settings = Settings()
