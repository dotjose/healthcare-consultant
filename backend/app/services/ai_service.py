from __future__ import annotations

import json
import logging
from typing import Any

from openai import APIConnectionError, APITimeoutError, OpenAI, RateLimitError
from openai import APIError as OpenAIAPIError
from pydantic import ValidationError

from app.core.config import Settings
from app.schemas.triage import IntakeCreate, TriageReport
from app.services.ai_exceptions import ConfigurationError

logger = logging.getLogger(__name__)


def ensure_openai_configured(settings: Settings) -> None:
    """Fail fast with a clear configuration error when the API key is missing."""
    if not (settings.openai_api_key or "").strip():
        raise ConfigurationError("OPENAI_API_KEY is not set or is empty.")


def _build_fallback_report(intake: IntakeCreate, reason: str) -> TriageReport:
    """Conservative rule-based report when the model is unavailable or output is invalid."""
    return TriageReport(
        symptoms_summary=(
            "Automated triage could not be completed by the AI service. "
            "A conservative assessment was applied. "
            f"Technical note: {reason}. "
            "This is not a substitute for professional medical evaluation."
        ),
        possible_categories=["Insufficient automated classification — clinical review recommended"],
        triage_level="medium",
        red_flags=[],
        recommended_next_step=(
            "Seek in-person or telehealth evaluation if symptoms worsen or new symptoms appear. "
            "For emergency signs (chest pain, difficulty breathing, stroke symptoms), call emergency services."
        ),
        questions_to_ask_doctor=[
            "When did symptoms start, and how have they changed?",
            "Do you have chronic conditions or take medications that might explain these symptoms?",
        ],
        patient_note=(
            "This report was generated without live AI analysis due to a service limitation. "
            "It does not constitute medical advice."
        ),
    )


def _extract_message_text(response: Any) -> str:
    choice = response.choices[0]
    content = choice.message.content
    if content is None:
        return ""
    return content.strip()


def _parse_json_object(raw: str) -> dict[str, Any]:
    """Ensure we have a JSON object before Pydantic validation."""
    text = raw.strip()
    if not text:
        raise ValueError("Empty model response")
    try:
        parsed = json.loads(text)
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON: {e}") from e
    if not isinstance(parsed, dict):
        raise ValueError("JSON root must be an object")
    return parsed


def _validate_triage_report(data: dict[str, Any]) -> TriageReport:
    try:
        return TriageReport.model_validate(data)
    except ValidationError as e:
        logger.warning(
            "ai.triage_validation_failed errors=%s payload_keys=%s",
            e.errors(),
            list(data.keys()),
        )
        raise ValueError(f"Pydantic validation failed: {e}") from e


def _call_openai_once(
    client: OpenAI,
    model: str,
    system_prompt: str,
    user_prompt: str,
) -> str:
    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        response_format={"type": "json_object"},
    )
    return _extract_message_text(response)


def generate_triage_report_with_fallback(
    intake: IntakeCreate,
    settings: Settings,
) -> tuple[TriageReport, bool]:
    """
    Returns (report, used_ai_fallback).

    - Validates OPENAI_API_KEY before calling OpenAI.
    - Uses client timeout; catches API/timeout/connection errors.
    - Validates JSON then Pydantic; retries once with a repair hint on first failure.
    - On any irrecoverable AI failure, returns a conservative fallback report (used_ai_fallback=True).
    """
    ensure_openai_configured(settings)

    timeout = max(5.0, float(settings.openai_timeout_seconds))
    client = OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=settings.openai_api_key,
        timeout=timeout,
        max_retries=0,
    )

    system_prompt = (
        "You are a clinical decision support assistant for licensed clinicians. "
        "Output ONLY valid JSON (no markdown) with exactly these keys: "
        "symptoms_summary (string), possible_categories (array of strings), "
        "triage_level (one of: low, medium, high, emergency), "
        "red_flags (array of strings), recommended_next_step (string), "
        "questions_to_ask_doctor (array of strings), patient_note (string). "
        "Be conservative with triage_level when uncertain."
    )

    user_prompt = (
        "Patient symptoms / chief complaint:\n"
        f"{intake.symptoms}\n\n"
        "Structured intake:\n"
        f"{json.dumps(intake.model_dump(), ensure_ascii=False)}\n\n"
        "Apply conservative urgency if uncertain. "
        "If information is insufficient, reflect that in symptoms_summary and patient_note."
    )

    repair_suffix = (
        "\n\nYour previous answer was invalid. Reply with ONLY one JSON object with keys: "
        "symptoms_summary, possible_categories, triage_level, red_flags, "
        "recommended_next_step, questions_to_ask_doctor, patient_note. "
        "triage_level must be one of: low, medium, high, emergency."
    )

    logger.info("ai.call_started model=%s timeout_s=%s", settings.openai_model, timeout)

    last_error: str | None = None
    for attempt in (1, 2):
        try:
            text = _call_openai_once(
                client,
                settings.openai_model,
                system_prompt,
                user_prompt if attempt == 1 else user_prompt + repair_suffix,
            )
            logger.info("ai.raw_response_received attempt=%s chars=%s", attempt, len(text))
            data = _parse_json_object(text)
            report = _validate_triage_report(data)
            logger.info(
                "ai.validation_ok attempt=%s triage_level=%s",
                attempt,
                report.triage_level,
            )
            return report, False
        except (ValueError, ValidationError) as e:
            last_error = str(e)
            logger.warning("ai.parse_or_validate_failed attempt=%s error=%s", attempt, last_error)
        except APITimeoutError as e:
            last_error = f"OpenAI timeout after {timeout}s: {e}"
            logger.error("ai.openai_timeout %s", last_error)
            break
        except RateLimitError as e:
            last_error = f"OpenAI rate limited: {e}"
            logger.error("ai.openai_rate_limit %s", last_error)
            break
        except APIConnectionError as e:
            last_error = f"OpenAI connection error: {e}"
            logger.error("ai.openai_connection %s", last_error)
            break
        except OpenAIAPIError as e:
            last_error = f"OpenAI API error: {e}"
            logger.error("ai.openai_api_error %s", last_error)
            break
        except Exception as e:
            last_error = f"Unexpected OpenAI error: {e}"
            logger.exception("ai.unexpected_error")

    reason = last_error or "unknown error"
    logger.error("ai.fallback_used reason=%s", reason)
    return _build_fallback_report(intake, reason), True
