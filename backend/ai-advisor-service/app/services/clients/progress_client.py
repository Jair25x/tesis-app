# app/services/clients/progress_client.py
from __future__ import annotations
from typing import Callable, Iterable, List, Optional
import httpx


class ProgressClient:
    """
    Cliente interno (S2S) hacia progress-service.
    Usa cabeceras X-Internal-* + JWT S2S (INTERNAL, ROLE_INTERNAL).
    """

    def __init__(
        self,
        *,
        base_url: str,
        s2s_token_provider: Optional[Callable[[], str]] = None,
        timeout: float = 5.0,
    ) -> None:
        self.base_url = base_url.rstrip("/")
        self._s2s = s2s_token_provider
        self._client = httpx.Client(timeout=timeout)

    # ---------------- headers S2S ----------------
    def _headers(self) -> dict:
        """
        - X-Internal-Call: para fast-path interno
        - X-Auth-Username / X-Auth-Roles: por compatibilidad
        - Authorization: Bearer <jwt S2S> firmado con S2S_JWT_SECRET
        """
        h = {
            "X-Internal-Call": "ai-advisor-service",
            "X-Auth-Username": "ai-advisor-service",
            "X-Auth-Roles": "ROLE_INTERNAL,INTERNAL",
        }
        if self._s2s:
            try:
                tok = self._s2s()
                if tok:
                    h["Authorization"] = f"Bearer {tok}"
            except Exception:
                # No bloquees si no se pudo firmar; el Progress también acepta X-Internal-*
                pass
        return h

    # ---------------- endpoints usados por el recomendador ----------------
    def get_objective_stats_batch(
        self,
        student_id: str,
        objective_ids: Iterable[str],
    ) -> List[dict]:
        """
        POST /internal/progress/students/{studentId}/objectives/stats:batch
        body: { "objectiveIds": [ "uuid", ... ] }
        return: [ { objectiveId, status, solvedDistinct, attempts7d, correct7d, winRate7d, lastAttemptAt }, ... ]
        """
        ids = [str(x) for x in (objective_ids or [])]
        if not ids:
            return []

        url = f"{self.base_url}/internal/progress/students/{student_id}/objectives/stats:batch"
        resp = self._client.post(url, json={"objectiveIds": ids}, headers=self._headers())
        resp.raise_for_status()
        data = resp.json()
        return data if isinstance(data, list) else []

    def get_objective_stats(
        self, student_id: str, objective_id: str
    ) -> Optional[dict]:
        """
        GET /internal/progress/students/{studentId}/objectives/{objectiveId}/stats
        """
        url = f"{self.base_url}/internal/progress/students/{student_id}/objectives/{objective_id}/stats"
        resp = self._client.get(url, headers=self._headers())
        resp.raise_for_status()
        return resp.json()  # dict
