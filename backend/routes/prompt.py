from fastapi import APIRouter
from models.models import History, PromptRequest

prompt_router = APIRouter(prefix="/v1/prompt", tags=["prompt"])

@prompt_router.post("/")
def prompt_advisor_route(request: PromptRequest):
  """
  Prompts the AI as an advisor
  """
  from controllers import prompt_advisor
  return prompt_advisor(request.prompt, request.advisor_name, request.chat_id, request.history)