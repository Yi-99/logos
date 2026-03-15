from fastapi import HTTPException
from dao import DAOFactory
from models.models import Philosopher as PhilosopherRequest


def create_philosopher(dao: DAOFactory, philosopher: PhilosopherRequest):
    """
    Create a new philosopher
    """
    try:
        created = dao.philosophers.create(**philosopher.model_dump())
        return {
            "status": 200,
            "message": "Philosopher created successfully",
            "data": {
                "id": str(created.id),
                "name": created.name,
            },
        }
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Error creating philosopher") from e
