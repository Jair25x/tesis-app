# app/schemas/common.py
from pydantic import BaseModel, Field
from typing import Optional

class Paginated(BaseModel):
    total: int = Field(0, ge=0)
    limit: int = Field(10, ge=1, le=100)
    offset: int = Field(0, ge=0)

class IdModel(BaseModel):
    id: str

class Message(BaseModel):
    detail: str
    code: Optional[str] = None
