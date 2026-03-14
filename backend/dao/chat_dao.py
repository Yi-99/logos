import uuid
from sqlalchemy.orm import Session

from dao.base_dao import BaseDAO
from models.chat import Chat


class ChatDAO(BaseDAO):
    model = Chat

    def __init__(self, session: Session):
        super().__init__(session)

    def get_by_user_id(self, user_id: uuid.UUID) -> list[Chat]:
        return (
            self.session.query(Chat)
            .filter(Chat.user_id == user_id)
            .order_by(Chat.created_at.desc())
            .all()
        )

    def upsert(self, chat_id: uuid.UUID, user_id: uuid.UUID, advisor_name: str, content: list) -> Chat:
        chat = self.get_by_id(chat_id)
        if chat:
            chat.content = content
            chat.advisor_name = advisor_name
            self.session.commit()
            self.session.refresh(chat)
            return chat
        return self.create(
            id=chat_id,
            user_id=user_id,
            advisor_name=advisor_name,
            content=content,
        )
