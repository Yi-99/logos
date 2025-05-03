from fastapi import HTTPException
from db import SupabaseService


def get_chats():
  """
  Get all chats
  """
  db_service = SupabaseService()
  supabase = db_service.get_client()
  
  try:
    response = supabase.table("Chat").select("*").execute()
    
    if len(response.data) == 0:
      raise HTTPException(status_code=404, detail="No chats found!")
    
    chats = response.data
    print(chats)
    
    return chats    
  except Exception as e:
    print(e)
    raise HTTPException(status_code=500, detail="Error fetching chats")