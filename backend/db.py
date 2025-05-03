import os
from dotenv import load_dotenv
from supabase import create_client, Client

class SupabaseService:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(SupabaseService, cls).__new__(cls)
            load_dotenv()
            
            url: str = os.getenv("SUPABASE_URL")
            key: str = os.getenv("SUPABASE_KEY")
            
            cls._instance.client = create_client(
                supabase_url=url,
                supabase_key=key
            )
        return cls._instance
    
    def get_client(self):
        return self.client