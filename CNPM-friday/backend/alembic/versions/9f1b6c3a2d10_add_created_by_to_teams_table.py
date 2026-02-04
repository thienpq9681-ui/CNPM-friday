"""Add created_by to teams table

Revision ID: 9f1b6c3a2d10
Revises: 7c7bea4962aa
Create Date: 2026-02-02 20:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9f1b6c3a2d10'
down_revision: Union[str, Sequence[str], None] = '7c7bea4962aa'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('teams', sa.Column('created_by', sa.dialects.postgresql.UUID(), nullable=True))
    op.create_foreign_key(
        'fk_teams_created_by_users',
        'teams',
        'users',
        ['created_by'],
        ['user_id']
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint('fk_teams_created_by_users', 'teams', type_='foreignkey')
    op.drop_column('teams', 'created_by')
