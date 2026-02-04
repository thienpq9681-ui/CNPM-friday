"""
Messages API Endpoints - Phase 3
"""

from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc

from app.api.deps import get_db, get_current_user
from app.models.all_models import Message, Channel, TeamMember, User
from app.schemas.message import MessageCreate, MessageUpdate, MessageResponse, MessageListResponse
from app.services.socket_manager import broadcast_message, broadcast_message_updated, broadcast_message_deleted

router = APIRouter()


@router.post("/", response_model=MessageResponse, status_code=201)
async def send_message(
    message_data: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Gửi tin nhắn mới vào channel.
    Chỉ team members mới có quyền gửi.
    """
    channel = await db.get(Channel, message_data.channel_id)
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
            detail="Bạn phải là thành viên của team mới có thể gửi tin nhắn"
        )

    new_message = Message(
        channel_id=message_data.channel_id,
        sender_id=current_user.user_id,
        content=message_data.content
    )
    db.add(new_message)
    await db.commit()
    await db.refresh(new_message)

    response = MessageResponse(
        message_id=new_message.message_id,
        channel_id=new_message.channel_id,
        sender_id=new_message.sender_id,
        sender_name=current_user.full_name,
        sender_avatar=current_user.avatar_url,
        content=new_message.content,
        sent_at=new_message.sent_at,
        is_edited=False,
        reply_to_id=message_data.reply_to_id
    )

    await broadcast_message(new_message.channel_id, response.model_dump())

    return response


@router.get("/", response_model=MessageListResponse)
async def list_messages(
    channel_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Lấy danh sách tin nhắn trong channel (có pagination).
    Sắp xếp theo thời gian mới nhất trước.
    """
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
            detail="Bạn không có quyền xem tin nhắn trong channel này"
        )

    count_result = await db.execute(
        select(func.count()).where(Message.channel_id == channel_id)
    )
    total = count_result.scalar() or 0

    result = await db.execute(
        select(Message)
        .where(Message.channel_id == channel_id)
        .order_by(desc(Message.sent_at))
        .offset(skip)
        .limit(limit + 1)
    )
    messages = result.scalars().all()

    has_more = len(messages) > limit
    if has_more:
        messages = messages[:limit]

    response_messages = []
    for msg in messages:
        sender = await db.get(User, msg.sender_id)
        response_messages.append(MessageResponse(
            message_id=msg.message_id,
            channel_id=msg.channel_id,
            sender_id=msg.sender_id,
            sender_name=sender.full_name if sender else "Unknown",
            sender_avatar=sender.avatar_url if sender else None,
            content=msg.content,
            sent_at=msg.sent_at,
            is_edited=False,
            reply_to_id=None
        ))

    response_messages.reverse()

    return MessageListResponse(
        messages=response_messages,
        total=total,
        has_more=has_more,
        skip=skip,
        limit=limit
    )


@router.get("/{message_id}", response_model=MessageResponse)
async def get_message(
    message_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Lấy chi tiết một tin nhắn."""
    message = await db.get(Message, message_id)
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tin nhắn không tồn tại"
        )

    sender = await db.get(User, message.sender_id)

    return MessageResponse(
        message_id=message.message_id,
        channel_id=message.channel_id,
        sender_id=message.sender_id,
        sender_name=sender.full_name if sender else "Unknown",
        sender_avatar=sender.avatar_url if sender else None,
        content=message.content,
        sent_at=message.sent_at,
        is_edited=False,
        reply_to_id=None
    )


@router.patch("/{message_id}", response_model=MessageResponse)
async def edit_message(
    message_id: int,
    update_data: MessageUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Sửa tin nhắn.
    Chỉ sender mới có quyền sửa.
    """
    message = await db.get(Message, message_id)
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tin nhắn không tồn tại"
        )

    if message.sender_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn chỉ có thể sửa tin nhắn của chính mình"
        )

    message.content = update_data.content
    await db.commit()
    await db.refresh(message)

    response = MessageResponse(
        message_id=message.message_id,
        channel_id=message.channel_id,
        sender_id=message.sender_id,
        sender_name=current_user.full_name,
        sender_avatar=current_user.avatar_url,
        content=message.content,
        sent_at=message.sent_at,
        is_edited=True,
        reply_to_id=None
    )

    await broadcast_message_updated(message.channel_id, response.model_dump())

    return response


@router.delete("/{message_id}", status_code=204)
async def delete_message(
    message_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Xóa tin nhắn.
    Sender hoặc team lead có quyền xóa.
    """
    message = await db.get(Message, message_id)
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tin nhắn không tồn tại"
        )

    if message.sender_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền xóa tin nhắn này"
        )

    channel_id = message.channel_id
    await db.delete(message)
    await db.commit()

    await broadcast_message_deleted(channel_id, message_id)

    return None
