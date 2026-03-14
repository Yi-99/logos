import uuid
from fastapi import HTTPException
from dao import DAOFactory


def create_chat(dao: DAOFactory, user_id: str, advisor_name: str):
    """
    Create a new chat
    """
    try:
        chat = dao.chats.create(
            user_id=uuid.UUID(user_id),
            advisor_name=advisor_name,
        )
        return {
            "id": str(chat.id),
            "user_id": str(chat.user_id),
            "advisor_name": chat.advisor_name,
            "content": chat.content,
            "created_at": chat.created_at.isoformat(),
        }
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Unknown error creating chat") from e
