from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps
from app.models.all_models import Department, User
from app.schemas import user as user_schema

router = APIRouter()


@router.get("/me", response_model=user_schema.UserResponse, tags=["users"])
async def read_current_user(current_user: User = Depends(deps.get_current_user)) -> user_schema.UserResponse:
    """Return the currently authenticated user's profile."""
    return current_user


@router.get("/", response_model=List[user_schema.UserResponse], tags=["users"])
async def list_users(
    skip: int = 0,
    limit: int = 100,
    search: str | None = None,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> List[user_schema.UserResponse]:
    """List users (Admin/Head_Dept only)."""
    if current_user.role_id not in [1, 3]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins or heads of department can view users",
        )

    query = select(User)
    if search:
        pattern = f"%{search}%"
        query = query.where(or_(User.email.ilike(pattern), User.full_name.ilike(pattern)))

    result = await db.execute(query.offset(skip).limit(limit))
    return result.scalars().all()


@router.patch("/{user_id}/department", response_model=user_schema.UserResponse, tags=["users"])
async def assign_user_department(
    user_id: UUID,
    payload: user_schema.UserDeptUpdate,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> user_schema.UserResponse:
    """Admin assigns department to a user."""
    if current_user.role_id not in [1, 3]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins or heads of department can assign departments",
        )

    dept_result = await db.execute(select(Department).where(Department.dept_id == payload.dept_id))
    dept = dept_result.scalars().first()
    if not dept:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Department with id {payload.dept_id} not found",
        )

    result = await db.execute(select(User).where(User.user_id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user.dept_id = payload.dept_id
    await db.commit()
    await db.refresh(user)
    return user


@router.patch("/{user_id}/role", response_model=user_schema.UserResponse, tags=["users"])
async def assign_user_role(
    user_id: UUID,
    payload: user_schema.UserRoleUpdate,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> user_schema.UserResponse:
    """Admin or Head of Dept assigns role to a user."""
    if current_user.role_id not in [1, 3]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins or heads of department can assign roles",
        )

    result = await db.execute(select(User).where(User.user_id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user.role_id = payload.role_id
    await db.commit()
    await db.refresh(user)
    return user
