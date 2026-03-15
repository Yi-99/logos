from sqlalchemy.orm import Session

from dao.base_dao import BaseDAO
from models.user import User


class UserDAO(BaseDAO):
    model = User

    def __init__(self, session: Session):
        super().__init__(session)

    def get_by_email(self, email: str) -> User | None:
        return self.session.query(User).filter(User.email == email).first()
