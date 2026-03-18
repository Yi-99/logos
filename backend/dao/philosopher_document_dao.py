import uuid
from sqlalchemy.orm import Session

from dao.base_dao import BaseDAO
from models.philosopher_document import PhilosopherDocument


class PhilosopherDocumentDAO(BaseDAO):
    model = PhilosopherDocument

    def __init__(self, session: Session):
        super().__init__(session)

    def search_similar(self, philosopher_id: uuid.UUID, query_embedding: list[float],
                       limit: int = 5) -> list[PhilosopherDocument]:
        return (
            self.session.query(PhilosopherDocument)
            .filter(PhilosopherDocument.philosopher_id == philosopher_id)
            .order_by(PhilosopherDocument.embedding.cosine_distance(query_embedding))
            .limit(limit)
            .all()
        )

    def get_by_philosopher_id(self, philosopher_id: uuid.UUID) -> list[PhilosopherDocument]:
        return (
            self.session.query(PhilosopherDocument)
            .filter(PhilosopherDocument.philosopher_id == philosopher_id)
            .order_by(PhilosopherDocument.chunk_index.asc())
            .all()
        )
