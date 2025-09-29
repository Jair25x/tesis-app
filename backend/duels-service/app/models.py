from __future__ import annotations
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import String, Integer, Boolean, ForeignKey, TIMESTAMP, DateTime, func, text
from sqlalchemy.dialects.postgresql import UUID
from uuid import uuid4
from datetime import datetime
from typing import Optional

class Base(DeclarativeBase):
    pass

class Match(Base):
    __tablename__ = "matches"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    creator_id: Mapped[str] = mapped_column(UUID(as_uuid=False), index=True)
    opponent_id: Mapped[Optional[str]] = mapped_column(UUID(as_uuid=False), nullable=True, index=True)

    status: Mapped[str] = mapped_column(String(16), default="WAITING", index=True)  # WAITING|RUNNING|FINISHED
    curriculum_id: Mapped[str] = mapped_column(UUID(as_uuid=False), index=True)
    best_of: Mapped[int] = mapped_column(Integer, default=3)

    # Lobby / visibilidad
    short_code: Mapped[Optional[str]] = mapped_column(String(12), unique=True)
    is_public: Mapped[bool] = mapped_column(Boolean, default=True, server_default=text("true"))

    # Multijugador / modos
    max_players: Mapped[int] = mapped_column(Integer, default=2, server_default="2")
    mode: Mapped[str] = mapped_column(String(24), default="bestOf", server_default="bestOf")  # bestOf|timePerQuestion|firstToAll
    question_time_sec: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    win_target: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)  # para firstToAll

    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=text("now()"))

class MatchPlayer(Base):
    __tablename__ = "match_players"

    match_id: Mapped[str] = mapped_column(String(36), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True)
    joined_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=text("now()"))

class Round(Base):
    __tablename__ = "rounds"

    match_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("matches.id", ondelete="CASCADE"),
        primary_key=True
    )
    n: Mapped[int] = mapped_column(Integer, primary_key=True)
    exercise_id: Mapped[str] = mapped_column(UUID(as_uuid=False))
    objective_id: Mapped[Optional[str]] = mapped_column(UUID(as_uuid=False), nullable=True)
    started_at: Mapped[Optional[datetime]] = mapped_column(TIMESTAMP(timezone=True), nullable=True)
    ended_at: Mapped[Optional[datetime]] = mapped_column(TIMESTAMP(timezone=True), nullable=True)

class Answer(Base):
    __tablename__ = "answers"

    match_id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True)
    n: Mapped[int] = mapped_column(Integer, primary_key=True)
    student_id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, index=True)

    correct: Mapped[bool] = mapped_column(Boolean, default=False)
    time_ms: Mapped[int] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=text("now()"))

class DuelRating(Base):
    __tablename__ = "duel_ratings"

    user_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    rating: Mapped[int] = mapped_column(Integer, default=1000, server_default="1000")
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
