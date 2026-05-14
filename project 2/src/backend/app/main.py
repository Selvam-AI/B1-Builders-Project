from contextlib import asynccontextmanager
from collections.abc import AsyncIterator

from fastapi import FastAPI

from src.backend.app.api.routes import router
from src.backend.app.core.database import SessionLocal, init_db
from src.backend.app.services.seed import seed_database


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    init_db()
    with SessionLocal() as db:
        seed_database(db)
    yield

app = FastAPI(
    title="FitHub AI API",
    description="Backend API for the AI-assisted social workout club portal.",
    version="0.1.0",
    lifespan=lifespan,
)

app.include_router(router, prefix="/api")


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok", "service": "fithub-ai-api"}
