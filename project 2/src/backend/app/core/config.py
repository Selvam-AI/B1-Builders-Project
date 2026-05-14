from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_env: str = Field(default="development", alias="APP_ENV")
    database_url: str = Field(default="sqlite:///./data/fithub_ai.db", alias="DATABASE_URL")
    openai_api_key: str = Field(default="", alias="OPENAI_API_KEY")
    youtube_api_key: str = Field(default="", alias="YOUTUBE_API_KEY")
    ai_llm_provider: str = Field(default="ollama", alias="AI_LLM_PROVIDER")
    ai_recommender_mode: str = Field(default="llm", alias="AI_RECOMMENDER_MODE")
    ai_allow_mock_fallback: bool = Field(default=True, alias="AI_ALLOW_MOCK_FALLBACK")
    model: str = Field(default="ollama/llama3", alias="MODEL")
    base_url: str = Field(default="http://localhost:11434", alias="BASE_URL")
    secret_key: str = Field(default="replace-with-local-dev-secret", alias="SECRET_KEY")
    jwt_algorithm: str = Field(default="HS256", alias="JWT_ALGORITHM")
    access_token_expire_minutes: int = Field(default=60, alias="ACCESS_TOKEN_EXPIRE_MINUTES")
    seed_admin: bool = Field(default=True, alias="SEED_ADMIN")
    admin_email: str = Field(default="admin@example.com", alias="ADMIN_EMAIL")
    admin_password: str = Field(default="admin123", alias="ADMIN_PASSWORD")


settings = Settings()
