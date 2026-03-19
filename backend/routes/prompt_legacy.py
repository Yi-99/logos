from fastapi import APIRouter, Depends
from models.models import PromptRequest
from database import get_dao_factory
from dao import DAOFactory
from controllers.prompt_philosopher_legacy import prompt_philosopher

prompt_legacy_router = APIRouter(prefix="/v0/prompt", tags=["prompt-legacy"])


@prompt_legacy_router.post("/")
def prompt_philosopher_route(request: PromptRequest, dao: DAOFactory = Depends(get_dao_factory)):
    """
    Prompts the AI as an advisor (legacy, non-streaming response).
    """
    return prompt_philosopher(
        dao,
        request.user_id,
        request.prompt,
        request.advisor_name,
        request.chat_id,
    )
