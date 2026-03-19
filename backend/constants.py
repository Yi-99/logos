OPENAI_MODELS = {
    "chat": {
        "o4-mini": "o4-mini-2025-04-16",
        "o3": "o3-2025-04-16",
        "o3-mini": "o3-mini-2025-01-31",
        "gpt-4o": "gpt-4o-2024-08-06",
        "gpt-4o-mini": "gpt-4o-mini-2024-07-18",
        "gpt-4-turbo": "gpt-4-turbo-2024-04-09",
        "gpt-4.1": "gpt-4.1-2025-04-14",
        "gpt-4.1-mini": "gpt-4.1-mini-2025-04-14",
        "gpt-4.1-nano": "gpt-4.1-nano-2025-04-14",
    },
    "embedding": {
        "text-embedding-3-small": "text-embedding-3-small",
        "text-embedding-3-large": "text-embedding-3-large",
        "text-embedding-ada-002": "text-embedding-ada-002",
    },
}

OPENAI_CHAT_MODEL = OPENAI_MODELS["chat"]["o4-mini"]
OPENAI_EMBEDDING_MODEL = OPENAI_MODELS["embedding"]["text-embedding-3-small"]
