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

def get_philosopher_by_id(philosopher_id: str):
    """
    Get a philosopher by id
    """
    result = supabase.table("Philosophers").select("*").eq("id", philosopher_id).execute()
    
    if not result.data or len(result.data) == 0:
        raise ValueError(f"Philosopher with id {philosopher_id} not found")
    
    return result.data[0]