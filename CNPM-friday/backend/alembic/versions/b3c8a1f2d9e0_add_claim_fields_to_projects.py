"""Add claim fields to projects table

Revision ID: b3c8a1f2d9e0
Revises: 9f1b6c3a2d10
Create Date: 2026-02-03 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'b3c8a1f2d9e0'
down_revision: Union[str, Sequence[str], None] = '9f1b6c3a2d10'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('projects', sa.Column('claimed_by_id', postgresql.UUID(as_uuid=True), nullable=True))
    op.add_column('projects', sa.Column('claimed_at', sa.DateTime(timezone=True), nullable=True))
    op.create_foreign_key(
        'fk_projects_claimed_by_users',
        'projects',
        'users',
        ['claimed_by_id'],
        ['user_id']
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint('fk_projects_claimed_by_users', 'projects', type_='foreignkey')
    op.drop_column('projects', 'claimed_at')
    op.drop_column('projects', 'claimed_by_id')
