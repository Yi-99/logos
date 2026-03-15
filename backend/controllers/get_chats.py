import uuid
from fastapi import HTTPException
from dao import DAOFactory


def get_chats(dao: DAOFactory, user_id: str = None):
    """
    Get all chats, optionally filtered by user_id
    """
    try:
        if user_id:
            chats = dao.chats.get_by_user_id(uuid.UUID(user_id))
        else:
            chats = dao.chats.get_all()

        return [
            {
                "id": str(chat.id),
                "user_id": str(chat.user_id),
                "advisor_name": chat.advisor_name,
                "content": chat.content,
                "created_at": chat.created_at.isoformat(),
                "last_accessed_at": chat.last_accessed_at.isoformat(),
            }
            for chat in chats
        ]
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Error fetching chats") from e
