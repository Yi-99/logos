from fastapi import HTTPException
from db import SupabaseService

def create_chat(chat_name: str, advisor_name: str):
  """
  Create a new chat
  """
  db_service = SupabaseService()
  supabase = db_service.get_client()
  
  try:
    response = supabase.table("Chat").insert({
      "chat_name", chat_name,
      "advisor_name", advisor_name
    }).execute()
    
    if len(response.data) == 0:
      raise HTTPException(status_code=400, detail="Failed to create chat!")
    
    new_chat = response.data[0]
    print(new_chat)
    
    return new_chat
  except Exception as e:
    print(e)
    raise HTTPException(status_code=500, detail="Error creating chat")