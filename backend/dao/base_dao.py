import uuid
from sqlalchemy.orm import Session

from models.base import Base


class BaseDAO:
    """Base DAO with common CRUD operations."""

    model: type[Base] = None

    def __init__(self, session: Session):
        self.session = session

    def get_by_id(self, entity_id: uuid.UUID):
        return self.session.query(self.model).filter(self.model.id == entity_id).first()

    def get_all(self):
        return self.session.query(self.model).all()

    def create(self, **kwargs):
        entity = self.model(**kwargs)
        self.session.add(entity)
        self.session.commit()
        self.session.refresh(entity)
        return entity

    def update(self, entity_id: uuid.UUID, **kwargs):
        entity = self.get_by_id(entity_id)
        if not entity:
            return None
        for key, value in kwargs.items():
            setattr(entity, key, value)
        self.session.commit()
        self.session.refresh(entity)
        return entity

    def delete(self, entity_id: uuid.UUID) -> bool:
        entity = self.get_by_id(entity_id)
        if not entity:
            return False
        self.session.delete(entity)
        self.session.commit()
        return True
