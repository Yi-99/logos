from fastapi import Depends, HTTPException

from models.models import PromptRequest
from database import get_dao_factory
from dao import DAOFactory


def rate_limit_prompt(
    request: PromptRequest,
    dao: DAOFactory = Depends(get_dao_factory),
) -> PromptRequest:
    """FastAPI dependency that enforces per-user rate limiting on the prompt endpoint."""
    allowed = dao.rate_limit_logs.check_rate_limit(user_id=request.user_id)
    if not allowed:
        raise HTTPException(
            status_code=429,
            detail="Rate limit exceeded. Maximum 5 requests per minute. Please wait and try again.",
        )
    return request
