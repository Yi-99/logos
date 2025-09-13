import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(
  supabase_url=url,
  supabase_key=key
)

def get_philosophers():
	"""
	Get all philosophers
	"""
	return supabase.table("Philosophers").select("*").execute()