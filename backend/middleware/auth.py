import os
import logging
import urllib.request
import json

from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from jose import jwt, JWTError, jwk

logger = logging.getLogger(__name__)

COGNITO_REGION = os.getenv("COGNITO_REGION", "us-west-1")
COGNITO_USER_POOL_ID = os.getenv("COGNITO_USER_POOL_ID", "")

ISSUER = f"https://cognito-idp.{COGNITO_REGION}.amazonaws.com/{COGNITO_USER_POOL_ID}"
JWKS_URL = f"{ISSUER}/.well-known/jwks.json"

# Paths that do not require authentication
PUBLIC_PATHS = {"/", "/health", "/api/v1/stats", "/api/v1/stats/"}

# Cached JWKS keys
_jwks_cache: dict | None = None


def _get_jwks() -> dict:
    """Fetch and cache the Cognito JWKS key set."""
    global _jwks_cache
    if _jwks_cache is not None:
        return _jwks_cache

    try:
        with urllib.request.urlopen(JWKS_URL) as response:
            _jwks_cache = json.loads(response.read())
        return _jwks_cache
    except Exception as e:
        logger.error(f"Failed to fetch JWKS from {JWKS_URL}: {e}")
        raise


def _get_signing_key(token: str) -> dict:
    """Find the correct signing key from JWKS for the given token."""
    jwks_data = _get_jwks()
    unverified_header = jwt.get_unverified_header(token)
    kid = unverified_header.get("kid")

    for key in jwks_data.get("keys", []):
        if key["kid"] == kid:
            return key

    raise JWTError(f"Unable to find matching key for kid: {kid}")


def verify_cognito_token(token: str) -> dict:
    """Verify a Cognito access token and return its claims."""
    signing_key = _get_signing_key(token)
    claims = jwt.decode(
        token,
        signing_key,
        algorithms=["RS256"],
        issuer=ISSUER,
        options={"verify_aud": False},  # Access tokens don't have aud claim
    )

    # Verify this is an access token
    if claims.get("token_use") != "access":
        raise JWTError("Token is not an access token")

    return claims


class AuthMiddleware(BaseHTTPMiddleware):
    """Middleware that validates Cognito JWT access tokens on every request."""

    async def dispatch(self, request: Request, call_next):
        # Let CORS preflight requests pass through without auth
        if request.method == "OPTIONS":
            return await call_next(request)

        # Skip auth for public paths
        if request.url.path in PUBLIC_PATHS:
            return await call_next(request)

        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return JSONResponse(
                status_code=401,
                content={"detail": "Missing or invalid Authorization header"},
            )

        token = auth_header.split("Bearer ", 1)[1]

        try:
            claims = verify_cognito_token(token)
            # Store the authenticated user's Cognito sub (user ID) on request state
            request.state.user_id = claims["sub"]
        except JWTError as e:
            logger.warning(f"JWT verification failed: {e}")
            return JSONResponse(
                status_code=401,
                content={"detail": "Invalid or expired token"},
            )
        except Exception as e:
            logger.error(f"Auth middleware error: {e}")
            return JSONResponse(
                status_code=401,
                content={"detail": "Authentication failed"},
            )

        return await call_next(request)
