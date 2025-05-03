from fastapi import APIRouter
from pydantic import BaseModel
from controllers import get_chat_by_id, get_chats, create_chat

chat_router = APIRouter(prefix="/v1/chat", tags=["chat"])

class CreateChatRequest(BaseModel):
  """
  Request body for creating a new chat
  """
  chat_name: str
  advisor_name: str

@chat_router.get("/")
def get_chat_route():
  return get_chats()

@chat_router.get("/{chat_id}")
def get_chat_by_id_route(chat_id: str):
  return get_chat_by_id(chat_id)

@chat_router.post("/")
def create_chat_route(request: CreateChatRequest):
  return create_chat(request.chat_name, request.advisor_name)