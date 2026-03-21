from fastapi import APIRouter, Depends, UploadFile, File
from fastapi.responses import StreamingResponse
from models.models import PromptRequest
from database import get_dao_factory
from dao import DAOFactory
from controllers.prompt_philosopher import prompt_philosopher_stream
from dependencies.rate_limit import rate_limit_prompt


prompt_router = APIRouter(prefix="/v1/prompt", tags=["prompt"])


@prompt_router.post("/")
def prompt_philosopher_route(request: PromptRequest = Depends(rate_limit_prompt), dao: DAOFactory = Depends(get_dao_factory)):
    """
    Prompts the AI as an advisor, streaming the response via SSE.
    """
    return StreamingResponse(
        prompt_philosopher_stream(
            dao,
            request.user_id,
            request.prompt,
            request.advisor_name,
            request.chat_id,
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


@prompt_router.post("/transcribe")
async def transcribe_audio_route(audio: UploadFile = File(...)):
    """
    Transcribes audio using OpenAI Whisper
    """
    from controllers.transcribe_audio import transcribe_audio

    return transcribe_audio(audio)
