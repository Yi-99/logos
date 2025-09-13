from fastapi import APIRouter
from controllers import get_chat_by_id, get_chats, create_chat
from models.models import Chat

chat_router = APIRouter(prefix="/v1/chat", tags=["chat"])

@chat_router.get("/")
def get_chat_route():
  return get_chats()

@chat_router.get("/{chat_id}")
def get_chat_by_id_route(chat_id: int):
  return get_chat_by_id(chat_id)

@chat_router.post("/")
def create_chat_route(chat: Chat):
  return create_chat(chat)