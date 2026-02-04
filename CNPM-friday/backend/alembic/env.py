from logging.config import fileConfig

import asyncio

from sqlalchemy import pool
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.engine import Connection

from alembic import context

# Import your models for autogenerate
from app.core.config import settings
from app.db.base import Base
from app.models.all_models import *  # Import all models

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here
# for 'autogenerate' support
target_metadata = Base.metadata

# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.


import os
from dotenv import load_dotenv

load_dotenv()

# ...

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
<<<<<<< HEAD:backend/alembic/env.py
    url = get_database_url()
=======
    url = os.getenv("DATABASE_URL")
    if url and url.startswith("postgresql+asyncpg://"):
         url = url.replace("postgresql+asyncpg://", "postgresql://")
    
>>>>>>> upstream/main:CNPM-friday/backend/alembic/env.py
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def get_database_url() -> str:
    """Get database URL from settings (supports asyncpg)."""
    return settings.DATABASE_URL


def do_run_migrations(connection: Connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
<<<<<<< HEAD:backend/alembic/env.py
    """Run migrations in 'online' mode using async engine."""
    connectable = create_async_engine(
        get_database_url(),
=======
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """
    # Force use of env var
    url = os.getenv("DATABASE_URL")
    if url and url.startswith("postgresql+asyncpg://"):
         url = url.replace("postgresql+asyncpg://", "postgresql://")
    
    cfg = config.get_section(config.config_ini_section, {})
    cfg["sqlalchemy.url"] = url
    
    connectable = engine_from_config(
        cfg,
        prefix="sqlalchemy.",
>>>>>>> upstream/main:CNPM-friday/backend/alembic/env.py
        poolclass=pool.NullPool,
    )

    async def run_async_migrations() -> None:
        async with connectable.connect() as connection:
            await connection.run_sync(do_run_migrations)
        await connectable.dispose()

    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
