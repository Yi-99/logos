from fastapi import APIRouter, Depends
from pydantic import BaseModel
from controllers.sync_user import sync_user
from database import get_dao_factory
from dao import DAOFactory

users_router = APIRouter(prefix="/v1/users", tags=["users"])


class SyncUserRequest(BaseModel):
    """
    Request body for syncing a Cognito user to the database.
    """
    user_id: str
    email: str
    display_name: str | None = None


@users_router.post("/sync")
def sync_user_route(request: SyncUserRequest, dao: DAOFactory = Depends(get_dao_factory)):
    user = sync_user(dao, request.user_id, request.email, request.display_name)
    return {"id": str(user.id), "email": user.email}
