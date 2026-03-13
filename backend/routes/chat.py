from fastapi import APIRouter
from pydantic import BaseModel
from controllers import get_chat_by_id, get_chats, create_chat
from controllers.delete_chat import delete_chat

chat_router = APIRouter(prefix="/v1/chat", tags=["chat"])

class CreateChatRequest(BaseModel):
  """
  Request body for creating a new chat
  """
  user_id: str
  advisor_name: str

class DeleteChatRequest(BaseModel):
  """
  Request body for deleting a chat
  """
  chatId: str

@chat_router.get("/")
def get_chat_route(user_id: str = None):
  return get_chats(user_id)

@chat_router.get("/{chat_id}")
def get_chat_by_id_route(chat_id: str):
  return get_chat_by_id(chat_id)

@chat_router.post("/")
def create_chat_route(request: CreateChatRequest):
  return create_chat(request.user_id, request.advisor_name)

@chat_router.delete("/")
def delete_chat_route(request: DeleteChatRequest):
  return delete_chat(request.chatId)