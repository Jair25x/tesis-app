# app/models/chat.py
from __future__ import annotations
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Text, DateTime, ForeignKey, BigInteger
from app.db.base import Base

class ChatConversation(Base):
    __tablename__ = "chat_conversations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    student_id: Mapped[str] = mapped_column(String(36), index=True)
    curriculum_id: Mapped[str | None] = mapped_column(String(36), index=True, nullable=True)
    created_at: Mapped[str | None] = mapped_column(DateTime(timezone=True), nullable=True)
    updated_at: Mapped[str | None] = mapped_column(DateTime(timezone=True), nullable=True)

    messages: Mapped[list["ChatMessage"]] = relationship(
        "ChatMessage",
        back_populates="conversation",
        cascade="all, delete-orphan",
        order_by="ChatMessage.id.asc()",
    )

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    conversation_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("chat_conversations.id", ondelete="CASCADE"), index=True
    )
    role: Mapped[str] = mapped_column(String(16))  # user|assistant|system
    text: Mapped[str] = mapped_column(Text)
    ts: Mapped[str | None] = mapped_column(DateTime(timezone=True))

    conversation: Mapped[ChatConversation] = relationship("ChatConversation", back_populates="messages")
