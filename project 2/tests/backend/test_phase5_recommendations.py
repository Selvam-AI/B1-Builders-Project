import asyncio
import os

os.environ["DATABASE_URL"] = "sqlite:////tmp/fithub_ai_backend_tests.db"
os.environ["AI_LLM_PROVIDER"] = "ollama"
os.environ["AI_RECOMMENDER_MODE"] = "llm"
os.environ["AI_ALLOW_MOCK_FALLBACK"] = "true"
os.environ["MODEL"] = "ollama/llama3"
os.environ["BASE_URL"] = "http://localhost:11434"
os.environ["YOUTUBE_API_KEY"] = ""
os.environ["SEED_ADMIN"] = "true"
os.environ["ADMIN_EMAIL"] = "admin@example.com"
os.environ["ADMIN_PASSWORD"] = "admin123"
os.environ["SECRET_KEY"] = "test-secret"

import httpx

from src.backend.app.core.database import Base, SessionLocal, engine
from src.backend.app.main import app
from src.backend.app.models import VideoSession
from src.backend.app.services.seed import seed_database


def reset_seeded_db() -> None:
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        seed_database(db)


async def request(method: str, path: str, **kwargs):
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        return await client.request(method, path, **kwargs)


async def register_member(email: str) -> dict[str, str]:
    response = await request(
        "POST",
        "/api/auth/register",
        json={"name": email.split("@")[0], "email": email, "password": "member123"},
    )
    assert response.status_code == 201
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def count_video_sessions() -> int:
    with SessionLocal() as db:
        return len(db.query(VideoSession).all())


def test_recommendation_endpoint_creates_mock_approved_session() -> None:
    reset_seeded_db()
    headers = asyncio.run(register_member("recommend1@example.com"))

    response = asyncio.run(
        request(
            "POST",
            "/api/video-sessions/recommend",
            headers=headers,
            json={"time_slot_id": 1, "workout_category_id": 1},
        )
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["time_slot_id"] == 1
    assert payload["workout_category_id"] == 1
    assert payload["provider"] == "mock"
    assert payload["status"] == "approved"
    assert payload["duration_seconds"] == 600


def test_recommendation_is_cached_by_slot_and_category() -> None:
    reset_seeded_db()
    headers = asyncio.run(register_member("recommend2@example.com"))
    payload = {"time_slot_id": 1, "workout_category_id": 1}

    first_response = asyncio.run(
        request("POST", "/api/video-sessions/recommend", headers=headers, json=payload)
    )
    second_response = asyncio.run(
        request("POST", "/api/video-sessions/recommend", headers=headers, json=payload)
    )

    assert first_response.status_code == 200
    assert second_response.status_code == 200
    assert first_response.json()["id"] == second_response.json()["id"]
    assert count_video_sessions() == 1


def test_reservation_creates_cached_video_session() -> None:
    reset_seeded_db()
    headers = asyncio.run(register_member("recommend3@example.com"))

    reserve_response = asyncio.run(
        request(
            "POST",
            "/api/reservations",
            headers=headers,
            json={"time_slot_id": 2, "workout_category_id": 2},
        )
    )
    video_sessions_response = asyncio.run(
        request("GET", "/api/video-sessions", headers=headers)
    )

    assert reserve_response.status_code == 201
    assert video_sessions_response.status_code == 200
    sessions = video_sessions_response.json()
    assert len(sessions) == 1
    assert sessions[0]["time_slot_id"] == 2
    assert sessions[0]["workout_category_id"] == 2
    assert sessions[0]["provider"] == "mock"


def test_guest_cannot_request_recommendation() -> None:
    reset_seeded_db()

    response = asyncio.run(
        request(
            "POST",
            "/api/video-sessions/recommend",
            json={"time_slot_id": 1, "workout_category_id": 1},
        )
    )

    assert response.status_code == 401
