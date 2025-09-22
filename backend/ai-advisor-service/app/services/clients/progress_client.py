from __future__ import annotations
from typing import Any, Dict, Optional, Iterable, List

from app.core.settings import settings
from app.cache.redis_cache import cache_get_json, cache_set_json
from app.services.clients.http_client import HttpClient
from app.services.clients.s2s import mint_internal_jwt

TTL_SHORT = 60 * 3  # 3 min

class ProgressClient:
    """
    Cliente liviano al progress-service con caché y batch.
    """
    def __init__(self, base_url: Optional[str] = None, timeout: float = 5.0):
        self.base_url = (base_url or settings.PROGRESS_BASE_URL or "http://progress-service:8083").rstrip("/")
        self.http = HttpClient(
            base_url=self.base_url,
            default_timeout=timeout,
            headers_provider=lambda: {
                "Authorization": f"Bearer {mint_internal_jwt(['ROLE_INTERNAL'])}",
                "Content-Type": "application/json; charset=utf-8",
                "X-Internal-Call": "advisor",
            },
        )

    def get_student_overview(self, student_id: str) -> Dict[str, Any]:
        ck = f"progress:overview:{student_id}"
        c = cache_get_json(ck)
        if c is not None:
            return c
        data = self.http.get_json(f"/internal/progress/students/{student_id}/overview") or {}
        if data:
            cache_set_json(ck, data, TTL_SHORT)
        return data

    def get_objective_stats(self, student_id: str, objective_id: str) -> Dict[str, Any]:
        ck = f"progress:stats:{student_id}:{objective_id}"
        c = cache_get_json(ck)
        if c is not None:
            return c
        data = self.http.get_json(f"/internal/progress/students/{student_id}/objectives/{objective_id}/stats") or {}
        if data:
            cache_set_json(ck, data, TTL_SHORT)
        return data

    def get_objective_stats_batch(self, student_id: str, objective_ids: Iterable[str]) -> List[Dict[str, Any]]:
        ids = list(objective_ids or [])
        if not ids:
            return []
        miss: list[str] = []
        result: list[Dict[str, Any]] = []
        for oid in ids:
            ck = f"progress:stats:{student_id}:{oid}"
            c = cache_get_json(ck)
            if c is not None:
                result.append(c)
            else:
                miss.append(oid)
        if miss:
            data = self.http.post_json(
                f"/internal/progress/students/{student_id}/objectives/stats:batch",
                body={"objectiveIds": miss}
            ) or []
            for item in data:
                oid = str(item.get("objectiveId"))
                cache_set_json(f"progress:stats:{student_id}:{oid}", item, TTL_SHORT)
            result.extend(data)
        return result
