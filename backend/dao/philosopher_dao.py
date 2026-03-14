from sqlalchemy.orm import Session

from dao.base_dao import BaseDAO
from models.philosopher import Philosopher


class PhilosopherDAO(BaseDAO):
    model = Philosopher

    def __init__(self, session: Session):
        super().__init__(session)

    def get_by_name(self, name: str) -> Philosopher | None:
        return self.session.query(Philosopher).filter(Philosopher.name == name).first()

    def get_config_by_name(self, name: str) -> str | None:
        result = (
            self.session.query(Philosopher.config)
            .filter(Philosopher.name == name)
            .first()
        )
        return result[0] if result else None

    def increment_prompts(self, name: str) -> Philosopher | None:
        philosopher = self.get_by_name(name)
        if not philosopher:
            return None
        philosopher.number_of_prompts = (philosopher.number_of_prompts or 0) + 1
        self.session.commit()
        self.session.refresh(philosopher)
        return philosopher
