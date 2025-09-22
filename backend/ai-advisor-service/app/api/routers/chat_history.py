# app/api/routers/chat_history.py
from __future__ import annotations
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.api.deps import get_db
from app.security.authz import require_public_roles, AuthContext
from app.schemas.chat_history import (
    ConversationCreateDTO,
    ConversationOutDTO,
    MessagesAppendDTO,
    ConversationWithMessagesDTO,
    ChatMessageDTO,
)
from app.services.chat_repo import ChatRepo
from app.core.settings import settings
from app.models.chat import ChatConversation

router = APIRouter(prefix="/api/ai/chat", tags=["chat-history"])

def _ensure_enabled():
    if not getattr(settings, "CHAT_PERSISTENCE_ENABLED", True):
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Chat persistence disabled")

@router.post("/conversations", response_model=ConversationOutDTO, status_code=status.HTTP_201_CREATED)
def create_conversation(
    payload: ConversationCreateDTO,
    db: Session = Depends(get_db),
    ctx: AuthContext = Depends(require_public_roles("ROLE_STUDENT")),
):
    _ensure_enabled()
    conv = ChatRepo(db).create_conversation(ctx.principal, payload.curriculum_id, payload.first_messages or [])
    return ConversationOutDTO(
        id=conv.id,
        student_id=conv.student_id,
        curriculum_id=conv.curriculum_id,
        created_at=conv.created_at,
        updated_at=conv.updated_at,
    )

@router.post("/conversations/{conversation_id}/events", status_code=status.HTTP_204_NO_CONTENT)
def append_events(
    conversation_id: str,
    payload: MessagesAppendDTO,
    db: Session = Depends(get_db),
    ctx: AuthContext = Depends(require_public_roles("ROLE_STUDENT")),
):
    _ensure_enabled()
    # Validar propiedad (evitar que un alumno escriba en la conversación de otro)
    owner = db.execute(
        select(ChatConversation.student_id).where(ChatConversation.id == conversation_id)
    ).scalar_one_or_none()
    if not owner:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
    if owner != ctx.principal:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    ChatRepo(db).append_messages(conversation_id, payload.messages or [])
    return

@router.get("/conversations/latest", response_model=ConversationWithMessagesDTO)
def get_latest(
    curriculum_id: str | None = None,
    db: Session = Depends(get_db),
    ctx: AuthContext = Depends(require_public_roles("ROLE_STUDENT")),
):
    _ensure_enabled()
    conv = ChatRepo(db).get_latest_by_student_curriculum(ctx.principal, curriculum_id)
    if not conv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No hay conversación previa")
    return ConversationWithMessagesDTO(
        id=conv.id,
        student_id=conv.student_id,
        curriculum_id=conv.curriculum_id,
        created_at=conv.created_at,
        updated_at=conv.updated_at,
        messages=[ChatMessageDTO(role=m.role, text=m.text, ts=m.ts) for m in conv.messages],
    )
