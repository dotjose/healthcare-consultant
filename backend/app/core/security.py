import logging
from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import PyJWKClient

from app.core.config import Settings, get_settings

logger = logging.getLogger(__name__)

security = HTTPBearer(auto_error=False)


class ClerkJWTError(Exception):
    pass


_jwk_client: PyJWKClient | None = None


def _get_jwk_client(settings: Settings) -> PyJWKClient:
    global _jwk_client
    if not settings.clerk_jwks_url:
        raise ClerkJWTError("CLERK_JWKS_URL is not configured")
    if _jwk_client is None:
        _jwk_client = PyJWKClient(settings.clerk_jwks_url)
    return _jwk_client


def verify_clerk_jwt(token: str, settings: Settings) -> str:
    """Validate Clerk session JWT and return Clerk user id (`sub`)."""
    if not settings.clerk_issuer:
        raise ClerkJWTError("CLERK_ISSUER is not configured")

    try:
        jwks = _get_jwk_client(settings)
        signing_key = jwks.get_signing_key_from_jwt(token)
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            issuer=settings.clerk_issuer,
            options={
                "verify_aud": False,
                "require": ["exp", "iss", "sub"],
            },
        )
    except jwt.PyJWTError as e:
        logger.debug("JWT verification failed: %s", e)
        raise ClerkJWTError("Invalid token") from e

    sub = payload.get("sub")
    if not sub or not isinstance(sub, str):
        raise ClerkJWTError("Missing subject")

    return sub


async def get_current_user_id(
    creds: Annotated[HTTPAuthorizationCredentials | None, Depends(security)],
    settings: Annotated[Settings, Depends(get_settings)],
) -> str:
    if creds is None or creds.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        return verify_clerk_jwt(creds.credentials, settings)
    except ClerkJWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
        ) from e
