from fastapi import APIRouter, Depends, HTTPException
from controllers import get_philosopher_by_id, get_philosophers, create_philosopher, get_philosopher_image_url
from models.models import Philosopher
from database import get_dao_factory
from dao import DAOFactory

philosophers_router = APIRouter(prefix="/v1/philosophers", tags=["philosophers"])


@philosophers_router.get("/")
def get_philosophers_route(dao: DAOFactory = Depends(get_dao_factory)):
    return get_philosophers(dao)


@philosophers_router.get("/image")
def get_philosopher_image_route(key: str):
    import logging
    logger = logging.getLogger(__name__)
    logger.info(f"Image route called with key: '{key}'")
    try:
        return get_philosopher_image_url(key)
    except Exception as e:
        logger.error(f"Image route error for key '{key}': {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to generate image URL") from e


@philosophers_router.get("/{philosopher_id}")
def get_philosopher_by_id_route(philosopher_id: str, dao: DAOFactory = Depends(get_dao_factory)):
    try:
        return get_philosopher_by_id(dao, philosopher_id)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error") from e


@philosophers_router.post("/")
def create_philosopher_route(philosopher: Philosopher, dao: DAOFactory = Depends(get_dao_factory)):
    return create_philosopher(dao, philosopher)
