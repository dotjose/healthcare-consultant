import os
import re
from collections.abc import Generator
from urllib.parse import parse_qsl, urlencode, urlparse, urlunparse

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import get_settings


class Base(DeclarativeBase):
    pass


def normalize_database_url(url: str) -> str:
    """
    SQLAlchemy's default postgres:// URL selects the psycopg2 driver, which we do not ship.
    Normalize to psycopg (v3): postgresql+psycopg://...
    If the URL already specifies a driver (postgresql+something), leave it unchanged.
    """
    u = url.strip()
    if not u:
        return u
    if re.match(r"^postgres(ql)?\+", u):
        return u
    if u.startswith("postgres://"):
        return "postgresql+psycopg://" + u.removeprefix("postgres://")
    if u.startswith("postgresql://"):
        return "postgresql+psycopg://" + u.removeprefix("postgresql://")
    return u


def ensure_supabase_connection_params(url: str) -> str:
    """
    Supabase Postgres expects TLS. Ensure sslmode=require on the URL when the host is Supabase.

    Copy the URI from Supabase Dashboard → Project Settings → Database (URI tab).
    Direct: db.<project-ref>.supabase.co — Pooler: *.pooler.supabase.com (ports 5432/6543 per mode).
    """
    u = url.strip()
    if not u or u.startswith("sqlite"):
        return u
    if not any(
        u.startswith(prefix)
        for prefix in ("postgresql://", "postgres://", "postgresql+", "postgres+")
    ):
        return u
    try:
        parsed = urlparse(u)
    except Exception:
        return u
    host = (parsed.hostname or "").lower()
    if "supabase" not in host:
        return u
    q = dict(parse_qsl(parsed.query, keep_blank_values=True))
    if "sslmode" not in q:
        q["sslmode"] = "require"
    if "connect_timeout" not in q:
        q["connect_timeout"] = "15"
    return urlunparse(parsed._replace(query=urlencode(list(q.items()))))


def _ensure_sqlite_dir(url: str) -> None:
    if url.startswith("sqlite:///./"):
        path = url.replace("sqlite:///./", "", 1)
        parent = os.path.dirname(path)
        if parent:
            os.makedirs(parent, exist_ok=True)


_settings = get_settings()
DATABASE_URL = ensure_supabase_connection_params(normalize_database_url(_settings.database_url))

if DATABASE_URL.startswith("sqlite"):
    _ensure_sqlite_dir(DATABASE_URL)

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {},
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
