from dataclasses import dataclass

from fastapi import HTTPException, status
from litellm import completion
from sqlalchemy import select
from sqlalchemy.orm import Session

from src.backend.app.core.config import settings
from src.backend.app.models import TimeSlot, VideoSession, WorkoutCategory


@dataclass(frozen=True)
class RecommendationCandidate:
    title: str
    youtube_video_id: str
    youtube_url: str
    duration_seconds: int
    provider: str
    safety_notes: str
    agent_summary: str


MOCK_CANDIDATES = {
    "upper-body": RecommendationCandidate(
        title="10 Minute Beginner Upper Body Workout",
        youtube_video_id="mock-upper-body-10",
        youtube_url="https://www.youtube.com/watch?v=mock-upper-body-10",
        duration_seconds=600,
        provider="mock",
        safety_notes="Low-impact upper-body routine suitable for a general prototype audience.",
        agent_summary=(
            "Trainer Agent selected an upper-body beginner workout. "
            "Safety Checker approved it because the routine is short, simple, and not high intensity."
        ),
    ),
    "lower-body": RecommendationCandidate(
        title="10 Minute Beginner Lower Body Workout",
        youtube_video_id="mock-lower-body-10",
        youtube_url="https://www.youtube.com/watch?v=mock-lower-body-10",
        duration_seconds=600,
        provider="mock",
        safety_notes="Low-impact lower-body routine suitable for a general prototype audience.",
        agent_summary=(
            "Trainer Agent selected a lower-body beginner workout. "
            "Safety Checker approved it because the routine is short, simple, and not high intensity."
        ),
    ),
}


def get_or_create_video_recommendation(
    db: Session,
    time_slot_id: int,
    workout_category_id: int,
) -> VideoSession:
    time_slot = db.get(TimeSlot, time_slot_id)
    if time_slot is None or not time_slot.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Time slot is not available.",
        )

    category = db.get(WorkoutCategory, workout_category_id)
    if category is None or not category.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workout category is not available.",
        )

    existing = db.scalar(
        select(VideoSession).where(
            VideoSession.time_slot_id == time_slot.id,
            VideoSession.workout_category_id == category.id,
        )
    )
    if existing is not None:
        return existing

    candidate = select_recommendation_candidate(category)
    session = VideoSession(
        time_slot_id=time_slot.id,
        workout_category_id=category.id,
        title=candidate.title,
        youtube_video_id=candidate.youtube_video_id,
        youtube_url=candidate.youtube_url,
        duration_seconds=candidate.duration_seconds,
        provider=candidate.provider,
        status="approved",
        safety_notes=candidate.safety_notes,
        agent_summary=candidate.agent_summary,
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


def select_recommendation_candidate(category: WorkoutCategory) -> RecommendationCandidate:
    candidate = mock_recommendation(category)
    if should_use_mock_recommendation():
        return candidate

    reviewed_candidate = llm_review_candidate(category, candidate)
    if reviewed_candidate is not None:
        return reviewed_candidate

    if settings.ai_allow_mock_fallback:
        return candidate

    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail="AI recommendation provider is not available and mock fallback is disabled.",
    )


def should_use_mock_recommendation() -> bool:
    if settings.ai_recommender_mode.lower() == "mock":
        return True
    if not settings.youtube_api_key:
        return settings.ai_allow_mock_fallback
    return False


def llm_review_candidate(
    category: WorkoutCategory,
    candidate: RecommendationCandidate,
) -> RecommendationCandidate | None:
    try:
        response = completion(
            model=settings.model,
            api_base=settings.base_url if settings.ai_llm_provider == "ollama" else None,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a concise fitness safety reviewer. "
                        "Approve only beginner-friendly 10 minute workouts."
                    ),
                },
                {
                    "role": "user",
                    "content": (
                        f"Review this {category.name} workout candidate for a general audience: "
                        f"{candidate.title}. Return one short approval sentence."
                    ),
                },
            ],
            timeout=8,
        )
    except Exception:
        return None

    message = response.choices[0].message.content if response.choices else ""
    summary = str(message or candidate.agent_summary).strip()
    return RecommendationCandidate(
        title=candidate.title,
        youtube_video_id=candidate.youtube_video_id,
        youtube_url=candidate.youtube_url,
        duration_seconds=candidate.duration_seconds,
        provider=settings.ai_llm_provider,
        safety_notes=candidate.safety_notes,
        agent_summary=summary[:500],
    )


def mock_recommendation(category: WorkoutCategory) -> RecommendationCandidate:
    if category.slug in MOCK_CANDIDATES:
        return MOCK_CANDIDATES[category.slug]

    return RecommendationCandidate(
        title=f"10 Minute Beginner {category.name} Workout",
        youtube_video_id=f"mock-{category.slug}-10",
        youtube_url=f"https://www.youtube.com/watch?v=mock-{category.slug}-10",
        duration_seconds=600,
        provider="mock",
        safety_notes="Beginner-friendly routine selected by the mock fallback.",
        agent_summary=(
            f"Trainer Agent selected a {category.name} workout through mock fallback. "
            "Safety Checker approved it for prototype use."
        ),
    )
