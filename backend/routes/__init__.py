from .chat import chat_router
from .prompt import prompt_router
from .philosophers import philosopher_router

__all__ = [
  "chat_router",
  "prompt_router",
  "philosopher_router"
]