from fastapi import APIRouter
from controllers.create_philosopher import create_philosopher
from controllers.get_philosophers import get_philosophers
from models.models import Philosopher

philosophers_router = APIRouter(prefix="/v1/philosophers", tags=["philosophers"])

@philosophers_router.get("/")
def get_philosophers_route():
  return get_philosophers()

@philosophers_router.post("/")
def create_philosopher_route(philosopher: Philosopher):
  return create_philosopher(philosopher)