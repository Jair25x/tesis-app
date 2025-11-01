from __future__ import annotations
from typing import Optional, List, Literal, Dict, Set
from pydantic import BaseModel, Field, model_validator

# ===== Tipos base =====
DuelMode = Literal["bestOf", "timePerQuestion", "firstToAll"]
Difficulty = Literal["EASY", "MEDIUM", "HARD"]

# ===== Config avanzado por ronda (opcional) =====
class RoundConfig(BaseModel):
    roundNo: int = Field(ge=1, description="Número de la ronda (1..N)")
    questions: int = Field(ge=1, le=10, description="Preguntas en la ronda (1..10)")
    difficulty: Optional[Difficulty] = Field(default=None, description="Dificultad para esta ronda")

class RoundPick(BaseModel):
    round: int = Field(ge=1)
    qIndex: int = Field(ge=1)
    exerciseId: str

# ===== (Legacy opcional) para clientes antiguos =====
class RoundPlan(BaseModel):
    questions: int = Field(ge=1, le=10)
    difficulty: Optional[Difficulty] = None
    exerciseIds: Optional[List[str]] = None

class CreateMatchRequest(BaseModel):
    curriculumId: str
    opponentId: Optional[str] = None

    # Modo simple (uniforme)
    bestOf: Optional[int] = Field(default=1, ge=1, le=9)  # 1,3,5,7,9
    objectiveId: Optional[str] = None
    difficulty: Optional[Difficulty] = None
    exerciseIds: Optional[List[str]] = None
    questionsPerRound: Optional[int] = Field(default=1, ge=1, le=10)

    # Visibilidad
    isPublic: bool = True

    # Multijugador / modos
    maxPlayers: Optional[int] = Field(default=2, ge=2, le=8)
    mode: Optional[DuelMode] = "bestOf"
    questionTimeSec: Optional[int] = Field(default=None, ge=5, le=300)   # para timePerQuestion
    winTarget: Optional[int] = Field(default=None, ge=1, le=50)          # para firstToAll

    # Modo avanzado (plan por ronda) — nuevo
    roundConfigs: Optional[List[RoundConfig]] = None
    roundPicks: Optional[List[RoundPick]] = None

    # (Legacy) rounds por ronda
    rounds: Optional[List[RoundPlan]] = None

    @model_validator(mode="after")
    def _validate_and_normalize(self) -> "CreateMatchRequest":
        has_objective = bool(self.objectiveId)
        has_ex_ids = bool(self.exerciseIds and len(self.exerciseIds) > 0)
        has_cfgs = bool(self.roundConfigs and len(self.roundConfigs) > 0)
        has_picks = bool(self.roundPicks and len(self.roundPicks) > 0)
        has_legacy_rounds = bool(self.rounds and len(self.rounds) > 0)

        if not (has_objective or has_ex_ids or has_cfgs or has_picks or has_legacy_rounds):
            raise ValueError("Provide at least one of: objectiveId, exerciseIds[], roundConfigs[], roundPicks[] or rounds[]")

        # --- Reglas de modo ---
        mode = self.mode or "bestOf"

        if mode == "timePerQuestion":
            if self.questionTimeSec is None:
                raise ValueError("questionTimeSec is required in timePerQuestion mode")
            # winTarget no aplica aquí
            self.winTarget = None
        elif mode == "firstToAll":
            if self.winTarget is None or self.winTarget < 1:
                raise ValueError("winTarget >= 1 is required in firstToAll mode")
            # questionTimeSec opcionalmente ignorado (no aplica)
            self.questionTimeSec = None
        else:
            # bestOf por defecto: limpiar parámetros de otros modos
            self.questionTimeSec = None
            self.winTarget = None

        # --- Plan avanzado por ronda ---
        if has_cfgs:
            # bestOf debe coincidir con # de roundConfigs
            if self.bestOf is not None and self.bestOf != len(self.roundConfigs or []):
                raise ValueError("bestOf debe coincidir con la cantidad de roundConfigs definidos")
            self.bestOf = len(self.roundConfigs or [])

            # Si hay roundPicks, deben caer en rango (round, qIndex)
            if has_picks:
                q_by_round: Dict[int, int] = {rc.roundNo: rc.questions for rc in (self.roundConfigs or [])}
                max_round = len(self.roundConfigs or [])
                for pick in self.roundPicks or []:
                    if pick.round < 1 or pick.round > max_round:
                        raise ValueError(f"roundPicks: round={pick.round} fuera de rango (1..{max_round})")
                    qmax = q_by_round.get(pick.round, 0)
                    if pick.qIndex < 1 or pick.qIndex > qmax:
                        raise ValueError(f"roundPicks: qIndex={pick.qIndex} fuera de rango para round={pick.round} (1..{qmax})")

        # --- Modo uniforme (legacy sin roundConfigs) ---
        if not has_cfgs:
            qpr = self.questionsPerRound or 1
            if qpr < 1 or qpr > 10:
                raise ValueError("questionsPerRound fuera de rango (1..10)")

            # Reglas de picks en uniforme:
            # a) exerciseIds a nivel request ⇒ difficulty ignorada + questionsPerRound = len(exerciseIds)
            if has_ex_ids:
                # normalizar: difficulty no aplica cuando hay picks exactos
                self.difficulty = None
                self.questionsPerRound = max(1, min(10, len(self.exerciseIds or [])))

            # b) rounds (legacy) ⇒ por cada round: si hay exerciseIds ⇒ questions=len(picks), difficulty=None
            if has_legacy_rounds:
                normalized: List[RoundPlan] = []
                for r in self.rounds or []:
                    picks = r.exerciseIds or []
                    if len(picks) > 0:
                        normalized.append(
                            RoundPlan(
                                questions=max(1, min(10, len(picks))),
                                difficulty=None,
                                exerciseIds=picks
                            )
                        )
                    else:
                        normalized.append(r)
                self.rounds = normalized

        return self

class CreateMatchResponse(BaseModel):
    matchId: str
    shortCode: str

class OpenMatch(BaseModel):
    matchId: str
    shortCode: str
    bestOf: int
    createdAt: str
    createdBy: Optional[str] = None
    maxPlayers: int

class ResolveResponse(BaseModel):
    matchId: str

class DuelSummaryResponse(BaseModel):
    played: int
    wins: int
    losses: int
    rating: int
    lastPlayedAt: Optional[str] = None

class DuelHistoryItem(BaseModel):
    matchId: str
    bestOf: int
    winnerId: Optional[str] = None
    finishedAt: Optional[str] = None
    shortCode: Optional[str] = None

class ObjectiveAvailabilityResp(BaseModel):
    objectiveId: str = Field(..., description="UUID del OA")
    difficulty: Optional[Difficulty] = Field(None, description="Dificultad filtrada (si aplica)")
    available: int = Field(..., ge=0, description="Número de ejercicios activos elegibles")
    minRequired: int = Field(1, ge=1, description="Mínimo de preguntas permitido")
    maxAllowed: int = Field(10, ge=1, description="Máximo de preguntas permitido")
    source: Literal["server", "sample"] = Field(
        "server",
        description="server = conteo exacto/preciso · sample = estimado por muestreo"
    )
