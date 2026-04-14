import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.intake import router as intake_router
from app.core.config import get_settings
from app.db import models as _models  # noqa: F401 — register ORM metadata
from app.db.database import Base, engine
from app.db.migrate import ensure_reports_patient_columns

logger = logging.getLogger(__name__)

settings = get_settings()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    try:
        Base.metadata.create_all(bind=engine)
        ensure_reports_patient_columns(engine)
    except Exception:
        logger.exception(
            "Database connection failed during startup. "
            "If using Supabase: copy DATABASE_URL from Dashboard → Settings → Database (URI), "
            "confirm the project is active (not paused), and check your network/DNS — "
            "'failed to resolve host' means the hostname could not be looked up (offline, typo, or bad DNS)."
        )
        raise
    yield


app = FastAPI(title=settings.app_name, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(intake_router, prefix="/v1")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
