"""
Create all database tables.
Run this before init_roles.py
"""
import asyncio
from app.db.session import engine
from app.models.all_models import Base


async def create_tables():
    """Create all tables defined in SQLAlchemy models."""
    print("🚀 Creating database tables...")
    
    async with engine.begin() as conn:
        # Drop all existing tables (use with caution in production!)
        # await conn.run_sync(Base.metadata.drop_all)
        
        # Create all tables
        await conn.run_sync(Base.metadata.create_all)
    
    print("✅ All tables created successfully!")


if __name__ == "__main__":
    asyncio.run(create_tables())
