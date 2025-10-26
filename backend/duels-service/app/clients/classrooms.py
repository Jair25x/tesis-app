# app/clients/classrooms.py
from __future__ import annotations
import logging
from typing import List, Optional, Set, Dict, Tuple
import time
import httpx

from ..config import CLASSROOM_BASE
from .s2s import s2s_token  # helper unificado

log = logging.getLogger("duels.classrooms")

_CACHE: Dict[Tuple[str, str], Tuple[float, List[str]]] = {}
_TTL_SEC = 60.0

def _get_cached(key: Tuple[str, str]) -> Optional[List[str]]:
    now = time.time()
    item = _CACHE.get(key)
    if not item:
        return None
    ts, data = item
    if now - ts > _TTL_SEC:
        _CACHE.pop(key, None)
        return None
    return data

def _set_cached(key: Tuple[str, str], value: List[str]):
    _CACHE[key] = (time.time(), value)

def _headers_for(user_id: Optional[str] = None) -> Dict[str, str]:
    token = s2s_token(authorities=["ROLE_INTERNAL"])
    h = {
        "Authorization": f"Bearer {token}",
        "X-Internal-Call": "duels-service",
        "X-Auth-Username": "duels-service",
        "X-Auth-Roles": "ROLE_INTERNAL",
        "Content-Type": "application/json",
    }
    if user_id:
        h["X-Act-As-User"] = str(user_id)
    return h

def my_classrooms_for(user_id: str) -> List[str]:
    key = ("mine", user_id)
    cached = _get_cached(key)
    if cached is not None:
        return cached

    if not CLASSROOM_BASE:
        log.warning("CLASSROOM_BASE vacío; devolviendo lista vacía.")
        return []

    url = f"{CLASSROOM_BASE}/internal/classrooms/mine"
    try:
        with httpx.Client(timeout=3.0, headers=_headers_for(user_id)) as c:
            r = c.get(url)
        if r.status_code != 200:
            log.warning("GET %s -> %s body=%s", url, r.status_code, r.text)
            return []
        data = r.json() or []
        items = [str(x) for x in data if x]
        _set_cached(key, items)
        return items
    except Exception as e:
        log.exception("Error llamando classroom mine: %s", e)
        return []

def classroom_students(classroom_id: str) -> List[str]:
    key = ("students", classroom_id)
    cached = _get_cached(key)
    if cached is not None:
        return cached

    if not CLASSROOM_BASE:
        log.warning("CLASSROOM_BASE vacío; devolviendo lista vacía.")
        return []

    url = f"{CLASSROOM_BASE}/internal/classrooms/{classroom_id}/students/ids"
    try:
        with httpx.Client(timeout=3.0, headers=_headers_for()) as c:
            r = c.get(url)
        if r.status_code != 200:
            log.warning("GET %s -> %s body=%s", url, r.status_code, r.text)
            return []
        data = r.json() or []
        items = [str(x) for x in data if x]
        _set_cached(key, items)
        return items
    except Exception as e:
        log.exception("Error llamando classroom students: %s", e)
        return []

def students_for_teacher(user_id: str, classroom_id: Optional[str] = None) -> Set[str]:
    if classroom_id:
        return set(classroom_students(classroom_id))

    cls = my_classrooms_for(user_id)
    if not cls:
        return set()
    out: Set[str] = set()
    for cid in cls:
        try:
            out.update(classroom_students(cid))
        except Exception:
            pass
    return out
