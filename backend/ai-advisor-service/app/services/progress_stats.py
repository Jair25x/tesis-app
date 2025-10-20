# app/services/progress_stats.py
import json, logging, requests, os
from app.services.clients.s2s import mint_internal_jwt

logger = logging.getLogger(__name__)
PROGRESS_BASE = os.getenv("PROGRESS_BASE_URL", "http://progress-service:8083")

def _key(student_id, objective_id):
    return f"progress:stats:{student_id}:{objective_id}"

def get_stats_cached(rdb, student_id, objective_id, ttl=120):
    if rdb:
        try:
            raw = rdb.get(_key(student_id, objective_id))
            if raw:
                return json.loads(raw)
        except Exception:
            pass

    url = f"{PROGRESS_BASE}/internal/progress/students/{student_id}/objectives/{objective_id}/stats"
    headers = {
        "Authorization": f"Bearer {mint_internal_jwt()}",
        "X-Internal-Call": "ai-advisor-service",
        "X-Auth-Username": "ai-advisor-service",
        "X-Auth-Roles": "ROLE_INTERNAL",
    }
    try:
        resp = requests.get(url, headers=headers, timeout=2.0)
        resp.raise_for_status()
        data = resp.json() or {}
        if rdb:
            try:
                rdb.setex(_key(student_id, objective_id), ttl, json.dumps(data))
            except Exception:
                pass
        return data
    except Exception as e:
        logger.warning("progress_stats_fetch_error: %s", e)
        return None
