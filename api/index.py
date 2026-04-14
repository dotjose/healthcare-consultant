"""
Vercel serverless entry for the FastAPI backend (ASGI).

Kept at repo root `api/` (not `app/api/`) so Next.js App Router does not treat it as a Route Handler segment.

The backend package lives in `backend/`; we add it to sys.path so `app.main:app` resolves.
"""

from __future__ import annotations

import sys
from pathlib import Path

_ROOT = Path(__file__).resolve().parent.parent
_BACKEND = _ROOT / "backend"
if str(_BACKEND) not in sys.path:
    sys.path.insert(0, str(_BACKEND))

from app.main import app  # noqa: E402
