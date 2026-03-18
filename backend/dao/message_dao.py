import uuid
from sqlalchemy.orm import Session

from dao.base_dao import BaseDAO
from models.message import Message


class MessageDAO(BaseDAO):
    model = Message

    def __init__(self, session: Session):
        super().__init__(session)

    def create(self, chat_id: uuid.UUID, role: str, content: str,
               token_count: int = None, metadata: dict = None) -> Message:
        message = Message(
            chat_id=chat_id,
            role=role,
            content=content,
            token_count=token_count,
            metadata_=metadata,
        )
        self.session.add(message)
        self.session.commit()
        self.session.refresh(message)
        return message

    def get_by_chat_id(self, chat_id: uuid.UUID, limit: int = None) -> list[Message]:
        query = (
            self.session.query(Message)
            .filter(Message.chat_id == chat_id)
            .order_by(Message.created_at.asc())
        )
        if limit:
            query = query.limit(limit)
        return query.all()

    def get_recent(self, chat_id: uuid.UUID, n: int) -> list[Message]:
        return (
            self.session.query(Message)
            .filter(Message.chat_id == chat_id)
            .order_by(Message.created_at.desc())
            .limit(n)
            .all()
        )[::-1]  # Reverse to chronological order
