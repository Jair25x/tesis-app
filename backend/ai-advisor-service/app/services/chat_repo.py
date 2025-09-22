# app/services/chat_repo.py  (nuevo)
from __future__ import annotations
import uuid
from sqlalchemy.orm import Session
from sqlalchemy import select, desc
from datetime import datetime, timezone
from app.models.chat import ChatConversation, ChatMessage
from pydantic import BaseModel

class ChatMessageIn(BaseModel):
    role: str
    text: str

class ChatRepo:
    def __init__(self, db: Session):
        self.db = db

    def create_conversation(self, student_id: str, curriculum_id: str | None, first_messages: list[ChatMessageIn] | None):
        conv_id = str(uuid.uuid4())
        conv = ChatConversation(id=conv_id, student_id=student_id, curriculum_id=curriculum_id)
        self.db.add(conv); self.db.flush()
        now = datetime.now(timezone.utc)
        for m in (first_messages or []):
            self.db.add(ChatMessage(conversation_id=conv_id, role=m.role, text=m.text, ts=now))
        self.db.commit(); self.db.refresh(conv)
        return conv

    def append_messages(self, conversation_id: str, messages: list[ChatMessageIn]):
        now = datetime.now(timezone.utc)
        for m in messages:
            self.db.add(ChatMessage(conversation_id=conversation_id, role=m.role, text=m.text, ts=now))
        self.db.commit()

    def get_latest_by_student_curriculum(self, student_id: str, curriculum_id: str | None):
        stmt = (
            select(ChatConversation)
            .where(ChatConversation.student_id == student_id)
            .where(ChatConversation.curriculum_id == curriculum_id)
            .order_by(desc(ChatConversation.created_at), desc(ChatConversation.updated_at))
            .limit(1)
        )
        conv = self.db.execute(stmt).scalars().first()
        if not conv:
            return None
        conv.messages  # eager load
        return conv
