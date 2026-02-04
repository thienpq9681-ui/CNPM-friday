"""
Channels API Endpoints - Phase 3
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List

from app.api.deps import get_db, get_current_user
from app.models.all_models import Channel, TeamMember, User, Message
from app.schemas.channel import ChannelCreate, ChannelUpdate, ChannelResponse

router = APIRouter()


@router.post("/", response_model=ChannelResponse, status_code=201)
async def create_channel(
    channel_data: ChannelCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Tạo channel mới trong team.
    Chỉ team members mới có quyền tạo.
    """
    member_check = await db.execute(
        select(TeamMember).where(
            TeamMember.team_id == channel_data.team_id,
            TeamMember.user_id == current_user.user_id
        )
    )
    if not member_check.scalar():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn phải là thành viên của team mới có thể tạo channel"
        )

    new_channel = Channel(
        team_id=channel_data.team_id,
        name=channel_data.name,
        type=channel_data.type or "general"
    )
    db.add(new_channel)
    await db.commit()
    await db.refresh(new_channel)

    return ChannelResponse(
        channel_id=new_channel.channel_id,
        team_id=new_channel.team_id,
        name=new_channel.name,
        type=new_channel.type,
        created_at=new_channel.created_at,
        message_count=0
    )


@router.get("/", response_model=List[ChannelResponse])
async def list_channels(
    team_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Lấy danh sách tất cả channels trong team.
    Chỉ team members mới có quyền xem.
    """
    member_check = await db.execute(
        select(TeamMember).where(
            TeamMember.team_id == team_id,
            TeamMember.user_id == current_user.user_id
        )
    )
    if not member_check.scalar():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn phải là thành viên của team mới có thể xem channels"
        )

    result = await db.execute(
        select(Channel).where(Channel.team_id == team_id)
    )
    channels = result.scalars().all()

    response = []
    for channel in channels:
        msg_count = await db.execute(
            select(func.count()).where(Message.channel_id == channel.channel_id)
        )
        count = msg_count.scalar() or 0

        response.append(ChannelResponse(
            channel_id=channel.channel_id,
            team_id=channel.team_id,
            name=channel.name,
            type=channel.type,
            created_at=channel.created_at,
            message_count=count
        ))

    return response


@router.get("/{channel_id}", response_model=ChannelResponse)
async def get_channel(
    channel_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Lấy chi tiết channel."""
    channel = await db.get(Channel, channel_id)
    if not channel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Channel không tồn tại"
        )

    member_check = await db.execute(
        select(TeamMember).where(
            TeamMember.team_id == channel.team_id,
            TeamMember.user_id == current_user.user_id
        )
    )
    if not member_check.scalar():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền xem channel này"
        )

    msg_count = await db.execute(
        select(func.count()).where(Message.channel_id == channel_id)
    )
    count = msg_count.scalar() or 0

    return ChannelResponse(
        channel_id=channel.channel_id,
        team_id=channel.team_id,
        name=channel.name,
        type=channel.type,
        created_at=channel.created_at,
        message_count=count
    )


@router.put("/{channel_id}", response_model=ChannelResponse)
async def update_channel(
    channel_id: int,
    update_data: ChannelUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Cập nhật channel."""
    channel = await db.get(Channel, channel_id)
    if not channel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Channel không tồn tại"
        )

    if update_data.name is not None:
        channel.name = update_data.name
    if update_data.type is not None:
        channel.type = update_data.type

    await db.commit()
    await db.refresh(channel)

    return ChannelResponse(
        channel_id=channel.channel_id,
        team_id=channel.team_id,
        name=channel.name,
        type=channel.type,
        created_at=channel.created_at,
        message_count=0
    )


@router.delete("/{channel_id}", status_code=204)
async def delete_channel(
    channel_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Xóa channel.
    Cascade delete sẽ xóa tất cả messages trong channel.
    """
    channel = await db.get(Channel, channel_id)
    if not channel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Channel không tồn tại"
        )

    await db.delete(channel)
    await db.commit()
    return None
