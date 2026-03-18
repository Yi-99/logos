import uuid
from fastapi import HTTPException
from dao import DAOFactory


def get_chat_by_id(dao: DAOFactory, chat_id: str):
    """
    Get chat by ID
    """
    try:
        chat = dao.chats.get_by_id(uuid.UUID(chat_id))
        if not chat:
            raise HTTPException(status_code=404, detail="Chat not found!")

        return {
            "id": str(chat.id),
            "user_id": str(chat.user_id),
            "advisor_name": chat.advisor_name,
            "created_at": chat.created_at.isoformat(),
            "last_accessed_at": chat.last_accessed_at.isoformat(),
        }
    except HTTPException:
        raise
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Error fetching chat") from e
