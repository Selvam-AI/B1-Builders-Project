from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
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

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
