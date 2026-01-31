"""Database session management for async SQLAlchemy operations."""

from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings


# Create async engine with connection pooling
# statement_cache_size=0 is required for Supabase pgbouncer (connection pooler)
# which doesn't support prepared statements
engine: AsyncEngine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    # Force disable prepared statements for Supabase transaction mode
    connect_args={
        "statement_cache_size": 0,
        "prepared_statement_cache_size": 0,
    },
)

# Create async session factory
AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,  # Prevent automatic expiration of objects after commit
)


async def get_db() -> AsyncSession:
    """
    Dependency function for FastAPI endpoints.
    Provides an async database session and handles cleanup.

    Yields:
        AsyncSession: Database session for the request
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            # Session will be automatically closed by the async context manager
            pass