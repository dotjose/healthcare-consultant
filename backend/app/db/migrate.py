"""Add columns to existing `reports` tables when the ORM schema gains new fields."""

import logging

from sqlalchemy import inspect, select, text
from sqlalchemy.engine import Engine

from app.db.models import ReportRecord
from app.db.patient_id import legacy_patient_id_from_report_uuid

logger = logging.getLogger(__name__)


def ensure_reports_patient_columns(engine: Engine) -> None:
    insp = inspect(engine)
    if "reports" not in insp.get_table_names():
        return

    cols = {c["name"] for c in insp.get_columns("reports")}

    alters: list[str] = []
    if "patient_id" not in cols:
        alters.append("ALTER TABLE reports ADD COLUMN patient_id VARCHAR(40)")
    if "patient_card_number" not in cols:
        alters.append("ALTER TABLE reports ADD COLUMN patient_card_number VARCHAR(128)")

    if not alters:
        return

    with engine.begin() as conn:
        for stmt in alters:
            conn.execute(text(stmt))

    from app.db.database import SessionLocal

    db = SessionLocal()
    try:
        rows = db.scalars(select(ReportRecord).where(ReportRecord.patient_id.is_(None))).all()
        for r in rows:
            r.patient_id = legacy_patient_id_from_report_uuid(r.id)
        if rows:
            db.commit()
            logger.info("Backfilled patient_id for %s legacy report(s)", len(rows))
    finally:
        db.close()
