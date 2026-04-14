from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "CareTriage AI API"
    cors_origins: str = "http://localhost:3000"

    database_url: str = "sqlite:///./data/caretriage.db"

    clerk_jwks_url: str = ""
    clerk_issuer: str = ""

    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"
    openai_timeout_seconds: float = 60.0

    free_tier_monthly_intakes: int = 20

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
