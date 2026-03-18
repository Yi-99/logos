import tiktoken


def count_tokens(text: str, model: str = "o200k_base") -> int:
    """Count tokens in a text string using tiktoken."""
    encoding = tiktoken.get_encoding(model)
    return len(encoding.encode(text))


def count_messages_tokens(messages: list[dict], model: str = "o200k_base") -> int:
    """Count total tokens across a list of message dicts with 'content' keys."""
    encoding = tiktoken.get_encoding(model)
    total = 0
    for msg in messages:
        # Each message has overhead (~4 tokens for role/formatting)
        total += 4
        total += len(encoding.encode(msg.get("content", "")))
    return total
