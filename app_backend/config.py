"""
app_backend/config.py
---------------------
Centralized Environment Configuration Loader.
Loads runtime settings from system environment variables or local .env file using python-dotenv.
For: Brihanmumbai Police Department — SIH 26
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Locate project root directory
BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables from .env file if present
load_dotenv(dotenv_path=BASE_DIR / ".env")

class Settings:
    PROJECT_NAME: str = "Brihanmumbai Police Tactical Intelligence REST API"
    VERSION: str = "2.0.0"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8080"))

    # Security & Cryptographic secret (Dummy placeholder fallback for dev)
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-placeholder-secret-key-change-in-production")
    
    # Audit trail database path
    AUDIT_DB_PATH: str = os.getenv("AUDIT_DB_PATH", "audit_log.db")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./audit_log.db")

    # Allowed CORS Origins
    @property
    def cors_origins(self) -> list:
        raw_origins = os.getenv("CORS_ORIGINS", "")
        if raw_origins:
            return [origin.strip() for origin in raw_origins.split(",") if origin.strip()]
        return [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:8080",
            "http://127.0.0.1:8080"
        ]

settings = Settings()
