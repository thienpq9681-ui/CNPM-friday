"""Topic schemas for request/response validation."""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class TopicCreate(BaseModel):
    title: str
    description: Optional[str] = None
    requirements: Optional[str] = None

class TopicUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[str] = None

class EvaluationCreate(BaseModel):
    team_id: int
    project_id: int
    score: float
    feedback: Optional[str] = None
