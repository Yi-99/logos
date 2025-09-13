from .chat import chat_router
from .prompt import prompt_router
from .philosophers import philosophers_router

__all__ = [
  "chat_router",
  "prompt_router",
  "philosophers_router"
]