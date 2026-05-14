from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ApiStatus(BaseModel):
    status: str
    phase: str
    message: str
    ai_llm_provider: str
    ai_recommender_mode: str
    mock_fallback_enabled: bool


class TimeSlotRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    label: str
    start_hour: int
    end_hour: int
    capacity: int
    is_active: bool
    current_occupancy: int


class WorkoutCategoryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    slug: str
    description: str | None
    is_active: bool


class VideoSessionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    time_slot_id: int
    workout_category_id: int
    title: str | None
    youtube_video_id: str | None
    youtube_url: str | None
    duration_seconds: int | None
    provider: str
    status: str
    safety_notes: str | None
    agent_summary: str | None


class VideoRecommendationRequest(BaseModel):
    time_slot_id: int = Field(gt=0)
    workout_category_id: int = Field(gt=0)


class ReservationCreate(BaseModel):
    time_slot_id: int = Field(gt=0)
    workout_category_id: int = Field(gt=0)


class ReservationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    time_slot_id: int
    workout_category_id: int
    created_at: datetime


class OccupancyRead(BaseModel):
    time_slot_id: int
    label: str
    start_hour: int
    end_hour: int
    capacity: int
    current_occupancy: int
    remaining_capacity: int
    is_full: bool
