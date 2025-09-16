# app/services/clients/curriculum_client.py
from __future__ import annotations
from typing import Optional, Callable, Dict, List
import httpx

from app.core.settings import settings

class CurriculumClient:
    """
    Cliente S2S hacia curriculum-service.
    - Token S2S via s2s_token_provider()
    - Timeouts y 1 retry simple en errores transitorios
    """
    def __init__(
        self,
        base_url: Optional[str] = None,
        s2s_token_provider: Optional[Callable[[], str]] = None,
        timeout: float = 5.0,
    ):
        self.base_url = (base_url or settings.CURRICULUM_BASE_URL).rstrip("/")
        self.s2s_token_provider = s2s_token_provider
        self.timeout = timeout

    def _headers(self) -> Dict[str, str]:
        tok = self.s2s_token_provider() if self.s2s_token_provider else ""
        return {"Authorization": f"Bearer {tok}"} if tok else {}

    def _client(self) -> httpx.Client:
        # timeouts finos: connect/read
        return httpx.Client(timeout=httpx.Timeout(self.timeout, connect=2.0, read=self.timeout-2))

    def _get_json_with_retry(self, url: str, params: Dict[str, str] | None = None) -> Dict:
        params = params or {}
        data: Dict = {}
        with self._client() as c:
            for attempt in range(2):  # 1 retry
                try:
                    r = c.get(url, params=params, headers=self._headers())
                    r.raise_for_status()
                    data = r.json()
                    break
                except httpx.HTTPStatusError as e:
                    # 4xx no suele ayudar reintentar; 5xx sí
                    if 500 <= e.response.status_code < 600 and attempt == 0:
                        continue
                    raise
                except httpx.HTTPError:
                    if attempt == 0:
                        continue
                    raise
        return data or {}

    # -------- existentes --------

    def get_first_exercise(
        self, objective_id: str, difficulty: Optional[str] = None, random: bool = True
    ) -> Optional[Dict]:
        params = {"limit": "1", "active": "true", "random": "true" if random else "false"}
        if difficulty:
            params["difficulty"] = difficulty  # EASY|MEDIUM|HARD
        url = f"{self.base_url}/internal/objectives/{objective_id}/exercises"
        data = self._get_json_with_retry(url, params)
        items = data.get("items") or []
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
        url = f"{self.base_url}/internal/objectives/{objective_id}/exercises"
        data = self._get_json_with_retry(url, params)
        return data.get("items") or []

    def get_exercise_detail(self, exercise_id: str) -> Optional[Dict]:
        url = f"{self.base_url}/internal/curricula/exercises/{exercise_id}/detail"
        data = self._get_json_with_retry(url)
        if not data:
            return None
        # si detalle no existe, curriculum debería devolver 404; aquí devolvemos None si data vacío
        return data

    def get_objective_by_code(self, code: str) -> Optional[Dict]:
        url = f"{self.base_url}/internal/learning-objectives/lookup-by-code"
        data = self._get_json_with_retry(url, {"code": code})
        if not data:
            return None
        return data

    # -------- nuevo: siguiente objetivo --------

    def get_next_objective(self, grade: str, subject: str, after: Optional[str] = None) -> Dict:
        params: Dict[str, str] = {"grade": grade, "subject": subject}
        if after:
            params["after"] = after
        url = f"{self.base_url}/internal/objectives/next"
        return self._get_json_with_retry(url, params)
