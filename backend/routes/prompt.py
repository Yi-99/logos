from fastapi import APIRouter, Depends, UploadFile, File
from models.models import PromptRequest
from database import get_dao_factory
from dao import DAOFactory

prompt_router = APIRouter(prefix="/v1/prompt", tags=["prompt"])


@prompt_router.post("/")
def prompt_philosopher_route(request: PromptRequest, dao: DAOFactory = Depends(get_dao_factory)):
    """
    Prompts the AI as an advisor
    """
    from controllers import prompt_philosopher

    return prompt_philosopher(
        dao,
        request.user_id,
        request.prompt,
        request.advisor_name,
        request.chat_id,
    )


@prompt_router.post("/transcribe")
async def transcribe_audio_route(audio: UploadFile = File(...)):
    """
    Transcribes audio using OpenAI Whisper
    """
    from controllers.transcribe_audio import transcribe_audio

    return transcribe_audio(audio)
