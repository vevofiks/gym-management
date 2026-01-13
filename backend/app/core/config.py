import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME : str = "GYM MANAGEMENT SAAS"
    PROJECT_VERSION : str = "1.0.0"
    
    DATABASE_URL : str | None = os.getenv("DATABASE_URL")
    
    SECRET_KEY: str | None = os.getenv("SECRET_KEY")
    ALGORITHM: str | None = os.getenv("ALGORITHM")
    ACCESS_TOKEN_EXPIRE_MINUTES: int | None = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))
    
    
settings = Settings()