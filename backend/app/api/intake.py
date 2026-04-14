import json
import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import Settings, get_settings
from app.core.security import get_current_user_id
from app.db.database import get_db
from app.db.models import ReportRecord
from app.db.patient_id import new_patient_id
from app.schemas.triage import (
    IntakeCreate,
    IntakeResponse,
    ReportDetailResponse,
    ReportListItem,
    TriageReport,
)
from app.services.ai_exceptions import ConfigurationError
from app.services.ai_service import generate_triage_report_with_fallback

logger = logging.getLogger(__name__)

router = APIRouter(tags=["intake"])


def _month_start_utc(now: datetime | None = None) -> datetime:
    n = now or datetime.now(timezone.utc)
    return datetime(n.year, n.month, 1, tzinfo=timezone.utc)


def _count_intakes_this_month(db: Session, user_id: str) -> int:
    start = _month_start_utc().replace(tzinfo=None)
    q = select(func.count()).select_from(ReportRecord).where(
        ReportRecord.user_id == user_id,
        ReportRecord.created_at >= start,
    )
    return int(db.scalar(q) or 0)


def _resolve_patient_id(rec: ReportRecord) -> str:
    if rec.patient_id:
        return rec.patient_id
    from app.db.patient_id import legacy_patient_id_from_report_uuid

    return legacy_patient_id_from_report_uuid(rec.id)


def _error_response(status_code: int, message: str, step: str, detail: str | None = None) -> JSONResponse:
    body: dict[str, str] = {"error": message, "step": step}
    if detail:
        body["detail"] = detail
    return JSONResponse(status_code=status_code, content=body)


@router.post("/intake", response_model=IntakeResponse)
def create_intake(
    body: IntakeCreate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> IntakeResponse | JSONResponse:
    logger.info("intake.request_received user_id=%s", user_id)

    try:
        used = _count_intakes_this_month(db, user_id)
        if used >= settings.free_tier_monthly_intakes:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Monthly intake limit reached for your plan. Upgrade to continue.",
            )

        logger.info(
            "intake.validation_and_quota_ok user_id=%s intakes_this_month=%s limit=%s",
            user_id,
            used,
            settings.free_tier_monthly_intakes,
        )

        try:
            report, used_fallback = generate_triage_report_with_fallback(body, settings)
        except ConfigurationError as e:
            logger.error("intake.configuration_error: %s", e.message)
            return _error_response(
                status.HTTP_500_INTERNAL_SERVER_ERROR,
                e.message,
                "configuration",
            )

        logger.info(
            "intake.ai_complete used_ai_fallback=%s triage_level=%s",
            used_fallback,
            report.triage_level,
        )

        card = (body.patient_card_number or "").strip() or None

        rec: ReportRecord | None = None
        try:
            for attempt in range(3):
                pid = new_patient_id()
                rec = ReportRecord(
                    user_id=user_id,
                    age=body.age,
                    gender=body.gender,
                    symptoms=body.symptoms,
                    duration=body.duration,
                    severity=body.severity,
                    patient_id=pid,
                    patient_card_number=card,
                    report_json=report.model_dump_json(),
                )
                db.add(rec)
                try:
                    db.commit()
                    db.refresh(rec)
                    break
                except IntegrityError:
                    db.rollback()
                    if attempt == 2:
                        logger.error(
                            "intake.patient_id_allocation_failed user_id=%s after_retries=3",
                            user_id,
                        )
                        return _error_response(
                            status.HTTP_503_SERVICE_UNAVAILABLE,
                            "Could not allocate a unique patient identifier. Please retry shortly.",
                            "database_write",
                            detail="patient_id collision after retries",
                        )

            if rec is None or not rec.patient_id:
                logger.error("intake.unexpected_null_record user_id=%s", user_id)
                return _error_response(
                    status.HTTP_500_INTERNAL_SERVER_ERROR,
                    "Unexpected error while saving the intake.",
                    "database_write",
                )

            logger.info(
                "intake.db_write_success report_id=%s patient_id=%s",
                rec.id,
                rec.patient_id,
            )

            return IntakeResponse(
                id=rec.id,
                patient_id=rec.patient_id,
                patient_card_number=rec.patient_card_number,
                report=report,
                used_ai_fallback=used_fallback,
            )
        except Exception as e:
            logger.exception("intake.database_failure user_id=%s", user_id)
            try:
                db.rollback()
            except Exception:
                logger.exception("intake.db_rollback_failed")
            return _error_response(
                status.HTTP_500_INTERNAL_SERVER_ERROR,
                "Failed to persist intake report.",
                "database_write",
                detail=str(e),
            )

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("intake.unhandled_failure user_id=%s", user_id)
        return _error_response(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "An unexpected error occurred while processing intake.",
            "internal",
            detail=str(e),
        )


@router.get("/reports", response_model=list[ReportListItem])
def list_reports(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> list[ReportListItem]:
    rows = db.scalars(
        select(ReportRecord)
        .where(ReportRecord.user_id == user_id)
        .order_by(ReportRecord.created_at.desc())
        .limit(100)
    ).all()

    items: list[ReportListItem] = []
    for r in rows:
        data = json.loads(r.report_json)
        level = data.get("triage_level", "low")
        if level not in ("low", "medium", "high", "emergency"):
            level = "low"
        preview = (r.symptoms or "")[:120] + ("…" if len(r.symptoms or "") > 120 else "")
        items.append(
            ReportListItem(
                id=r.id,
                patient_id=_resolve_patient_id(r),
                patient_card_number=r.patient_card_number,
                created_at=r.created_at.replace(tzinfo=timezone.utc).isoformat(),
                triage_level=level,
                symptoms_preview=preview,
            )
        )
    return items


@router.get("/reports/{report_id}", response_model=ReportDetailResponse)
def get_report(
    report_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> ReportDetailResponse:
    rec = db.get(ReportRecord, report_id)
    if rec is None or rec.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")

    report = TriageReport.model_validate_json(rec.report_json)
    intake = IntakeCreate(
        age=rec.age,
        gender=rec.gender,
        symptoms=rec.symptoms,
        duration=rec.duration,
        severity=rec.severity,
        patient_card_number=rec.patient_card_number,
    )
    return ReportDetailResponse(
        id=rec.id,
        patient_id=_resolve_patient_id(rec),
        created_at=rec.created_at.replace(tzinfo=timezone.utc).isoformat(),
        intake=intake,
        report=report,
    )
