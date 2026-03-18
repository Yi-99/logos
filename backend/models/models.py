from pydantic import BaseModel
import datetime


class History(BaseModel):
  role: str
  content: str

  def to_dict(self):
    return {"role": self.role, "content": self.content}


class PromptRequest(BaseModel):
  user_id: str
  prompt: str
  advisor_name: str
  chat_id: str | None = None


class MessageResponse(BaseModel):
  id: str
  chat_id: str
  role: str
  content: str
  token_count: int | None = None
  metadata: dict | None = None
  created_at: str


class Philosopher(BaseModel):
  name: str
  config: str
  dates: str
  image: str
  number_of_prompts: int = 0
  image_classic: str = None
  updated_at: str = datetime.datetime.now().isoformat()
  description: str = None
  quote: str = None


class Chat(BaseModel):
  id: str
  user_id: str
  content: str
  last_accessed_at: str = datetime.datetime.now().isoformat()