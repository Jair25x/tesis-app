# app/schemas/internal_events.py
from __future__ import annotations

from typing import Any, Optional, Literal
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict, field_validator


def _norm_diff(d: Optional[str]) -> Optional[str]:
    if not d:
        return None
    x = str(d).strip().upper()
    if x in {"EASY", "MEDIUM", "HARD"}:
        return x
    # Acepta enums internos del curriculum
    if x == "BASIC":
        return "EASY"
    if x == "INTERMEDIATE":
        return "MEDIUM"
    if x == "ADVANCED":
        return "HARD"
    # Alias “amistosos”
    if x in {"E", "EASY_PEASY"}:
        return "EASY"
    if x in {"M", "MID", "NORMAL"}:
        return "MEDIUM"
    if x in {"H", "HARDCORE", "DIFICIL", "DIFÍCIL"}:
        return "HARD"
    return None


class AdvisorAttemptEvent(BaseModel):
    """
    Evento 'attempt' (1 POST por ítem). Campos en camelCase.
    Tolerante:
      - answeredAt se acepta como str (lo parsea el router)
      - submissionItemId puede venir en raíz o dentro de metadata
      - difficulty admite EASY/MEDIUM/HARD y BASIC/INTERMEDIATE/ADVANCED
      - score: preferimos [0..1]; si no llega, podemos usar normalizedScore o derivar de awarded/max
    """
    model_config = ConfigDict(extra="ignore", populate_by_name=True)

    # Fuente
    source: Literal["ASSESSMENT"] = Field(default="ASSESSMENT", alias="source")

    # Identidad mínima
    studentId: UUID = Field(alias="studentId")

    # Contexto
    curriculumId: Optional[UUID] = Field(default=None, alias="curriculumId")
    exerciseId: Optional[UUID] = Field(default=None, alias="exerciseId")
    objectiveId: Optional[UUID] = Field(default=None, alias="objectiveId")
    assignmentId: Optional[UUID] = Field(default=None, alias="assignmentId")
    classroomId: Optional[UUID] = Field(default=None, alias="classroomId")

    # Señales (ver validadores)
    correct: Optional[bool] = Field(default=None, alias="correct")
    score: Optional[float] = Field(default=None, alias="score")  # 0..1 (preferido)
    normalizedScore: Optional[float] = Field(default=None, alias="normalizedScore")
    awardedPoints: Optional[int] = Field(default=None, ge=0, alias="awardedPoints")
    maxPoints: Optional[int] = Field(default=None, ge=0, alias="maxPoints")

    # Tolerante (parseamos en el router)
    answeredAt: Optional[str] = Field(default=None, alias="answeredAt")

    gradingMode: Optional[str] = Field(default=None, alias="gradingMode")
    difficulty: Optional[str] = Field(default=None, alias="difficulty")

    # Idempotencia: puede venir en raíz o en metadata
    submissionItemId: Optional[UUID] = Field(default=None, alias="submissionItemId")

    # Bolsa de extras
    metadata: dict[str, Any] = Field(default_factory=dict, alias="metadata")

    @field_validator("difficulty", mode="before")
    @classmethod
    def _coerce_diff(cls, v):
        return _norm_diff(v)

    @field_validator("score", mode="after")
    @classmethod
    def _prefer_score_sources(cls, v, info):
        if v is not None:
            # clamp y 3 decimales
            v = max(0.0, min(1.0, float(v)))
            return round(v, 3)
        data = info.data
        ns = data.get("normalizedScore")
        if ns is not None:
            ns = max(0.0, min(1.0, float(ns)))
            return round(ns, 3)
        ap = data.get("awardedPoints")
        mp = data.get("maxPoints")
        if isinstance(ap, int) and isinstance(mp, int) and mp > 0:
            ratio = ap / mp
            ratio = max(0.0, min(1.0, ratio))
            return round(ratio, 3)
        return None
