import uuid
from fastapi import HTTPException
from dao import DAOFactory


def get_philosopher_by_id(dao: DAOFactory, philosopher_id: str):
    """
    Get a philosopher by id
    """
    philosopher = dao.philosophers.get_by_id(uuid.UUID(philosopher_id))

    if not philosopher:
        raise HTTPException(status_code=404, detail=f"Philosopher with id {philosopher_id} not found")

    return {
        "id": str(philosopher.id),
        "name": philosopher.name,
        "subtitle": philosopher.subtitle,
        "description": philosopher.description,
        "quote": philosopher.quote,
        "dates": philosopher.dates,
        "location": philosopher.location,
        "image": philosopher.image,
        "image_classic": philosopher.image_classic,
        "config": philosopher.config,
        "sort_order": philosopher.sort_order,
        "number_of_prompts": philosopher.number_of_prompts,
    }
