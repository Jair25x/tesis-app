# app/models/events.py  (reemplaza: estaba vacío)
from __future__ import annotations
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import DateTime, JSON, Integer, Numeric, String
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from app.db.base import Base

class AdvisorEvent(Base):
    __tablename__ = "advisor_events"
    id: Mapped[str] = mapped_column(PGUUID(as_uuid=True), primary_key=True)
    submission_item_id: Mapped[str] = mapped_column(PGUUID(as_uuid=True), unique=True, index=True)
    payload: Mapped[dict] = mapped_column(JSON, nullable=False)
    received_at: Mapped[str | None] = mapped_column(DateTime(timezone=True))

class StudentObjectiveStats(Base):
    __tablename__ = "student_objective_stats"
    student_id: Mapped[str] = mapped_column(PGUUID(as_uuid=True), primary_key=True)
    objective_id: Mapped[str] = mapped_column(PGUUID(as_uuid=True), primary_key=True)
    attempts: Mapped[int] = mapped_column(Integer, nullable=False)
    corrects: Mapped[int] = mapped_column(Integer, nullable=False)
    avg_score: Mapped[float | None] = mapped_column(Numeric(5, 2))
    last_attempt_at: Mapped[str | None] = mapped_column(DateTime(timezone=True))
    streak: Mapped[int] = mapped_column(Integer, nullable=False)

    attempts_easy: Mapped[int | None] = mapped_column(Integer)
    attempts_medium: Mapped[int | None] = mapped_column(Integer)
    attempts_hard: Mapped[int | None] = mapped_column(Integer)
    corrects_easy: Mapped[int | None] = mapped_column(Integer)
    corrects_medium: Mapped[int | None] = mapped_column(Integer)
    corrects_hard: Mapped[int | None] = mapped_column(Integer)
