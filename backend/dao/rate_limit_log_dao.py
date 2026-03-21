from sqlalchemy import func, text
from sqlalchemy.orm import Session

from dao.base_dao import BaseDAO
from models.rate_limit_log import RateLimitLog


class RateLimitLogDAO(BaseDAO):
    model = RateLimitLog

    def __init__(self, session: Session):
        super().__init__(session)

    def check_rate_limit(self, user_id: str, max_requests: int = 5, window_seconds: int = 60) -> bool:
        """
        Sliding window log rate limiter.
        Returns True if the request is allowed, False if rate limited.
        """
        cutoff = func.now() - text(f"interval '{window_seconds} seconds'")

        # Prune stale entries for this user
        self.session.query(RateLimitLog).filter(
            RateLimitLog.user_id == user_id,
            RateLimitLog.created_at < cutoff,
        ).delete(synchronize_session=False)

        # Count remaining entries in the window
        count = self.session.query(func.count(RateLimitLog.id)).filter(
            RateLimitLog.user_id == user_id,
            RateLimitLog.created_at >= cutoff,
        ).scalar()

        if count >= max_requests:
            self.session.commit()
            return False

        # Log this request
        self.session.add(RateLimitLog(user_id=user_id))
        self.session.commit()
        return True
