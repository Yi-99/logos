import os
from db import SupabaseService

def get_philosophers():
	"""
	Get all advisors
	"""
	db_service = SupabaseService()
	supabase = db_service.get_client()
	
	response = supabase.table("Philosophers").select("*").execute()
	return response.data