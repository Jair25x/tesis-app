# app/schemas/chat.py
from __future__ import annotations
from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from app.schemas.recommendations import Citation  # reutilizamos tipo


class ChatRequest(BaseModel):
    # Pregunta del alumno en texto libre
    question: str = Field(min_length=1)

    # Datos opcionales para dar contexto
    studentId: Optional[UUID] = None
    objectiveId: Optional[UUID] = None   # si viene, usamos este objetivo para el filtro RAG
    grade: Optional[str] = None          # tolerante: "6", "6°", "6to"
    subject: Optional[str] = None        # tolerante: "math", "matemática", "lang", "comunicación"

    # Si true, devolvemos SSE (text/event-stream) en vez de JSON
    stream: bool = False


class ChatResponse(BaseModel):
    answer: str
    citations: list[Citation]
    tokens: dict  # {"prompt": int, "completion": int}
    model: str
