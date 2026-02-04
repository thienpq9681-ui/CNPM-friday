from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class MessageCreate(BaseModel):
    channel_id: int = Field(..., description="ID của channel")
    content: str = Field(..., min_length=1, max_length=5000)
    reply_to_id: Optional[int] = None


class MessageUpdate(BaseModel):
    content: str = Field(..., min_length=1, max_length=5000)


class MessageResponse(BaseModel):
    message_id: int
    channel_id: int
    sender_id: UUID
    sender_name: Optional[str] = None
    sender_avatar: Optional[str] = None
    content: Optional[str]
    sent_at: datetime
    is_edited: bool = False
    reply_to_id: Optional[int] = None

    class Config:
        from_attributes = True


class MessageListResponse(BaseModel):
    messages: List[MessageResponse]
    total: int
    has_more: bool
    skip: int
    limit: int
