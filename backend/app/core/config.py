import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "Scan & Stay"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "scan_and_stay_super_secret_jwt_key_2026_x89f72b_secure")
    QR_SECRET_KEY: str = os.getenv("QR_SECRET_KEY", "scan_and_stay_qr_hmac_signing_key_99217834_secure")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days for demo ease
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./scan_and_stay.db")
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "*"
    ]

settings = Settings()
