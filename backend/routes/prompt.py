from fastapi import APIRouter
from pydantic import BaseModel

prompt_router = APIRouter(prefix="/v1/prompt", tags=["prompt"])

class PromptRequest(BaseModel):
  prompt: str
  config: str

@prompt_router.post("/")
def prompt_advisor_route(request: PromptRequest):
    """
    Prompts the AI as an advisor
    """
    from controllers import prompt_advisor
    return prompt_advisor(request.prompt, request.config)