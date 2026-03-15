import uuid
from fastapi import HTTPException
from dao import DAOFactory


def sync_user(dao: DAOFactory, user_id: str, email: str, display_name: str = None):
    """
    Ensures a user exists in the database after successful Cognito authentication.
    Creates the user if they don't exist, otherwise returns the existing user.
    """
    try:
        uid = uuid.UUID(user_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid user ID format") from e

    existing = dao.users.get_by_id(uid)
    if existing:
        return existing

    try:
        user = dao.users.create(id=uid, email=email, display_name=display_name)
        return user
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Error creating user") from e
