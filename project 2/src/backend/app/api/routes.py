from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from src.backend.app.core.config import settings
from src.backend.app.core.database import get_db
from src.backend.app.core.security import get_current_user, require_admin, require_member
from src.backend.app.models import SlotSignup, TimeSlot, User, VideoSession, WorkoutCategory
from src.backend.app.schemas import (
    ApiStatus,
    LoginRequest,
    MemberRegister,
    OccupancyRead,
    ReservationCreate,
    ReservationRead,
    TimeSlotRead,
    TokenResponse,
    UserRead,
    VideoRecommendationRequest,
    VideoSessionRead,
    WorkoutCategoryRead,
)
from src.backend.app.services.auth import authenticate_user, create_member, issue_token, serialize_user
from src.backend.app.services.recommendations import get_or_create_video_recommendation
from src.backend.app.services.scheduling import (
    cancel_reservation,
    create_reservation,
    list_member_reservations,
    list_slot_occupancy,
)

router = APIRouter()


@router.get("/status", response_model=ApiStatus)
async def api_status() -> ApiStatus:
    return ApiStatus(
        status="ok",
        phase="phase-5-ai-video-recommendations",
        message="FitHub AI backend recommendation workflow is ready.",
        ai_llm_provider=settings.ai_llm_provider,
        ai_recommender_mode=settings.ai_recommender_mode,
        mock_fallback_enabled=settings.ai_allow_mock_fallback,
    )


@router.post("/auth/register", response_model=TokenResponse, status_code=201)
async def register_member(
    payload: MemberRegister,
    db: Session = Depends(get_db),
) -> TokenResponse:
    user = create_member(db, payload)
    return issue_token(user)


@router.post("/auth/login", response_model=TokenResponse)
async def login(
    payload: LoginRequest,
    db: Session = Depends(get_db),
) -> TokenResponse:
    user = authenticate_user(db, payload.email, payload.password)
    return issue_token(user)


@router.get("/auth/me", response_model=UserRead)
async def read_current_user(current_user: User = Depends(get_current_user)) -> UserRead:
    return serialize_user(current_user)


@router.get("/admin/summary")
async def admin_summary(
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
) -> dict[str, int | str]:
    return {
        "admin": current_admin.email or current_admin.name,
        "members": db.scalar(select(func.count(User.id)).where(User.role == "member")) or 0,
        "time_slots": db.scalar(select(func.count(TimeSlot.id))) or 0,
        "video_sessions": db.scalar(select(func.count(VideoSession.id))) or 0,
    }


@router.get("/admin/occupancy", response_model=list[OccupancyRead])
async def admin_occupancy(
    db: Session = Depends(get_db),
    _current_admin: User = Depends(require_admin),
) -> list[OccupancyRead]:
    return list_slot_occupancy(db)


@router.post("/reservations", response_model=ReservationRead, status_code=201)
async def reserve_slot(
    payload: ReservationCreate,
    db: Session = Depends(get_db),
    current_member: User = Depends(require_member),
) -> SlotSignup:
    reservation = create_reservation(db, current_member, payload)
    get_or_create_video_recommendation(db, payload.time_slot_id, payload.workout_category_id)
    return reservation


@router.get("/reservations/me", response_model=list[ReservationRead])
async def my_reservations(
    db: Session = Depends(get_db),
    current_member: User = Depends(require_member),
) -> list[SlotSignup]:
    return list_member_reservations(db, current_member)


@router.delete("/reservations/{reservation_id}", status_code=204)
async def delete_reservation(
    reservation_id: int,
    db: Session = Depends(get_db),
    current_member: User = Depends(require_member),
) -> None:
    cancel_reservation(db, current_member, reservation_id)


@router.post("/video-sessions/recommend", response_model=VideoSessionRead)
async def recommend_video_session(
    payload: VideoRecommendationRequest,
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_user),
) -> VideoSession:
    return get_or_create_video_recommendation(
        db,
        payload.time_slot_id,
        payload.workout_category_id,
    )


@router.get("/time-slots", response_model=list[TimeSlotRead])
async def list_time_slots(
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_user),
) -> list[TimeSlotRead]:
    occupancy_counts = dict(
        db.execute(
            select(SlotSignup.time_slot_id, func.count(SlotSignup.id)).group_by(
                SlotSignup.time_slot_id
            )
        ).all()
    )
    slots = db.scalars(select(TimeSlot).order_by(TimeSlot.start_hour)).all()
    return [
        TimeSlotRead(
            id=slot.id,
            label=slot.label,
            start_hour=slot.start_hour,
            end_hour=slot.end_hour,
            capacity=slot.capacity,
            is_active=slot.is_active,
            current_occupancy=occupancy_counts.get(slot.id, 0),
        )
        for slot in slots
    ]


@router.get("/workout-categories", response_model=list[WorkoutCategoryRead])
async def list_workout_categories(
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_user),
) -> list[WorkoutCategory]:
    return list(
        db.scalars(
            select(WorkoutCategory)
            .where(WorkoutCategory.is_active.is_(True))
            .order_by(WorkoutCategory.id)
        ).all()
    )


@router.get("/video-sessions", response_model=list[VideoSessionRead])
async def list_video_sessions(
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_user),
) -> list[VideoSession]:
    return list(db.scalars(select(VideoSession).order_by(VideoSession.id)).all())
