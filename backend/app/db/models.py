import uuid
from datetime import datetime

from sqlalchemy import DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class ReportRecord(Base):
    __tablename__ = "reports"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(128), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)

    age: Mapped[int] = mapped_column(Integer)
    gender: Mapped[str | None] = mapped_column(String(64), nullable=True)
    symptoms: Mapped[str] = mapped_column(Text)
    duration: Mapped[str] = mapped_column(String(512))
    severity: Mapped[int] = mapped_column(Integer)
    patient_id: Mapped[str | None] = mapped_column(String(40), nullable=True, unique=True, index=True)
    patient_card_number: Mapped[str | None] = mapped_column(String(128), nullable=True)
    report_json: Mapped[str] = mapped_column(Text)
