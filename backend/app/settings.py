from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_env: str = "production"
    database_url: str = "sqlite:///./budgetnew.db"

    jwt_secret: str = "budgetnew-change-in-production-2026"
    jwt_issuer: str = "budgetnew"
    cors_origins: str = "https://budgetnew.vercel.app,http://localhost:5173"


settings = Settings()
