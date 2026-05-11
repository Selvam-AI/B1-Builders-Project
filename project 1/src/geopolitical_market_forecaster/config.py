import os
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv
from pydantic import BaseModel


ROOT_DIR = Path(__file__).resolve().parents[2]
load_dotenv(ROOT_DIR / ".env")


class Settings(BaseModel):
    app_env: str = "local"
    gemini_api_key: str | None = None
    news_api_key: str | None = None
    database_url: str = "sqlite:///data/geopolitical_market_forecaster.db"
    default_region: str = "Middle East"
    default_news_query: str = "Middle East geopolitics oil shipping markets"


@lru_cache
def get_settings() -> Settings:
    return Settings(
        app_env=os.getenv("APP_ENV", "local"),
        gemini_api_key=os.getenv("GEMINI_API_KEY") or None,
        news_api_key=os.getenv("NEWS_API_KEY") or None,
        database_url=os.getenv(
            "DATABASE_URL",
            "sqlite:///data/geopolitical_market_forecaster.db",
        ),
        default_region=os.getenv("DEFAULT_REGION", "Middle East"),
        default_news_query=os.getenv(
            "DEFAULT_NEWS_QUERY",
            "Middle East geopolitics oil shipping markets",
        ),
    )
