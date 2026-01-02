from fastapi import APIRouter, UploadFile, File
from models.models import History, PromptRequest

prompt_router = APIRouter(prefix="/v1/prompt", tags=["prompt"])

@prompt_router.post("/")
def prompt_philosopher_route(request: PromptRequest):
  """
  Prompts the AI as an advisor
  """
  from controllers import prompt_philosopher
  return prompt_philosopher(
    request.user_id,
    request.prompt,
    request.advisor_name,
    request.chat_id,
    request.history
  )


@prompt_router.post("/transcribe")
async def transcribe_audio_route(audio: UploadFile = File(...)):
  """
  Transcribes audio using OpenAI Whisper
  """
  from controllers.transcribe_audio import transcribe_audio
  return transcribe_audio(audio)
