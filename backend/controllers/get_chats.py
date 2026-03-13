from fastapi import HTTPException
from db import SupabaseService


def get_chats(user_id: str = None):
  """
  Get all chats, optionally filtered by user_id
  """
  db_service = SupabaseService()
  supabase = db_service.get_client()

  try:
    query = supabase.table("Chats").select("*")

    if user_id:
      query = query.eq("user_id", user_id)

    response = query.order("created_at", desc=True).execute()

    return response.data or []
  except Exception as e:
    print(e)
    raise HTTPException(status_code=500, detail="Error fetching chats")