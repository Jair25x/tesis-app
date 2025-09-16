from __future__ import annotations
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import declarative_base
from app.db.base import Base

class StudentLevelHistory(Base):
    __tablename__ = "student_level_history"

    id = Column(UUID(as_uuid=True), primary_key=True)
    student_id = Column(UUID(as_uuid=True), index=True, nullable=False)
    phase = Column(String(16), nullable=False)        # INITIAL|MID|FINAL
    snapshot_at = Column(DateTime(timezone=True), nullable=False)
    level = Column(Integer, nullable=False)           # 1..3
    probs = Column(JSONB, nullable=True)              # {"1":..,"2":..,"3":..}
    features = Column(JSONB, nullable=True)           # snapshot features
    model_version = Column(String(64), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False)
