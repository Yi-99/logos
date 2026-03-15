"""create_users_philosophers_chats_tables

Revision ID: 479f074bf17f
Revises:
Create Date: 2026-03-13 23:39:33.484359

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB


# revision identifiers, used by Alembic.
revision: str = '479f074bf17f'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Users table
    op.create_table(
        'users',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('email', sa.String(), nullable=False, unique=True),
        sa.Column('display_name', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # Philosophers table
    op.create_table(
        'philosophers',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('name', sa.String(), nullable=False, unique=True),
        sa.Column('subtitle', sa.String(), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('quote', sa.Text(), nullable=True),
        sa.Column('dates', sa.String(), nullable=False),
        sa.Column('location', sa.String(), nullable=True),
        sa.Column('image', sa.String(), nullable=False),
        sa.Column('image_classic', sa.String(), nullable=True),
        sa.Column('config', sa.Text(), nullable=False),
        sa.Column('sort_order', sa.Integer(), nullable=False, server_default=sa.text('0')),
        sa.Column('number_of_prompts', sa.Integer(), nullable=False, server_default=sa.text('0')),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # Chats table
    op.create_table(
        'chats',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('advisor_name', sa.String(), nullable=False),
        sa.Column('content', JSONB(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('last_accessed_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # Indexes
    op.create_index('ix_chats_user_id', 'chats', ['user_id'])
    op.create_index('ix_chats_created_at', 'chats', ['created_at'])
    op.create_index('ix_philosophers_name', 'philosophers', ['name'])


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index('ix_philosophers_name', table_name='philosophers')
    op.drop_index('ix_chats_created_at', table_name='chats')
    op.drop_index('ix_chats_user_id', table_name='chats')
    op.drop_table('chats')
    op.drop_table('philosophers')
    op.drop_table('users')
