"""add_messages_table_and_chat_summary

Revision ID: a1b2c3d4e5f6
Revises: 479f074bf17f
Create Date: 2026-03-17 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = '479f074bf17f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add summary columns to chats
    op.add_column('chats', sa.Column('summary', sa.Text(), nullable=True))
    op.add_column('chats', sa.Column('summary_through_message_id', UUID(as_uuid=True), nullable=True))

    # Messages table
    op.create_table(
        'messages',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('chat_id', UUID(as_uuid=True), sa.ForeignKey('chats.id', ondelete='CASCADE'), nullable=False),
        sa.Column('role', sa.String(), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('token_count', sa.Integer(), nullable=True),
        sa.Column('metadata', JSONB(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index('ix_messages_chat_id_created_at', 'messages', ['chat_id', 'created_at'])


def downgrade() -> None:
    op.drop_index('ix_messages_chat_id_created_at', table_name='messages')
    op.drop_table('messages')
    op.drop_column('chats', 'summary_through_message_id')
    op.drop_column('chats', 'summary')
