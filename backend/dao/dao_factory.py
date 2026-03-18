from sqlalchemy.orm import Session

from dao.user_dao import UserDAO
from dao.philosopher_dao import PhilosopherDAO
from dao.chat_dao import ChatDAO
from dao.message_dao import MessageDAO
from dao.philosopher_document_dao import PhilosopherDocumentDAO


class DAOFactory:
    """Factory that produces DAO instances bound to a single session."""

    def __init__(self, session: Session):
        self._session = session

    @property
    def users(self) -> UserDAO:
        return UserDAO(self._session)

    @property
    def philosophers(self) -> PhilosopherDAO:
        return PhilosopherDAO(self._session)

    @property
    def chats(self) -> ChatDAO:
        return ChatDAO(self._session)

    @property
    def messages(self) -> MessageDAO:
        return MessageDAO(self._session)

    @property
    def philosopher_documents(self) -> PhilosopherDocumentDAO:
        return PhilosopherDocumentDAO(self._session)
