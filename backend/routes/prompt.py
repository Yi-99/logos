import logging
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from openai import RateLimitError, APIError
from models.models import History, PromptRequest
from database import get_dao_factory
from dao import DAOFactory

logger = logging.getLogger(__name__)

prompt_router = APIRouter(prefix="/v1/prompt", tags=["prompt"])


@prompt_router.post("/")
def prompt_philosopher_route(request: PromptRequest, dao: DAOFactory = Depends(get_dao_factory)):
    """
    Prompts the AI as an advisor
    """
    from controllers import prompt_philosopher

    try:
        return prompt_philosopher(
            dao,
            request.user_id,
            request.prompt,
            request.advisor_name,
            request.chat_id,
            request.history,
        )
    except RateLimitError as e:
        logger.error(f"OpenAI rate limit error: {e}")
        raise HTTPException(status_code=429, detail="AI service is currently unavailable. Please check billing or try again later.")
    except APIError as e:
        logger.error(f"OpenAI API error: {e}")
        raise HTTPException(status_code=502, detail="AI service error. Please try again later.")


@prompt_router.post("/transcribe")
async def transcribe_audio_route(audio: UploadFile = File(...)):
    """
    Transcribes audio using OpenAI Whisper
    """
    from controllers.transcribe_audio import transcribe_audio

    return transcribe_audio(audio)
