# app/services/clients/progress_client.py
from __future__ import annotations
from typing import Any, Dict, Optional
import os
import httpx
from app.services.clients.s2s import mint_s2s_jwt

class ProgressClient:
    """
    Cliente liviano al progress-service. No usado aún por el Advisor actual,
    pero listo para futuras features (features ML, panel “por qué” rico, etc.)
    """
    def __init__(self, base_url: Optional[str] = None, timeout: float = 3.0):
        self.base_url = base_url or os.getenv("PROGRESS_BASE_URL", "http://progress-service:8083")
        self.timeout = timeout

    def _headers(self) -> Dict[str, str]:
        return {
            "Authorization": f"Bearer {mint_s2s_jwt(['INTERNAL','ROLE_INTERNAL'])}",
            "Content-Type": "application/json; charset=utf-8",
            "X-Internal-Call": "advisor",
        }

    def get_student_overview(self, student_id: str) -> Dict[str, Any]:
        url = f"{self.base_url}/internal/students/{student_id}/overview"
        try:
            with httpx.Client(timeout=self.timeout) as client:
                r = client.get(url, headers=self._headers())
            r.raise_for_status()
            return r.json()
        except Exception:
            return {}

    def get_objective_stats(self, student_id: str, objective_id: str) -> Dict[str, Any]:
        url = f"{self.base_url}/internal/students/{student_id}/objectives/{objective_id}/stats"
        try:
            with httpx.Client(timeout=self.timeout) as client:
                r = client.get(url, headers=self._headers())
            r.raise_for_status()
            return r.json()
        except Exception:
            return {}
