from __future__ import annotations
from pydantic import BaseModel, Field
from typing import Optional, List, Literal

DuelMode = Literal["bestOf", "timePerQuestion", "firstToAll"]

# ---------- Create ----------
class CreateMatchRequest(BaseModel):
    curriculumId: str
    opponentId: Optional[str] = None
    bestOf: Optional[int] = Field(default=1, ge=1, le=9)  # 1,3,5,7,9
    objectiveId: Optional[str] = None
    difficulty: Optional[str] = None
    exerciseIds: Optional[List[str]] = None
    isPublic: bool = True

    # NUEVO: multijugador y modos
    maxPlayers: Optional[int] = Field(default=2, ge=2, le=8)
    mode: Optional[DuelMode] = "bestOf"
    questionTimeSec: Optional[int] = Field(default=None, ge=5, le=300)   # para timePerQuestion
    winTarget: Optional[int] = Field(default=None, ge=1, le=50)          # para firstToAll

class CreateMatchResponse(BaseModel):
    matchId: str
    shortCode: str

# ---------- Lobby ----------
class OpenMatch(BaseModel):
    matchId: str
    shortCode: str
    bestOf: int
    createdAt: str
    createdBy: Optional[str] = None
    maxPlayers: int

# ---------- Resolve code ----------
class ResolveResponse(BaseModel):
    matchId: str
