from fastapi import APIRouter

router = APIRouter()


@router.get("/status")
def api_status() -> dict[str, str]:
    return {
        "status": "planned",
        "message": "FitHub AI API scaffold is ready for implementation.",
    }

