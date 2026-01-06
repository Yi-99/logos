from fastapi import HTTPException
from db import SupabaseService


def delete_chat(chat_id: str):
    """
    Delete a chat by ID
    """
    db_service = SupabaseService()
    supabase = db_service.get_client()

    try:
        # Check if chat exists first
        existing = supabase.table("Chats").select("id").eq("id", chat_id).execute()

        if not existing.data or len(existing.data) == 0:
            raise HTTPException(status_code=404, detail="Chat not found")

        # Delete the chat
        response = supabase.table("Chats").delete().eq("id", chat_id).execute()

        return {"chat_id": chat_id, "deleted": True}
    except HTTPException:
        raise
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Error deleting chat")
