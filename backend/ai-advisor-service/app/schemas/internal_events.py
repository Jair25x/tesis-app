# app/schemas/internal_events.py
from __future__ import annotations

from typing import Any, Optional, Literal
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict


class AdvisorAttemptEvent(BaseModel):
    """
    Evento 'attempt' (1 POST por ítem). Campos en camelCase.
    Flexible:
      - answeredAt se acepta como str (lo parsea el router)
      - submissionItemId puede venir en el nivel raíz o dentro de metadata
      - difficulty opcional (BASIC|INTERMEDIATE|ADVANCED o EASY|MEDIUM|HARD)
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

    # Señales
    correct: Optional[bool] = Field(default=None, alias="correct")
    score: Optional[float] = Field(default=None, ge=0.0, le=1.0, alias="score")  # ya normalizado [0..1]
    points: Optional[int] = Field(default=None, ge=0, alias="points")
    maxPoints: Optional[int] = Field(default=None, ge=0, alias="maxPoints")

    # Tolerante (parseamos manualmente en el router)
    answeredAt: Optional[str] = Field(default=None, alias="answeredAt")

    gradingMode: Optional[str] = Field(default=None, alias="gradingMode")
    difficulty: Optional[str] = Field(default=None, alias="difficulty")

    # Idempotencia: puede venir en raíz o dentro de metadata
    submissionItemId: Optional[UUID] = Field(default=None, alias="submissionItemId")

    # Bolsa de extras (pistas usadas, timestamps crudos, etc.)
    metadata: dict[str, Any] = Field(default_factory=dict, alias="metadata")
