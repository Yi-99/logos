from fastapi import APIRouter, HTTPException
from controllers import get_philosopher_by_id, get_philosophers, create_philosopher
from models.models import Philosopher

philosophers_router = APIRouter(prefix="/v1/philosophers", tags=["philosophers"])

@philosophers_router.get("/")
def get_philosophers_route():
	return get_philosophers()

@philosophers_router.get("/{philosopher_id}")
def get_philosopher_by_id_route(philosopher_id: str):
	try:
		return get_philosopher_by_id(philosopher_id)
	except ValueError as e:
		raise HTTPException(status_code=404, detail=str(e)) from e
	except Exception as e:
		raise HTTPException(status_code=500, detail="Internal server error") from e

@philosophers_router.post("/")
def create_philosopher_route(philosopher: Philosopher):
	return create_philosopher(philosopher)