from models.models import Chat
from supabase import create_client, Client
from dotenv import load_dotenv
import os

load_dotenv()

url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(
  supabase_url=url,
  supabase_key=key
)

def create_chat(chat: Chat):
  """
  Create a new chat
  """
  result = supabase.table("Chat").insert(chat.model_dump()).execute()
  return {"status": 200, "message": "Chat created successfully", "data": result.data}