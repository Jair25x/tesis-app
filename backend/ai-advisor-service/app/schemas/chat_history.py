# app/schemas/chat_history.py  (nuevo)
from __future__ import annotations
from pydantic import BaseModel
from typing import Optional, Literal, List
from datetime import datetime

Role = Literal["user", "assistant", "system"]

class ChatMessageDTO(BaseModel):
    role: Role
    text: str
    ts: Optional[datetime] = None

class ConversationCreateDTO(BaseModel):
    curriculum_id: Optional[str] = None
    first_messages: Optional[List[ChatMessageDTO]] = None

class ConversationOutDTO(BaseModel):
    id: str
    student_id: str
    curriculum_id: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class MessagesAppendDTO(BaseModel):
    messages: List[ChatMessageDTO]

class ConversationWithMessagesDTO(ConversationOutDTO):
    messages: List[ChatMessageDTO]
