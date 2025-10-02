from db import SupabaseService
from models.models import Chat
from supabase import create_client, Client
from dotenv import load_dotenv
from fastapi import HTTPException
import os

load_dotenv()

url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(
  supabase_url=url,
  supabase_key=key
)

def create_chat(chat_name: str, advisor_name: str):
  """
  Create a new chat
  """
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