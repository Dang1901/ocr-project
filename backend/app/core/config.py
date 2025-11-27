from dotenv import load_dotenv
import os

load_dotenv()


class Settings:
    """Application settings."""

    # Application
    APP_NAME: str = os.getenv("APP_NAME", "OCR Project")
    APP_DOMAIN: str = os.getenv("APP_DOMAIN", "http://localhost:3000")
    APP_LOGO_URL: str = os.getenv(
        "APP_LOGO_URL",
        f"{os.getenv('APP_DOMAIN', 'http://localhost:3000')}/assets/logo.png",
    )
    DEBUG: bool = False

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8080

    # Authorization toggle
    DISABLE_AUTHORIZATION: bool = False

    # JWT Settings
    JWT_SECRET_KEY: str = os.getenv(
        "JWT_SECRET_KEY", "your-secret-key-change-in-production"
    )
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Database
    DB_HOST: str = os.getenv("DB_HOST")
    DB_PORT: str = os.getenv("DB_PORT" , "6789")  
    DB_NAME: str = os.getenv("DB_NAME")
    DB_USER: str = os.getenv("DB_USER")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD")

    # CORS
    CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # External API config
    LOOKUP_USER_URL: str = os.getenv("LOOKUP_USER_URL", "")
    LOOKUP_USER_TOKEN: str = os.getenv("LOOKUP_USER_TOKEN", "")

    # Email config (for password reset OTP)
    MAIL_USERNAME: str = os.getenv("MAIL_USERNAME", "")
    MAIL_PASSWORD: str = os.getenv("MAIL_PASSWORD", "")
    MAIL_FROM: str = os.getenv(
        "MAIL_FROM", os.getenv("MAIL_USERNAME", "noreply@example.com")
    )
    MAIL_PORT: int = int(os.getenv("MAIL_PORT", "587"))
    MAIL_SERVER: str = os.getenv("MAIL_SERVER", "smtp.gmail.com")
    MAIL_STARTTLS: bool = os.getenv("MAIL_STARTTLS", "true").lower() == "true"
    MAIL_SSL_TLS: bool = os.getenv("MAIL_SSL_TLS", "false").lower() == "true"

    # File Upload
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "uploads")
    MAX_FILE_SIZE: int = int(os.getenv("MAX_FILE_SIZE", "10485760"))  # 10MB default
    
    # OCR Worker threads
    OCR_WORKER_THREADS: int = int(os.getenv("OCR_WORKER_THREADS", "4"))

    # MinIO Configuration
    MINIO_ENDPOINT: str = os.getenv("MINIO_ENDPOINT", "minio.example.com")
    MINIO_ACCESS_KEY: str = os.getenv("MINIO_ACCESS_KEY", "YOUR_MINIO_KEY")
    MINIO_SECRET_KEY: str = os.getenv("MINIO_SECRET_KEY", "YOUR_MINIO_SECRET")
    MINIO_BUCKET: str = os.getenv("MINIO_BUCKET", "my-bucket")

    # FPT API Configuration
    API_KEY: str = os.getenv("API_KEY", "sk-gojYePiQueqAHdllper3UA")
    VLM_MODEL: str = os.getenv("VLM_MODEL", "FPT.AI-KIE-v1.7")
    LLM_MODEL: str = os.getenv("LLM_MODEL", "gpt-oss-120b")

    # VLM and LLM API URLs (separate from API_URL)
    VLM_API_URL: str = os.getenv("VLM_API_URL", "https://mkp-api.fptcloud.com/v1/chat/completions")
    LLM_API_URL: str = os.getenv("LLM_API_URL", "https://mkp-api.fptcloud.com/v1/chat/completions")

    class Config:
        env_file = ".env"


# Create settings instance
settings = Settings()
