# app/services/clients/curriculum_client.py
from __future__ import annotations

from typing import Optional, Callable, Dict, List, Any, Iterable
from uuid import UUID

from app.core.settings import settings
from app.cache.redis_cache import cache_get_json, cache_set_json
from app.services.clients.http_client import HttpClient
from app.services.clients.s2s import mint_internal_jwt

TTL_OBJMETA_SECONDS = 60 * 60 * 12  # 12h


class CurriculumClient:
    """
    Cliente S2S hacia curriculum-service.
    - Token S2S via s2s_token_provider()
    - Timeouts y reintentos (HttpClient)
    - Caché Redis para metadatos de objetivos
    """

    def __init__(
        self,
        base_url: Optional[str] = None,
        s2s_token_provider: Optional[Callable[[], str]] = None,
        timeout: float = 5.0,
    ):
        self.base_url = (base_url or settings.CURRICULUM_BASE_URL).rstrip("/")
        self._s2s = s2s_token_provider or (lambda: mint_internal_jwt())
        self.http = HttpClient(
            base_url=self.base_url,
            default_timeout=timeout,
            headers_provider=lambda: {
                "Authorization": f"Bearer {self._s2s()}",
                "X-Internal-Call": "advisor",
                "X-Auth-Roles": "ROLE_INTERNAL",
                "X-Auth-Username": "ai-advisor",
            },
        )

    # -------- NUEVO: objetivos "semilla" para cold start --------
    def get_starter_objectives(
        self,
        subject: str,
        limit: int = 10,
    ) -> List[UUID]:
        """
        Devuelve una lista de IDs de objetivos "semilla" para recomendación en frío.

        Para tu tesis actual asumimos:
        - Grado fijo "4" (solo estás trabajando Matemática de 4.º de primaria).
        - subject se deja para futuro (por ahora puede ignorarse en el backend).
        """
        safe_limit = max(1, min(limit, 50))

        params = {
            "grade": "4",  # 🔹 para ahora, fijo a 4.º grado
            "subject": subject or "math",
            "limit": str(safe_limit),
        }

        # El endpoint puede devolver:
        # - ["uuid1", "uuid2", ...]
        # - o [{"id": "uuid1"}, ...]
        data = self.http.get_json("/internal/objectives/starter", params=params) or []

        result: List[UUID] = []
        for item in data:
            if isinstance(item, dict):
                raw = item.get("id") or item.get("objectiveId")
            else:
                raw = str(item)
            if not raw:
                continue
            try:
                result.append(UUID(str(raw)))
            except Exception:
                continue
        return result

    # -------- NUEVO: obj meta + lookup --------
    def get_objective_meta(self, objective_id: str) -> Dict[str, Any] | None:
        ck = f"objmeta:{objective_id}"
        c = cache_get_json(ck)
        if c is not None:
            return c
        data = self.http.get_json(f"/internal/objectives/{objective_id}")
        if data:
            cache_set_json(ck, data, TTL_OBJMETA_SECONDS)
        return data or None

    def lookup_objectives_batch(self, ids: Iterable[str]) -> List[Dict[str, Any]]:
        ids = list(ids or [])
        if not ids:
            return []
        result: List[Dict[str, Any]] = []
        miss: List[str] = []
        for oid in ids:
            ck = f"objmeta:{oid}"
            c = cache_get_json(ck)
            if c is not None:
                result.append(c)
            else:
                miss.append(oid)
        if miss:
            data = self.http.post_json("/internal/objectives/lookup", body={"ids": miss})
            for item in (data or []):
                oid = str(item.get("id"))
                cache_set_json(f"objmeta:{oid}", item, TTL_OBJMETA_SECONDS)
            result.extend(data or [])
        return result

    # -------- existentes --------
    def get_first_exercise(
        self,
        objective_id: str,
        difficulty: Optional[str] = None,
        random: bool = True,
    ) -> Optional[Dict]:
        params = {
            "limit": "1",
            "active": "true",
            "random": "true" if random else "false",
        }
        if difficulty:
            params["difficulty"] = difficulty  # EASY|MEDIUM|HARD
        data = self.http.get_json(
            f"/internal/objectives/{objective_id}/exercises", params=params
        )
        items = (data or {}).get("items") or []
        return items[0] if items else None

    def get_exercises_for_objective(
        self,
        objective_id: str,
        limit: int = 20,
        active: bool = True,
        difficulty: Optional[str] = None,
        random: bool = True,
        order: str = "desc",
    ) -> List[Dict]:
        params = {
            "limit": str(max(1, min(limit, 100))),
            "active": "true" if active else "false",
            "random": "true" if random else "false",
            "order": order,
        }
        if difficulty:
            params["difficulty"] = difficulty
        data = self.http.get_json(
            f"/internal/objectives/{objective_id}/exercises", params=params
        )
        return (data or {}).get("items") or []

    def get_exercise_detail(self, exercise_id: str) -> Optional[Dict]:
        data = self.http.get_json(f"/internal/curricula/exercises/{exercise_id}/detail")
        return data or None

    def get_objective_by_code(self, code: str) -> Optional[Dict]:
        data = self.http.get_json(
            f"/internal/learning-objectives/lookup-by-code", params={"code": code}
        )
        return data or None

    def get_next_objective(
        self,
        grade: str,
        subject: str,
        after: Optional[str] = None,
    ) -> Dict:
        params: Dict[str, str] = {"grade": grade, "subject": subject}
        if after:
            params["after"] = after
        return self.http.get_json("/internal/objectives/next", params=params) or {}
