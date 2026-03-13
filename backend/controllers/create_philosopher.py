from models.models import Philosopher
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


def create_philosopher(philosopher: Philosopher):
  """
  Create a new philosopher
  """  
  result = supabase.table("Philosophers").insert(philosopher.model_dump()).execute()
  return {"status": 200, "message": "Philosopher created successfully", "data": result.data}