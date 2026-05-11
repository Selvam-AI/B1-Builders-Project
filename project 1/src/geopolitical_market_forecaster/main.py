from fastapi import FastAPI

from geopolitical_market_forecaster.config import get_settings
from geopolitical_market_forecaster.orchestration.pipeline import ForecastPipeline

app = FastAPI(title="Geopolitical Market Forecaster")


@app.get("/health")
async def health() -> dict[str, str]:
    settings = get_settings()
    return {"status": "ok", "environment": settings.app_env}


@app.post("/pipeline/run")
async def run_pipeline() -> dict:
    settings = get_settings()
    result = await ForecastPipeline(settings).run()
    return result.model_dump(mode="json")
