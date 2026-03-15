from fastapi import APIRouter, Depends
from pydantic import BaseModel
from controllers import get_chat_by_id, get_chats, create_chat
from controllers.delete_chat import delete_chat
from database import get_dao_factory
from dao import DAOFactory

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
def get_chat_route(user_id: str = None, dao: DAOFactory = Depends(get_dao_factory)):
    return get_chats(dao, user_id)


@chat_router.get("/{chat_id}")
def get_chat_by_id_route(chat_id: str, dao: DAOFactory = Depends(get_dao_factory)):
    return get_chat_by_id(dao, chat_id)


@chat_router.post("/")
def create_chat_route(request: CreateChatRequest, dao: DAOFactory = Depends(get_dao_factory)):
    return create_chat(dao, request.user_id, request.advisor_name)


@chat_router.delete("/")
def delete_chat_route(request: DeleteChatRequest, dao: DAOFactory = Depends(get_dao_factory)):
    return delete_chat(dao, request.chatId)
