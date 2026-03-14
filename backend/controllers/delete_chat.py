import uuid
from fastapi import HTTPException
from dao import DAOFactory


def delete_chat(dao: DAOFactory, chat_id: str):
    """
    Delete a chat by ID
    """
    try:
        deleted = dao.chats.delete(uuid.UUID(chat_id))
        if not deleted:
            raise HTTPException(status_code=404, detail="Chat not found")

        return {"chat_id": chat_id, "deleted": True}
    except HTTPException:
        raise
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Error deleting chat") from e
