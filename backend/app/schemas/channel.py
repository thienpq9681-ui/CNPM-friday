from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class ChannelCreate(BaseModel):
    team_id: int = Field(..., description="ID của team sở hữu channel")
    name: str = Field(..., min_length=1, max_length=100)
    type: Optional[str] = Field("general", description="Loại channel")


class ChannelUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    type: Optional[str] = None


class ChannelResponse(BaseModel):
    channel_id: int
    team_id: int
    name: Optional[str]
    type: Optional[str]
    created_at: datetime
    message_count: int = 0

    class Config:
        from_attributes = True
