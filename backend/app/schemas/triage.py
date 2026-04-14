from typing import Literal

from pydantic import BaseModel, Field


TriageLevel = Literal["low", "medium", "high", "emergency"]


class IntakeCreate(BaseModel):
    age: int = Field(ge=0, le=130)
    gender: str | None = Field(default=None, max_length=64)
    symptoms: str = Field(min_length=1, max_length=8000)
    duration: str = Field(min_length=1, max_length=512)
    severity: int = Field(ge=1, le=10)
    patient_card_number: str | None = Field(
        default=None,
        max_length=128,
        description="Optional clinic card / MRN-style reference (not a national ID).",
    )


class TriageReport(BaseModel):
    symptoms_summary: str
    possible_categories: list[str]
    triage_level: TriageLevel
    red_flags: list[str]
    recommended_next_step: str
    questions_to_ask_doctor: list[str]
    patient_note: str


class IntakeResponse(BaseModel):
    id: str
    patient_id: str
    patient_card_number: str | None
    report: TriageReport
    used_ai_fallback: bool = False


class ReportListItem(BaseModel):
    id: str
    patient_id: str
    patient_card_number: str | None
    created_at: str
    triage_level: TriageLevel
    symptoms_preview: str


class ReportDetailResponse(BaseModel):
    id: str
    patient_id: str
    created_at: str
    intake: IntakeCreate
    report: TriageReport
