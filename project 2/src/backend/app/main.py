from fastapi import FastAPI

from src.backend.app.api.routes import router

app = FastAPI(
    title="FitHub AI API",
    description="Backend API for the AI-assisted social workout club portal.",
    version="0.1.0",
)

app.include_router(router, prefix="/api")


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok", "service": "fithub-ai-api"}

