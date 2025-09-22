# app/services/clients/http_client.py
from __future__ import annotations

from typing import Any, Dict, Optional, Mapping, Callable
import httpx
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

# Errores transitorios típicos de httpx
_RETRY_EXC = (httpx.TransportError, httpx.ReadTimeout, httpx.WriteError, httpx.RemoteProtocolError, httpx.HTTPStatusError)

class HttpClient:
    """
    Cliente HTTP sencillo con:
      - base_url opcional
      - headers dinámicos via headers_provider()
      - timeouts razonables
      - reintentos exponenciales para 5xx/transport
    """
    def __init__(
        self,
        base_url: str | None = None,
        default_timeout: float = 3.0,
        retries: int = 3,
        headers_provider: Optional[Callable[[], Mapping[str, str]]] = None,
    ):
        self._timeout = default_timeout
        self._retries = retries
        self._client = httpx.Client(timeout=httpx.Timeout(self._timeout, connect=min(2.0, self._timeout)))
        self._base_url = (base_url or "").rstrip("/")
        self._headers_provider = headers_provider

    def close(self) -> None:
        try:
            self._client.close()
        except Exception:
            pass

    def _url(self, url_or_path: str) -> str:
        if self._base_url and not url_or_path.lower().startswith(("http://", "https://")):
            return f"{self._base_url}{url_or_path if url_or_path.startswith('/') else '/' + url_or_path}"
        return url_or_path

    def _headers(self, extra: Optional[Mapping[str, str]] = None) -> Dict[str, str]:
        base = {"Accept": "application/json"}
        if self._headers_provider:
            try:
                base.update(dict(self._headers_provider() or {}))
            except Exception:
                # no romper si provider falla
                pass
        if extra:
            base.update(dict(extra))
        return base

    @retry(
        reraise=True,
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=0.2, min=0.2, max=1.5),
        retry=retry_if_exception_type(_RETRY_EXC),
    )
    def get(self, url_or_path: str, *, params: Optional[Dict[str, Any]] = None, headers: Optional[Dict[str, str]] = None) -> httpx.Response:
        url = self._url(url_or_path)
        resp = self._client.get(url, params=params, headers=self._headers(headers))
        # reintento solo para 5xx
        if 500 <= resp.status_code < 600:
            resp.raise_for_status()
        resp.raise_for_status()
        return resp

    @retry(
        reraise=True,
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=0.2, min=0.2, max=1.5),
        retry=retry_if_exception_type(_RETRY_EXC),
    )
    def post(self, url_or_path: str, *, json: Any = None, headers: Optional[Dict[str, str]] = None) -> httpx.Response:
        url = self._url(url_or_path)
        merged = {"Content-Type": "application/json; charset=utf-8"}
        if headers:
            merged.update(headers)
        resp = self._client.post(url, json=json, headers=self._headers(merged))
        if 500 <= resp.status_code < 600:
            resp.raise_for_status()
        resp.raise_for_status()
        return resp

    # Helpers convenientes
    def get_json(self, url_or_path: str, *, params: Optional[Dict[str, Any]] = None, headers: Optional[Dict[str, str]] = None) -> Any:
        r = self.get(url_or_path, params=params, headers=headers)
        if not r.text:
            return None
        return r.json()

    def post_json(self, url_or_path: str, *, body: Any = None, headers: Optional[Dict[str, str]] = None) -> Any:
        r = self.post(url_or_path, json=body, headers=headers)
        if not r.text:
            return None
        return r.json()
