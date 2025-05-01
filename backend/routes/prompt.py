from fastapi import APIRouter
from pydantic import BaseModel

prompt_router = APIRouter(prefix="/v1/prompt", tags=["prompt"])

class History(BaseModel):
  role: str
  content: str
  
  def to_dict(self):
    return {"role": self.role, "content": self.content}

class PromptRequest(BaseModel):
  prompt: str
  advisor_name: str
  chat_id: str = None
  history: list[History] = None

@prompt_router.post("/")
def prompt_advisor_route(request: PromptRequest):
  """
  Prompts the AI as an advisor
  """
  from controllers import prompt_advisor
  return prompt_advisor(request.prompt, request.advisor_name, request.chat_id, request.history)