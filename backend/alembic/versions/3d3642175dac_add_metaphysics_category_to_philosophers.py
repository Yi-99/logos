"""add_metaphysics_category_to_philosophers

Revision ID: 3d3642175dac
Revises: b2c3d4e5f6a7
Create Date: 2026-03-18 01:20:55.949155

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3d3642175dac'
down_revision: Union[str, Sequence[str], None] = 'b2c3d4e5f6a7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('philosophers', sa.Column('metaphysics_category', sa.String(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('philosophers', 'metaphysics_category')
