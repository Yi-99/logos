from fastapi import APIRouter, Depends

from database import get_dao_factory
from dao import DAOFactory

stats_router = APIRouter(prefix="/v1/stats", tags=["stats"])


@stats_router.get("/")
def get_stats(dao: DAOFactory = Depends(get_dao_factory)):
    """Public endpoint returning aggregate counts for the landing page."""
    philosopher_count = len(dao.philosophers.get_all())
    dialogue_count = len(dao.chats.get_all())
    return {
        "philosopher_count": philosopher_count,
        "dialogue_count": dialogue_count,
    }
