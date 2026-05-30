from pydantic_settings import BaseSettings
from pathlib import Path


class Settings(BaseSettings):
    database_url: str = "sqlite:///./medvoice.db"
    upload_dir: Path = Path("./uploads")
    whisper_model_size: str = "medium"
    whisper_compute_type: str = "int8"
    anthropic_api_key: str = ""
    fuzzy_match_threshold: int = 85
    max_audio_size_mb: int = 50

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
settings.upload_dir.mkdir(exist_ok=True)
