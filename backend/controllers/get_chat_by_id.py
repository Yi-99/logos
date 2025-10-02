from fastapi import HTTPException
from db import SupabaseService


def get_chat_by_id(chat_id: int):
  """
  Get chat by ID
  """
  db_service = SupabaseService()
  supabase = db_service.get_client()
  
  try:
    response = supabase.table("Chat").select("*").eq("chat_id", chat_id).execute()
    if len(response.data) == 0:
      raise HTTPException(status_code=404, detail="Chat not found!")
    
    chat = response.data[0]
    print(chat)
    
    return chat
  except Exception as e:
    print(e)
    raise HTTPException(status_code=500, detail="Error fetching chat")
  
  return {"message": f"Hello from OpenAI! {chat_id}"}