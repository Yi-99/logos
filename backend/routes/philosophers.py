from fastapi import APIRouter
from pydantic import BaseModel

from controllers import get_philosophers

philosopher_router = APIRouter(prefix="/v1/philosophers", tags=["philosophers"])

class Advisor(BaseModel):
  philosopher_name: str
  philosopher_config: str

@philosopher_router.get("/")
def get_philosophers_route():
  return get_philosophers()