from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_env: str = "dev"
    database_url: str

    jwt_secret: str
    jwt_issuer: str = "budget1"
    cors_origins: str = "http://localhost:5173"


settings = Settings()

