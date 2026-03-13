from fastapi import HTTPException
from pydantic import BaseModel
from db import SupabaseService


class GetChatByIdResponse(BaseModel):
	id: str
	created_at: str
	last_accessed_at: str
	content: str
	user_id: str
	advisor_name: str

def get_chat_by_id(chat_id: str):
  """
  Get chat by ID
  """
  db_service = SupabaseService()
  supabase = db_service.get_client()

  try:
    response: GetChatByIdResponse = supabase.table("Chats").select("*").eq("id", chat_id).execute()
    if len(response.data) == 0:
      raise HTTPException(status_code=404, detail="Chat not found!")
    
    chat = response.data[0]
    print(chat)
    
    return chat
  except Exception as e:
    print(e)
    raise HTTPException(status_code=500, detail="Error fetching chat")
  
  return {"message": f"Hello from OpenAI! {chat_id}"}