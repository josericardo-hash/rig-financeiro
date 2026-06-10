from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

PROJECT_ROOT = Path(__file__).resolve().parents[1]


class Settings(BaseSettings):
    database_url: str
    contaazul_client_id: str
    contaazul_client_secret: str
    contaazul_redirect_uri: str
    secret_key: str
    algorithm: str = "HS256"
    data_dir: str = "./data"
    log_dir: str = "./logs"
    api_port: int = 8055
    api_host: str = "0.0.0.0"
    environment: str = "development"

    model_config = SettingsConfigDict(
        env_file=PROJECT_ROOT / ".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
