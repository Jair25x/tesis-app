# app/schemas/reco_events.py
from __future__ import annotations
from typing import Optional, Literal
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field

RecoEventType = Literal["OPEN", "DISMISS", "HOVER"]
RecoDifficulty = Literal["EASY", "MEDIUM", "HARD"]

class RecoEventIn(BaseModel):
    event: RecoEventType
    exerciseId: UUID
    objectiveId: Optional[UUID] = None
    sourceRefId: Optional[str] = None
    ts: Optional[datetime] = None
    difficulty: Optional[RecoDifficulty] = Field(
        default=None, description="Si el FE la conoce, simplifica el enrich en BE"
    )
