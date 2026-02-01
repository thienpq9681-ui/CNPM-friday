"""
Initialize roles in database.
Run this script once to seed the roles table.
"""
import asyncio
from sqlalchemy import select
from app.db.session import AsyncSessionLocal
from app.models.all_models import Role


async def init_roles():
    """Insert default roles into database."""
    roles_data = [
        {"role_id": 1, "name": "Admin"},
        {"role_id": 2, "name": "Staff"},
        {"role_id": 3, "name": "Head_Dept"},
        {"role_id": 4, "name": "Lecturer"},
        {"role_id": 5, "name": "Student"},
    ]
    
    async with AsyncSessionLocal() as db:
        try:
            # Check if roles already exist
            result = await db.execute(select(Role))
            existing_roles = result.scalars().all()
            
            if existing_roles:
                print(f"✅ Roles already exist ({len(existing_roles)} roles found)")
                for role in existing_roles:
                    print(f"   - {role.role_id}: {role.name}")
                return
            
            # Insert roles
            for role_data in roles_data:
                role = Role(**role_data)
                db.add(role)
            
            await db.commit()
            print("✅ Successfully inserted 5 roles:")
            for role_data in roles_data:
                print(f"   - {role_data['role_id']}: {role_data['name']}")
                
        except Exception as e:
            print(f"❌ Error inserting roles: {e}")
            await db.rollback()
            raise


if __name__ == "__main__":
    print("🚀 Initializing roles in database...")
    asyncio.run(init_roles())
    print("✨ Done!")
