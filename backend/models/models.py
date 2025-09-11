from pydantic import BaseModel

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