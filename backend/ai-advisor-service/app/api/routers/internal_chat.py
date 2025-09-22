# app/api/routers/internal_chat.py  (nuevo)
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.security.authz import require_internal
from app.schemas.chat_history import ConversationCreateDTO, ConversationOutDTO, MessagesAppendDTO
from app.services.chat_repo import ChatRepo
from app.observability.metrics import chat_conversations_created_total, chat_messages_ingested_total

router = APIRouter(prefix="/internal/chat", tags=["internal-chat"])

@router.post("/conversations", response_model=ConversationOutDTO, status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(require_internal("ROLE_INTERNAL"))])
def create_conversation(payload: ConversationCreateDTO, db: Session = Depends(get_db)):
    # Nota: como es INTERNAL, el caller debe pasar el student_id en headers? (No: aquí no lo pedimos)
    # Para INTERNAL es común que el gateway añada X-Act-As-User si hace falta. Mantén esto simple:
    # este endpoint está pensado para S2S "desde FE a través de gateway con Auth pública" → usa el público si prefieres.
    raise HTTPException(status_code=501, detail="Usa endpoint público para crear conversaciones.")

# Si quieres INTERNAL real, podemos implementar impersonación con X-Act-As-User; por ahora dejamos explícito 501.
