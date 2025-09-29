import json, logging, requests, os
from datetime import timedelta
from app.core.settings import settings

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
    try:
        # si usas S2S JWT, añade headers Authorization aquí
        resp = requests.get(url, timeout=2.0)
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
