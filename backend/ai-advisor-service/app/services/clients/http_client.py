# app/services/clients/http_client.py
from __future__ import annotations

from typing import Any, Dict, Optional
import httpx
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type


class HttpClient:
    def __init__(self, default_timeout: float = 3.0, retries: int = 3):
        self._timeout = default_timeout
        self._retries = retries
        self._client = httpx.Client(timeout=default_timeout)

    def close(self) -> None:
        try:
            self._client.close()
        except Exception:
            pass

    @retry(
        reraise=True,
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=0.2, min=0.2, max=1.5),
        retry=retry_if_exception_type((httpx.TransportError, httpx.HTTPStatusError)),
    )
    def get(self, url: str, *, params: Optional[Dict[str, Any]] = None, headers: Optional[Dict[str, str]] = None) -> httpx.Response:
        resp = self._client.get(url, params=params, headers=headers)
        resp.raise_for_status()
        return resp

    @retry(
        reraise=True,
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=0.2, min=0.2, max=1.5),
        retry=retry_if_exception_type((httpx.TransportError, httpx.HTTPStatusError)),
    )
    def post(self, url: str, *, json: Any = None, headers: Optional[Dict[str, str]] = None) -> httpx.Response:
        resp = self._client.post(url, json=json, headers=headers)
        resp.raise_for_status()
        return resp
