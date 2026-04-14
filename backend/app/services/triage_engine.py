from app.schemas.triage import TriageLevel

_ORDER: list[TriageLevel] = ["low", "medium", "high", "emergency"]


def triage_rank(level: TriageLevel) -> int:
    return _ORDER.index(level)


def max_triage(a: TriageLevel, b: TriageLevel) -> TriageLevel:
    return a if triage_rank(a) >= triage_rank(b) else b


def apply_rule_overrides(symptoms_text: str) -> TriageLevel:
    """
    Rule-based floor before LLM. Does not diagnose; enforces safety floors only.
    """
    t = symptoms_text.lower()

    if any(
        phrase in t
        for phrase in (
            "faint",
            "fainting",
            "passed out",
            "loss of consciousness",
            "unconscious",
        )
    ):
        return "emergency"

    if any(
        phrase in t
        for phrase in (
            "severe bleeding",
            "heavy bleeding",
            "hemorrhage",
            "coughing blood",
            "vomiting blood",
            "blood everywhere",
        )
    ):
        return "emergency"

    if any(
        phrase in t
        for phrase in (
            "chest pain",
            "pressure in chest",
            "crushing chest",
        )
    ):
        return "high"

    if any(
        phrase in t
        for phrase in (
            "can't breathe",
            "cannot breathe",
            "difficulty breathing",
            "shortness of breath",
            "trouble breathing",
            "gasping",
            "choking",
        )
    ):
        return "high"

    return "low"
