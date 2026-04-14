"""Human-readable patient intake identifiers (not medical record systems of record)."""

import secrets
from datetime import datetime, timezone


def new_patient_id() -> str:
    """Unique per intake, e.g. CT-P-20260414-A1B2C3."""
    day = datetime.now(timezone.utc).strftime("%Y%m%d")
    suffix = secrets.token_hex(4).upper()
    return f"CT-P-{day}-{suffix}"


def legacy_patient_id_from_report_uuid(report_id: str) -> str:
    """Stable ID for rows created before patient_id existed."""
    clean = report_id.replace("-", "")[:12].upper()
    return f"CT-P-LEGACY-{clean}"
