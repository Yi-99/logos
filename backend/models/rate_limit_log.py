import uuid
from sqlalchemy import String, DateTime, Index, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from models.base import Base


class RateLimitLog(Base):
    __tablename__ = "rate_limit_logs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[str] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    __table_args__ = (
        Index("ix_rate_limit_logs_user_id_created_at", "user_id", "created_at"),
    )

    def __repr__(self) -> str:
        return f"<RateLimitLog(id={self.id}, user_id={self.user_id}, created_at={self.created_at})>"
