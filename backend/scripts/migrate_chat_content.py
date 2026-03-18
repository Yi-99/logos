"""Migrate existing chat content JSONB blobs into the messages table.

Usage:
    uv run python -m scripts.migrate_chat_content
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import config  # noqa: F401
from database import SessionLocal
from models.chat import Chat
from models.message import Message


def migrate():
    session = SessionLocal()
    try:
        chats = session.query(Chat).filter(Chat.content.isnot(None)).all()
        total_messages = 0

        for chat in chats:
            # Check if messages already exist for this chat
            existing = session.query(Message).filter(Message.chat_id == chat.id).count()
            if existing > 0:
                print(f"  Skipping chat {chat.id} — already has {existing} messages")
                continue

            content = chat.content
            if not isinstance(content, list):
                print(f"  Skipping chat {chat.id} — content is not a list")
                continue

            for item in content:
                if not isinstance(item, dict):
                    continue
                role = item.get("role")
                text = item.get("content")
                if role and text:
                    message = Message(
                        chat_id=chat.id,
                        role=role,
                        content=text,
                    )
                    session.add(message)
                    total_messages += 1

        session.commit()
        print(f"\nMigrated {total_messages} messages from {len(chats)} chats.")
    finally:
        session.close()


if __name__ == "__main__":
    migrate()
