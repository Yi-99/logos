"""add_philosopher_documents_with_pgvector

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-03-17 00:00:01.000000

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = 'b2c3d4e5f6a7'
down_revision: Union[str, Sequence[str], None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Enable pgvector extension
    op.execute('CREATE EXTENSION IF NOT EXISTS vector')

    # Philosopher documents table
    op.execute("""
        CREATE TABLE philosopher_documents (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            philosopher_id UUID NOT NULL REFERENCES philosophers(id) ON DELETE CASCADE,
            source_title VARCHAR NOT NULL,
            source_type VARCHAR NOT NULL,
            chunk_text TEXT NOT NULL,
            chunk_index INTEGER NOT NULL,
            embedding vector(1536),
            metadata JSONB,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
    """)

    # HNSW index for vector similarity search
    op.execute(
        'CREATE INDEX ix_philosopher_documents_embedding '
        'ON philosopher_documents USING hnsw (embedding vector_cosine_ops) '
        'WITH (m = 16, ef_construction = 64)'
    )


def downgrade() -> None:
    op.execute('DROP INDEX IF EXISTS ix_philosopher_documents_embedding')
    op.execute('DROP TABLE IF EXISTS philosopher_documents')
    op.execute('DROP EXTENSION IF EXISTS vector')
