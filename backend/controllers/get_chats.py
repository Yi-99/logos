import uuid
from fastapi import HTTPException
from dao import DAOFactory


def get_chats(dao: DAOFactory, user_id: str = None):
    """
    Get all chats, optionally filtered by user_id.
    Includes message_count and last_message from the messages table.
    """
    try:
        if user_id:
            chats = dao.chats.get_by_user_id(uuid.UUID(user_id))
        else:
            chats = dao.chats.get_all()

        result = []
        for chat in chats:
            messages = dao.messages.get_by_chat_id(chat.id)
            message_count = len(messages)
            last_message = None
            if messages:
                last_msg = messages[-1]
                last_message = {
                    "role": last_msg.role,
                    "content": last_msg.content[:200],
                }

            result.append({
                "id": str(chat.id),
                "user_id": str(chat.user_id),
                "advisor_name": chat.advisor_name,
                "message_count": message_count,
                "last_message": last_message,
                "created_at": chat.created_at.isoformat(),
                "last_accessed_at": chat.last_accessed_at.isoformat(),
            })

        return result
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Error fetching chats") from e
