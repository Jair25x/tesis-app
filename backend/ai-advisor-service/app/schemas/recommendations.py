# app/schemas/recommendations.py
from __future__ import annotations
from pydantic import BaseModel, Field
from typing import Literal, Optional
from uuid import UUID
from datetime import datetime


Subject = Literal["math", "lang"]  # amplía si necesitas


class Citation(BaseModel):
    docId: str
    title: Optional[str] = None
    url: Optional[str] = None


class RecommendationItem(BaseModel):
    # ✅ ahora opcional para soportar recos “genéricas” si haces A/B o cápsulas
    objectiveId: Optional[UUID] = None
    exerciseId: UUID
    # 🔹 NUEVO: título amigable para mostrar en UI
    title: Optional[str] = None

    score: float = Field(ge=0.0, le=1.0)
    confidence: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    reason: Optional[str] = None
    source: Literal["RF", "RF+RAG", "HEURISTIC"]
    difficulty: Optional[Literal["EASY", "MEDIUM", "HARD"]] = None
    # ✅ evita lista compartida
    citations: list[Citation] = Field(default_factory=list)


class RecommendationsResponse(BaseModel):
    generatedAt: datetime
    items: list[RecommendationItem]
