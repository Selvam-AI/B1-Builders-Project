"""Pydantic schema package for request and response models."""

from src.backend.app.schemas.core import (
    ApiStatus,
    OccupancyRead,
    ReservationCreate,
    ReservationRead,
    TimeSlotRead,
    VideoRecommendationRequest,
    VideoSessionRead,
    WorkoutCategoryRead,
)
from src.backend.app.schemas.auth import LoginRequest, MemberRegister, TokenResponse, UserRead

__all__ = [
    "ApiStatus",
    "LoginRequest",
    "MemberRegister",
    "OccupancyRead",
    "ReservationCreate",
    "ReservationRead",
    "TimeSlotRead",
    "VideoRecommendationRequest",
    "TokenResponse",
    "UserRead",
    "VideoSessionRead",
    "WorkoutCategoryRead",
]
