# app/models.py
from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import String, Integer, Boolean, ForeignKey, TIMESTAMP, DateTime, func, text, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from uuid import uuid4


class Base(DeclarativeBase):
    pass


class Match(Base):
    __tablename__ = "matches"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    creator_id: Mapped[str] = mapped_column(UUID(as_uuid=False), index=True)
    opponent_id: Mapped[Optional[str]] = mapped_column(UUID(as_uuid=False), nullable=True, index=True)

    status: Mapped[str] = mapped_column(String(16), default="WAITING", index=True)  # WAITING|RUNNING|FINISHED
    curriculum_id: Mapped[str] = mapped_column(UUID(as_uuid=False), index=True)
    best_of: Mapped[int] = mapped_column(Integer, default=1, server_default=text("1"))

    # Objetivo y dificultad "global" (opcional)
    objective_id: Mapped[Optional[str]] = mapped_column(UUID(as_uuid=False), nullable=True)
    difficulty: Mapped[Optional[str]] = mapped_column(String(16), nullable=True)

    # Lobby / visibilidad
    short_code: Mapped[Optional[str]] = mapped_column(String(12), unique=True)
    is_public: Mapped[bool] = mapped_column(Boolean, default=True, server_default=text("true"))

    # Multijugador / modos
    max_players: Mapped[int] = mapped_column(Integer, default=2, server_default="2")
    mode: Mapped[str] = mapped_column(String(24), default="bestOf", server_default="bestOf")  # bestOf|timePerQuestion|firstToAll
    question_time_sec: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    win_target: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    # Preguntas por ronda (legacy/uniforme)
    questions_per_round: Mapped[int] = mapped_column(Integer, default=1, server_default="1")

    # Ganador (para W/L)
    winner_id: Mapped[Optional[str]] = mapped_column(UUID(as_uuid=False), nullable=True, index=True)

    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=text("now()"))
    finished_at: Mapped[Optional[datetime]] = mapped_column(TIMESTAMP(timezone=True), nullable=True)


class MatchPlayer(Base):
    __tablename__ = "match_players"

    match_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("matches.id", ondelete="CASCADE"),
        primary_key=True,
    )
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

    # Ahora coherente con la migración:
    exercise_id: Mapped[Optional[str]] = mapped_column(UUID(as_uuid=False), nullable=True)

    objective_id: Mapped[Optional[str]] = mapped_column(UUID(as_uuid=False), nullable=True)
    started_at: Mapped[Optional[datetime]] = mapped_column(TIMESTAMP(timezone=True), nullable=True)
    ended_at: Mapped[Optional[datetime]] = mapped_column(TIMESTAMP(timezone=True), nullable=True)


class RoundConfig(Base):
    """Config por ronda (cantidad de preguntas y dificultad)."""
    __tablename__ = "round_configs"

    match_id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True)
    n: Mapped[int] = mapped_column(Integer, primary_key=True)
    questions: Mapped[int] = mapped_column(Integer, default=1, server_default="1")
    difficulty: Mapped[Optional[str]] = mapped_column(String(16), nullable=True)

    __table_args__ = (
        Index("ix_round_configs_match_n", "match_id", "n"),
    )


class RoundPick(Base):
    """Picks exactos por sub-pregunta."""
    __tablename__ = "round_picks"

    match_id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True)
    n: Mapped[int] = mapped_column(Integer, primary_key=True)
    q_index: Mapped[int] = mapped_column(Integer, primary_key=True)
    exercise_id: Mapped[str] = mapped_column(UUID(as_uuid=False))

    __table_args__ = (
        Index("ix_round_picks_match_n_q", "match_id", "n", "q_index"),
    )


class Answer(Base):
    __tablename__ = "answers"

    match_id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True)
    n: Mapped[int] = mapped_column(Integer, primary_key=True)
    q_index: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    # ⬇️ AHORA texto (UUID en string); compatible con sub del JWT
    student_id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True)

    correct: Mapped[bool] = mapped_column(Boolean, default=False)
    time_ms: Mapped[int] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=text("now()"))

    # NUEVOS (opcionales)
    payload: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    raw_payload: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    exercise_id: Mapped[Optional[str]] = mapped_column(UUID(as_uuid=False), nullable=True)

    __table_args__ = (
        Index("ix_answers_match_n_q_student", "match_id", "n", "q_index", "student_id"),
        Index("ix_answers_match_student", "match_id", "student_id"),
    )


class DuelRating(Base):
    __tablename__ = "duel_ratings"

    user_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    rating: Mapped[int] = mapped_column(Integer, default=1000, server_default="1000")
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
